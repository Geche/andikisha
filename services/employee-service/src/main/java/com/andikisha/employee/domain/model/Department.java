package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "departments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "name"}))
public class Department extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Department parent;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected Department() {}

    public static Department create(String tenantId, String name, String description,
                                    Department parent) {
        Department dept = new Department();
        dept.setTenantId(tenantId);
        dept.name = name;
        dept.description = description;
        dept.parent = parent;
        dept.active = true;
        return dept;
    }

    public void update(String name, String description) {
        if (name != null && !name.isBlank()) this.name = name;
        if (description != null) this.description = description;
    }

    public void deactivate() { this.active = false; }
    public void activate() { this.active = true; }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public Department getParent() { return parent; }
    public boolean isActive() { return active; }
}