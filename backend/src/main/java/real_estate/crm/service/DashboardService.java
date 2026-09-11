package real_estate.crm.service;

import real_estate.crm.dto.DashboardResponse;
import real_estate.crm.entity.BookingStatus;
import real_estate.crm.entity.LeadStatus;
import real_estate.crm.entity.UnitStatus;
import real_estate.crm.repository.BookingRepository;
import real_estate.crm.repository.LeadRepository;
import real_estate.crm.repository.UnitRepository;

import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final LeadRepository leadRepository;
    private final UnitRepository unitRepository;
    private final BookingRepository bookingRepository;


    public DashboardService(
            LeadRepository leadRepository,
            UnitRepository unitRepository,
            BookingRepository bookingRepository) {

        this.leadRepository = leadRepository;
        this.unitRepository = unitRepository;
        this.bookingRepository = bookingRepository;
    }


    // =========================================================
    // GET DASHBOARD
    // =========================================================

    public DashboardResponse getDashboard() {

        DashboardResponse response =
                new DashboardResponse();


        // =====================================================
        // LEADS
        // =====================================================

        response.setTotalLeads(
                leadRepository.count()
        );

        response.setNewLeads(
                leadRepository.countByStatus(
                        LeadStatus.NEW
                )
        );

        response.setContactedLeads(
                leadRepository.countByStatus(
                        LeadStatus.CONTACTED
                )
        );

        response.setSiteVisitLeads(
                leadRepository.countByStatus(
                        LeadStatus.SITE_VISIT
                )
        );

        response.setInterestedLeads(
                leadRepository.countByStatus(
                        LeadStatus.INTERESTED
                )
        );

        response.setNegotiationLeads(
                leadRepository.countByStatus(
                        LeadStatus.NEGOTIATION
                )
        );

        response.setBookedLeads(
                leadRepository.countByStatus(
                        LeadStatus.BOOKED
                )
        );

        response.setLostLeads(
                leadRepository.countByStatus(
                        LeadStatus.LOST
                )
        );


        // =====================================================
        // UNITS
        // =====================================================

        response.setTotalUnits(
                unitRepository.count()
        );

        response.setAvailableUnits(
                unitRepository.countByStatus(
                        UnitStatus.AVAILABLE
                )
        );

        response.setBookedUnits(
                unitRepository.countByStatus(
                        UnitStatus.BOOKED
                )
        );


        // =====================================================
        // BOOKINGS
        // =====================================================

        response.setTotalBookings(
                bookingRepository.count()
        );

        response.setActiveBookings(
                bookingRepository.countByStatus(
                        BookingStatus.BOOKED
                )
        );

        response.setCancelledBookings(
                bookingRepository.countByStatus(
                        BookingStatus.CANCELLED
                )
        );


        return response;
    }
}