package com.andikisha.analytics.domain.repository;

import com.andikisha.analytics.domain.model.LeaveAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeaveAnalyticsRepository extends JpaRepository<LeaveAnalytics, UUID> {

    Optional<LeaveAnalytics> findByTenantIdAndPeriodAndLeaveType(
            String tenantId, String period, String leaveType);

    List<LeaveAnalytics> findByTenantIdAndPeriodOrderByLeaveTypeAsc(
            String tenantId, String period);

    List<LeaveAnalytics> findByTenantIdAndLeaveTypeOrderByPeriodDesc(
            String tenantId, String leaveType);
}