package real_estate.crm.repository;

import real_estate.crm.entity.Unit;
import real_estate.crm.entity.UnitStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface UnitRepository
        extends JpaRepository<Unit, Long> {

    List<Unit> findByStatus(
            UnitStatus status
    );

    List<Unit> findByBuildingId(
            Long buildingId
    );

    /*
     * Locks the unit row during a booking transaction.
     *
     * This prevents concurrent booking requests from
     * modifying the same unit simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT u
        FROM Unit u
        WHERE u.id = :id
        """)
    Optional<Unit> findByIdForUpdate(
            @Param("id") Long id
    );

    long countByStatus(
            UnitStatus status
    );
}