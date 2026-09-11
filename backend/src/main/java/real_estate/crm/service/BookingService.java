package real_estate.crm.service;

import real_estate.crm.entity.Booking;
import real_estate.crm.entity.BookingStatus;
import real_estate.crm.entity.Lead;
import real_estate.crm.entity.LeadStatus;
import real_estate.crm.entity.Role;
import real_estate.crm.entity.Unit;
import real_estate.crm.entity.UnitStatus;
import real_estate.crm.entity.User;
import real_estate.crm.exception.BusinessException;
import real_estate.crm.exception.ResourceNotFoundException;
import real_estate.crm.repository.BookingRepository;
import real_estate.crm.repository.LeadRepository;
import real_estate.crm.repository.UnitRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final LeadRepository leadRepository;
    private final UnitRepository unitRepository;

    public BookingService(
            BookingRepository bookingRepository,
            LeadRepository leadRepository,
            UnitRepository unitRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.leadRepository = leadRepository;
        this.unitRepository = unitRepository;
    }

    @Transactional
    public Booking createBooking(
            Long leadId,
            Long unitId,
            User currentUser
    ) {

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Lead not found with id: " + leadId
                        )
                );

        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Unit not found with id: " + unitId
                        )
                );

        /*
         * Sales employees can only book their own leads.
         */
        if (currentUser.getRole() == Role.SALES_EMPLOYEE) {

            if (lead.getAssignedTo() == null
                    || !lead.getAssignedTo()
                    .getId()
                    .equals(currentUser.getId())) {

                throw new BusinessException(
                        "You can only book properties for your assigned leads"
                );
            }
        }

        /*
         * Prevent booking an already booked unit.
         */
        if (unit.getStatus() == UnitStatus.BOOKED) {

            throw new BusinessException(
                    "Unit " + unit.getUnitNumber()
                            + " is already booked"
            );
        }

        /*
         * Additional database-level booking check.
         */
        if (bookingRepository.existsByUnitIdAndStatus(
                unitId,
                BookingStatus.BOOKED
        )) {

            throw new BusinessException(
                    "This unit already has an active booking"
            );
        }

        /*
         * One lead can have only one active booking.
         */
        if (bookingRepository.existsByLeadIdAndStatus(
                leadId,
                BookingStatus.BOOKED
        )) {

            throw new BusinessException(
                    "This lead already has an active booking"
            );
        }

        if (lead.getStatus() == LeadStatus.BOOKED) {

            throw new BusinessException(
                    "This lead already has a booked property"
            );
        }

        /*
         * Create booking.
         */
        Booking booking = new Booking();

        booking.setLead(lead);
        booking.setUnit(unit);
        booking.setBookingDate(
                LocalDateTime.now()
        );
        booking.setStatus(
                BookingStatus.BOOKED
        );

        /*
         * Update unit status.
         */
        unit.setStatus(
                UnitStatus.BOOKED
        );

        unitRepository.save(unit);

        /*
         * Update lead status.
         */
        lead.setStatus(
                LeadStatus.BOOKED
        );

        leadRepository.save(lead);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {

        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Booking not found with id: " + id
                        )
                );
    }
}