package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.LifecycleInstanceStatus;
import com.andikisha.employee.domain.model.LifecycleType;
import com.andikisha.employee.domain.model.LifecycleWorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LifecycleWorkflowInstanceRepository
        extends JpaRepository<LifecycleWorkflowInstance, UUID> {

    Optional<LifecycleWorkflowInstance> findByIdAndTenantId(UUID id, String tenantId);

    List<LifecycleWorkflowInstance> findByTenantIdOrderByStartedAtDesc(String tenantId);

    List<LifecycleWorkflowInstance> findByTenantIdAndTypeOrderByStartedAtDesc(
            String tenantId, LifecycleType type);

    List<LifecycleWorkflowInstance> findByTenantIdAndStatusOrderByStartedAtDesc(
            String tenantId, LifecycleInstanceStatus status);

    List<LifecycleWorkflowInstance> findByTenantIdAndTypeAndStatusOrderByStartedAtDesc(
            String tenantId, LifecycleType type, LifecycleInstanceStatus status);

    List<LifecycleWorkflowInstance> findByTenantIdAndEmployeeIdOrderByStartedAtDesc(
            String tenantId, UUID employeeId);

    boolean existsByTenantIdAndEmployeeIdAndTypeAndStatusIn(
            String tenantId, UUID employeeId, LifecycleType type,
            List<LifecycleInstanceStatus> statuses);

    List<LifecycleWorkflowInstance> findByTenantIdAndEmployeeIdAndTypeAndStatusIn(
            String tenantId, UUID employeeId, LifecycleType type,
            List<LifecycleInstanceStatus> statuses);
}
