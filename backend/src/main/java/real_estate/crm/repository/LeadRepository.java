package real_estate.crm.repository;

import real_estate.crm.entity.Lead;
import real_estate.crm.entity.LeadStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    // =====================================================
    // ADMIN - SEARCH AND FILTER ALL LEADS
    // =====================================================

    @Query("""
        SELECT l FROM Lead l
        WHERE
        (
            :search IS NULL OR
            LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND
        (:status IS NULL OR l.status = :status)
        AND
        (:assignedToId IS NULL OR l.assignedTo.id = :assignedToId)
        """)
    List<Lead> searchAndFilter(
            @Param("search") String search,
            @Param("status") LeadStatus status,
            @Param("assignedToId") Long assignedToId
    );


    // =====================================================
    // SALES EMPLOYEE - SEARCH ASSIGNED LEADS
    // =====================================================

    @Query("""
        SELECT l FROM Lead l
        WHERE
        l.assignedTo.id = :employeeId
        AND
        (
            :search IS NULL OR
            LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        AND
        (:status IS NULL OR l.status = :status)
        """)
    List<Lead> searchAssignedLeads(
            @Param("search") String search,
            @Param("status") LeadStatus status,
            @Param("employeeId") Long employeeId
    );


    // =====================================================
    // DASHBOARD - COUNT LEADS BY STATUS
    // =====================================================

    long countByStatus(LeadStatus status);
}