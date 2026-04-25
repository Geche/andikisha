package com.andikisha.analytics.domain.repository;

import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceAnalyticsRepository extends JpaRepository<AttendanceAnalytics, UUID> {

    Optional<AttendanceAnalytics> findByTenantIdAndPeriod(String tenantId, String period);

    List<AttendanceAnalytics> findByTenantIdOrderByPeriodDesc(String tenantId);
}