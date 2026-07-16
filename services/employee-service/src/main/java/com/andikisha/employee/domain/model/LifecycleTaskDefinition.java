package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Getter
@Entity
@Table(name = "lifecycle_task_definition")
public class LifecycleTaskDefinition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private LifecycleWorkflowTemplate template;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignee_role", nullable = false, length = 20)
    private LifecycleAssigneeRole assigneeRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_type", nullable = false, length = 20)
    private TaskCompletionType completionType;

    @Column(name = "due_offset_days")
    private Integer dueOffsetDays;

    protected LifecycleTaskDefinition() {}

    public static LifecycleTaskDefinition create(String tenantId, int orderIndex, String title,
                                                 String description, LifecycleAssigneeRole assigneeRole,
                                                 TaskCompletionType completionType, Integer dueOffsetDays) {
        LifecycleTaskDefinition d = new LifecycleTaskDefinition();
        d.setTenantId(tenantId);
        d.orderIndex = orderIndex;
        d.title = title;
        d.description = description;
        d.assigneeRole = assigneeRole;
        d.completionType = completionType;
        d.dueOffsetDays = dueOffsetDays;
        return d;
    }

    void setTemplate(LifecycleWorkflowTemplate template) {
        this.template = template;
    }
}
