package com.andikisha.leave.domain.repository;

import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.domain.model.LeaveRequestStatus;
import com.andikisha.leave.domain.model.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    Optional<LeaveRequest> findByIdAndTenantId(UUID id, String tenantId);

    Page<LeaveRequest> findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
            String tenantId, UUID employeeId, Pageable pageable);

    Page<LeaveRequest> findByTenantIdAndStatusOrderByCreatedAtDesc(
            String tenantId, LeaveRequestStatus status, Pageable pageable);

    Page<LeaveRequest> findByTenantIdOrderByCreatedAtDesc(
            String tenantId, Pageable pageable);

    @Query("""
        SELECT lr FROM LeaveRequest lr
        WHERE lr.tenantId = :tenantId
        AND lr.employeeId = :employeeId
        AND lr.status = :status
        AND lr.startDate <= :endDate
        AND lr.endDate >= :startDate
        """)
    List<LeaveRequest> findOverlappingByEmployee(
            String tenantId, UUID employeeId,
            LeaveRequestStatus status,
            LocalDate startDate, LocalDate endDate);

    /**
     * Sums the days of all PENDING requests for an employee in a given leave year.
     * Used at submit time to reserve balance against in-flight requests so that
     * concurrent submissions don't both appear to have sufficient balance.
     */
    @Query("""
        SELECT COALESCE(SUM(lr.days), 0) FROM LeaveRequest lr
        WHERE lr.tenantId = :tenantId
        AND lr.employeeId = :employeeId
        AND lr.leaveType = :leaveType
        AND lr.status = :status
        AND lr.startDate >= :yearStart
        AND lr.startDate <= :yearEnd
        """)
    BigDecimal sumDaysByStatus(String tenantId, UUID employeeId,
                               LeaveType leaveType, LeaveRequestStatus status,
                               LocalDate yearStart, LocalDate yearEnd);
}