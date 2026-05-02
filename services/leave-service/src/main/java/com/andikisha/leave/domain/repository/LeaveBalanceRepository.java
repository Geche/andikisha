package com.andikisha.leave.domain.repository;

import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    List<LeaveBalance> findByTenantIdAndEmployeeIdAndYear(
            String tenantId, UUID employeeId, int year);

    List<LeaveBalance> findByTenantIdAndEmployeeIdInAndYear(
            String tenantId, List<UUID> employeeIds, int year);

    Optional<LeaveBalance> findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
            String tenantId, UUID employeeId, LeaveType leaveType, int year);

    @Modifying
    @Query("""
        UPDATE LeaveBalance lb SET lb.frozen = true
        WHERE lb.tenantId = :tenantId AND lb.employeeId = :employeeId
        """)
    void freezeAllByEmployee(String tenantId, UUID employeeId);

    @Query("""
        SELECT lb FROM LeaveBalance lb
        WHERE lb.tenantId = :tenantId AND lb.year = :year AND lb.frozen = false
        """)
    List<LeaveBalance> findActiveBalancesForYear(String tenantId, int year);
}