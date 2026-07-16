package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.LifecycleTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LifecycleTaskRepository extends JpaRepository<LifecycleTask, UUID> {

    Optional<LifecycleTask> findByIdAndTenantId(UUID id, String tenantId);

    /**
     * The caller's own OPEN, EMPLOYEE-assigned onboarding tasks — what the /my UI renders.
     * Tenant-scoped and joined through the parent instance (tasks carry no employeeId of
     * their own; ownership is the instance's employeeId).
     */
    @Query("""
        SELECT t FROM LifecycleTask t
        WHERE t.tenantId = :tenantId
          AND t.instance.employeeId = :employeeId
          AND t.instance.type = com.andikisha.employee.domain.model.LifecycleType.ONBOARDING
          AND t.assigneeRole = com.andikisha.employee.domain.model.LifecycleAssigneeRole.EMPLOYEE
          AND t.status = com.andikisha.employee.domain.model.LifecycleTaskStatus.OPEN
        ORDER BY t.dueDate ASC NULLS LAST, t.createdAt ASC
        """)
    List<LifecycleTask> findOpenEmployeeOnboardingTasks(@Param("tenantId") String tenantId,
                                                        @Param("employeeId") UUID employeeId);
}
