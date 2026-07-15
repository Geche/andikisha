package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Entity
@Table(name = "lifecycle_task")
public class LifecycleTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instance_id", nullable = false)
    private LifecycleWorkflowInstance instance;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignee_role", nullable = false, length = 20)
    private LifecycleAssigneeRole assigneeRole;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LifecycleTaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_type", nullable = false, length = 20)
    private TaskCompletionType completionType;

    @Column(name = "completed_by", length = 100)
    private String completedBy;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "document_id")
    private UUID documentId;

    protected LifecycleTask() {}

    public static LifecycleTask create(String tenantId, String title, String description,
                                       LifecycleAssigneeRole assigneeRole, LocalDate dueDate,
                                       TaskCompletionType completionType) {
        LifecycleTask t = new LifecycleTask();
        t.setTenantId(tenantId);
        t.title = title;
        t.description = description;
        t.assigneeRole = assigneeRole;
        t.dueDate = dueDate;
        t.completionType = completionType;
        t.status = LifecycleTaskStatus.OPEN;
        return t;
    }

    void setInstance(LifecycleWorkflowInstance instance) {
        this.instance = instance;
    }

    public boolean isOpen() {
        return status == LifecycleTaskStatus.OPEN;
    }

    public boolean isResolved() {
        return status == LifecycleTaskStatus.DONE || status == LifecycleTaskStatus.SKIPPED;
    }

    public void complete(String completedBy, UUID documentId) {
        if (!isOpen()) {
            throw new BusinessRuleException("TASK_NOT_OPEN",
                    "Only an open task can be completed");
        }
        this.status = LifecycleTaskStatus.DONE;
        this.completedBy = completedBy;
        this.completedAt = Instant.now();
        if (documentId != null) {
            this.documentId = documentId;
        }
    }

    public void skip(String skippedBy) {
        if (!isOpen()) {
            throw new BusinessRuleException("TASK_NOT_OPEN",
                    "Only an open task can be skipped");
        }
        this.status = LifecycleTaskStatus.SKIPPED;
        this.completedBy = skippedBy;
        this.completedAt = Instant.now();
    }
}
