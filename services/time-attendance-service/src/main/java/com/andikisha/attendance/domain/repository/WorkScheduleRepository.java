package com.andikisha.attendance.domain.repository;

import com.andikisha.attendance.domain.model.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, UUID> {

    Optional<WorkSchedule> findByTenantIdAndDefaultScheduleTrue(String tenantId);

    List<WorkSchedule> findByTenantIdAndActiveTrue(String tenantId);

    Optional<WorkSchedule> findByIdAndTenantId(UUID id, String tenantId);
}