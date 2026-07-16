package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Entity
@Table(name = "lifecycle_workflow_instance")
public class LifecycleWorkflowInstance extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LifecycleType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LifecycleInstanceStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "initiated_by", nullable = false, length = 100)
    private String initiatedBy;

    @Column(name = "system_note", length = 500)
    private String systemNote;

    @OneToMany(mappedBy = "instance", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<LifecycleTask> tasks = new ArrayList<>();

    protected LifecycleWorkflowInstance() {}

    public static LifecycleWorkflowInstance start(String tenantId, UUID employeeId, UUID templateId,
                                                  LifecycleType type, String initiatedBy) {
        LifecycleWorkflowInstance i = new LifecycleWorkflowInstance();
        i.setTenantId(tenantId);
        i.employeeId = employeeId;
        i.templateId = templateId;
        i.type = type;
        i.status = LifecycleInstanceStatus.IN_PROGRESS;
        i.startedAt = Instant.now();
        i.initiatedBy = initiatedBy;
        return i;
    }

    /** Adds a task and sets both sides of the association. */
    public void addTask(LifecycleTask task) {
        task.setInstance(this);
        this.tasks.add(task);
    }

    public boolean isOpen() {
        return status == LifecycleInstanceStatus.PENDING
                || status == LifecycleInstanceStatus.IN_PROGRESS
                || status == LifecycleInstanceStatus.BLOCKED;
    }

    public boolean allTasksResolved() {
        return !tasks.isEmpty() && tasks.stream().allMatch(LifecycleTask::isResolved);
    }

    public void markCompleted(Instant at) {
        this.status = LifecycleInstanceStatus.COMPLETED;
        this.completedAt = at;
    }

    /** System-driven cancellation, e.g. when the employee is terminated directly. */
    public void cancelBySystem(String note) {
        this.status = LifecycleInstanceStatus.CANCELLED;
        this.systemNote = note;
        this.completedAt = Instant.now();
    }
}
