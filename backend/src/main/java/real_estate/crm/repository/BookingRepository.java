package real_estate.crm.repository;

import real_estate.crm.entity.Booking;
import real_estate.crm.entity.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    boolean existsByUnitIdAndStatus(
            Long unitId,
            BookingStatus status
    );

    boolean existsByLeadIdAndStatus(
            Long leadId,
            BookingStatus status
    );

    long countByStatus(
            BookingStatus status
    );

    List<Booking> findByStatus(
            BookingStatus status
    );
}