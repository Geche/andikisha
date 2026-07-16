package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Entity
@Table(name = "lifecycle_workflow_template")
public class LifecycleWorkflowTemplate extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LifecycleType type;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @Convert(converter = EmploymentTypeSetConverter.class)
    @Column(name = "applicable_employment_types", length = 200)
    private Set<EmploymentType> applicableEmploymentTypes = new LinkedHashSet<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<LifecycleTaskDefinition> taskDefinitions = new ArrayList<>();

    protected LifecycleWorkflowTemplate() {}

    public static LifecycleWorkflowTemplate create(String tenantId, LifecycleType type,
                                                   String name,
                                                   Set<EmploymentType> applicableEmploymentTypes) {
        LifecycleWorkflowTemplate t = new LifecycleWorkflowTemplate();
        t.setTenantId(tenantId);
        t.type = type;
        t.name = name;
        t.active = true;
        t.applicableEmploymentTypes = applicableEmploymentTypes != null
                ? new LinkedHashSet<>(applicableEmploymentTypes) : new LinkedHashSet<>();
        return t;
    }

    /** Adds a task definition and sets both sides of the association. */
    public void addTaskDefinition(LifecycleTaskDefinition definition) {
        definition.setTemplate(this);
        this.taskDefinitions.add(definition);
    }

    public void rename(String name) {
        if (name != null && !name.isBlank()) this.name = name;
    }

    public void updateApplicableTypes(Set<EmploymentType> types) {
        this.applicableEmploymentTypes = types != null
                ? new LinkedHashSet<>(types) : new LinkedHashSet<>();
    }

    /** Removes all task definitions (orphanRemoval deletes the rows on flush). */
    public void clearTaskDefinitions() {
        this.taskDefinitions.clear();
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }
}
