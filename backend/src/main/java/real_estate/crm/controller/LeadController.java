package real_estate.crm.controller;

import real_estate.crm.dto.AssignedUserRequest;
import real_estate.crm.dto.LeadRequest;
import real_estate.crm.dto.LeadResponse;
import real_estate.crm.entity.Lead;
import real_estate.crm.entity.LeadStatus;
import real_estate.crm.entity.Role;
import real_estate.crm.entity.User;
import real_estate.crm.exception.ResourceNotFoundException;
import real_estate.crm.repository.UserRepository;
import real_estate.crm.service.LeadService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;
    private final UserRepository userRepository;

    public LeadController(
            LeadService leadService,
            UserRepository userRepository
    ) {
        this.leadService = leadService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<LeadResponse> createLead(
            @Valid @RequestBody LeadRequest request,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        Lead lead = convertToEntity(request);

        Lead savedLead;

        if (currentUser.getRole() == Role.ADMIN) {

            savedLead =
                    leadService.createLeadAsAdmin(
                            lead
                    );

        } else {

            savedLead =
                    leadService.createLeadAsSalesEmployee(
                            lead,
                            currentUser
                    );
        }

        return ResponseEntity.ok(
                new LeadResponse(savedLead)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<List<LeadResponse>> getAllLeads(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            LeadStatus status,

            @RequestParam(required = false)
            Long assignedToId,

            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        List<Lead> leads;

        if (currentUser.getRole() == Role.ADMIN) {

            leads =
                    leadService.searchAndFilter(
                            search,
                            status,
                            assignedToId
                    );

        } else {

            leads =
                    leadService.searchAssignedLeads(
                            search,
                            status,
                            currentUser.getId()
                    );
        }

        List<LeadResponse> response =
                leads.stream()
                        .map(LeadResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<LeadResponse> getLeadById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        Lead lead =
                leadService.getLeadForUser(
                        id,
                        currentUser
                );

        return ResponseEntity.ok(
                new LeadResponse(lead)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<LeadResponse> updateLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadRequest request,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        Lead lead = convertToEntity(request);

        Lead updatedLead;

        if (currentUser.getRole() == Role.ADMIN) {

            updatedLead =
                    leadService.updateLeadAsAdmin(
                            id,
                            lead
                    );

        } else {

            updatedLead =
                    leadService.updateLeadAsSalesEmployee(
                            id,
                            lead,
                            currentUser
                    );
        }

        return ResponseEntity.ok(
                new LeadResponse(updatedLead)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteLead(
            @PathVariable Long id
    ) {

        leadService.deleteLead(id);

        return ResponseEntity.ok(
                "Lead deleted successfully"
        );
    }

    private User getCurrentUser(
            Authentication authentication
    ) {

        return userRepository.findByEmail(
                authentication.getName()
        ).orElseThrow(
                () -> new ResourceNotFoundException(
                        "Authenticated user not found"
                )
        );
    }

    private Lead convertToEntity(
            LeadRequest request
    ) {

        Lead lead = new Lead();

        lead.setName(
                request.getName()
        );

        lead.setEmail(
                request.getEmail()
        );

        lead.setPhone(
                request.getPhone()
        );

        lead.setPropertyType(
                request.getPropertyType()
        );

        lead.setStatus(
                request.getStatus()
        );

        lead.setNotes(
                request.getNotes()
        );

        lead.setFollowUpDate(
                request.getFollowUpDate()
        );

        if (request.getAssignedTo() != null) {

            AssignedUserRequest assignedUser =
                    request.getAssignedTo();

            User user = new User();

            user.setId(
                    assignedUser.getId()
            );

            lead.setAssignedTo(user);
        }

        return lead;
    }
}