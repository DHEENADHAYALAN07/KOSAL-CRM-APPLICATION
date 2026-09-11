package real_estate.crm.controller;

import real_estate.crm.entity.Booking;
import real_estate.crm.entity.Role;
import real_estate.crm.entity.User;
import real_estate.crm.repository.UserRepository;
import real_estate.crm.service.BookingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(
            BookingService bookingService,
            UserRepository userRepository
    ) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<Booking> createBooking(
            @RequestParam Long leadId,
            @RequestParam Long unitId,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        Booking booking =
                bookingService.createBooking(
                        leadId,
                        unitId,
                        currentUser
                );

        return ResponseEntity.ok(booking);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<List<Booking>> getAllBookings(
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        List<Booking> bookings =
                bookingService.getAllBookings();

        /*
         * Admin can see all bookings.
         *
         * Sales employee can only see bookings
         * belonging to their assigned leads.
         */
        if (currentUser.getRole() ==
                Role.SALES_EMPLOYEE) {

            bookings = bookings.stream()
                    .filter(booking ->
                            booking.getLead()
                                    .getAssignedTo() != null
                                    &&
                            booking.getLead()
                                    .getAssignedTo()
                                    .getId()
                                    .equals(currentUser.getId())
                    )
                    .toList();
        }

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_EMPLOYEE')")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        Booking booking =
                bookingService.getBookingById(id);

        if (currentUser.getRole() ==
                Role.SALES_EMPLOYEE) {

            if (booking.getLead().getAssignedTo() == null
                    || !booking.getLead()
                    .getAssignedTo()
                    .getId()
                    .equals(currentUser.getId())) {

                return ResponseEntity
                        .status(403)
                        .build();
            }
        }

        return ResponseEntity.ok(booking);
    }

    private User getCurrentUser(
            Authentication authentication
    ) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }
}