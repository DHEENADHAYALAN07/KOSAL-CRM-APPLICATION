package real_estate.crm.service;

import real_estate.crm.entity.Lead;
import real_estate.crm.entity.LeadStatus;
import real_estate.crm.entity.Role;
import real_estate.crm.entity.User;
import real_estate.crm.exception.BusinessException;
import real_estate.crm.exception.ResourceNotFoundException;
import real_estate.crm.repository.LeadRepository;
import real_estate.crm.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public LeadService(
            LeadRepository leadRepository,
            UserRepository userRepository
    ) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE LEAD - ADMIN
    // =====================================================

    public Lead createLeadAsAdmin(
            Lead lead
    ) {

        if (lead.getStatus() == null) {
            lead.setStatus(LeadStatus.NEW);
        }

        assignSalesEmployee(lead);

        return leadRepository.save(lead);
    }


    // =====================================================
    // CREATE LEAD - SALES EMPLOYEE
    // =====================================================

    public Lead createLeadAsSalesEmployee(
            Lead lead,
            User currentUser
    ) {

        if (lead.getStatus() == null) {
            lead.setStatus(LeadStatus.NEW);
        }

        /*
         * Sales employees cannot choose another employee.
         * The lead is automatically assigned to the
         * currently logged-in sales employee.
         */

        lead.setAssignedTo(currentUser);

        return leadRepository.save(lead);
    }


    // =====================================================
    // ADMIN - SEARCH ALL LEADS
    // =====================================================

    public List<Lead> searchAndFilter(
            String search,
            LeadStatus status,
            Long assignedToId
    ) {

        if (search != null && search.isBlank()) {
            search = null;
        }

        return leadRepository.searchAndFilter(
                search,
                status,
                assignedToId
        );
    }


    // =====================================================
    // SALES EMPLOYEE - SEARCH OWN LEADS
    // =====================================================

    public List<Lead> searchAssignedLeads(
            String search,
            LeadStatus status,
            Long employeeId
    ) {

        if (search != null && search.isBlank()) {
            search = null;
        }

        return leadRepository.searchAssignedLeads(
                search,
                status,
                employeeId
        );
    }


    // =====================================================
    // GET LEAD
    // =====================================================

    public Lead getLeadById(
            Long id
    ) {

        return leadRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Lead not found with id: " + id
                        )
                );
    }


    // =====================================================
    // GET LEAD WITH OWNERSHIP CHECK
    // =====================================================

    public Lead getLeadForUser(
            Long id,
            User currentUser
    ) {

        Lead lead = getLeadById(id);

        // Admin can access every lead
        if (currentUser.getRole() == Role.ADMIN) {
            return lead;
        }

        // Sales employee can only access assigned leads
        if (lead.getAssignedTo() == null
                || !lead.getAssignedTo()
                .getId()
                .equals(currentUser.getId())) {

            throw new BusinessException(
                    "You are not authorized to access this lead"
            );
        }

        return lead;
    }


    // =====================================================
    // UPDATE LEAD - ADMIN
    // =====================================================

    public Lead updateLeadAsAdmin(
            Long id,
            Lead updatedLead
    ) {

        Lead existingLead =
                getLeadById(id);

        updateLeadFields(
                existingLead,
                updatedLead
        );

        return leadRepository.save(
                existingLead
        );
    }


    // =====================================================
    // UPDATE LEAD - SALES EMPLOYEE
    // =====================================================

    public Lead updateLeadAsSalesEmployee(
            Long id,
            Lead updatedLead,
            User currentUser
    ) {

        Lead existingLead =
                getLeadForUser(
                        id,
                        currentUser
                );

        updateLeadFields(
                existingLead,
                updatedLead
        );

        /*
         * Sales employee cannot transfer
         * the lead to another employee.
         */

        existingLead.setAssignedTo(
                currentUser
        );

        return leadRepository.save(
                existingLead
        );
    }


    // =====================================================
    // UPDATE COMMON FIELDS
    // =====================================================

    private void updateLeadFields(
            Lead existingLead,
            Lead updatedLead
    ) {

        existingLead.setName(
                updatedLead.getName()
        );

        existingLead.setEmail(
                updatedLead.getEmail()
        );

        existingLead.setPhone(
                updatedLead.getPhone()
        );

        existingLead.setPropertyType(
                updatedLead.getPropertyType()
        );

        if (updatedLead.getStatus() != null) {

            existingLead.setStatus(
                    updatedLead.getStatus()
            );
        }

        existingLead.setNotes(
                updatedLead.getNotes()
        );

        existingLead.setFollowUpDate(
                updatedLead.getFollowUpDate()
        );
    }


    // =====================================================
    // DELETE LEAD
    // =====================================================

    public void deleteLead(
            Long id
    ) {

        if (!leadRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Lead not found with id: " + id
            );
        }

        leadRepository.deleteById(id);
    }


    // =====================================================
    // ASSIGN SALES EMPLOYEE
    // =====================================================

    private void assignSalesEmployee(
            Lead lead
    ) {

        if (lead.getAssignedTo() == null
                || lead.getAssignedTo().getId() == null) {

            /*
             * Admin is allowed to create an unassigned lead.
             */

            return;
        }

        Long employeeId =
                lead.getAssignedTo().getId();

        User salesEmployee =
                getSalesEmployee(employeeId);

        lead.setAssignedTo(
                salesEmployee
        );
    }


    // =====================================================
    // GET SALES EMPLOYEE
    // =====================================================

    private User getSalesEmployee(
            Long userId
    ) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException(
                                        "User not found with id: "
                                                + userId
                                )
                        );

        if (user.getRole()
                != Role.SALES_EMPLOYEE) {

            throw new BusinessException(
                    "Lead can only be assigned to a sales employee"
            );
        }

        return user;
    }
}