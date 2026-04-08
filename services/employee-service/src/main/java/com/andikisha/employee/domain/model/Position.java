package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "positions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "title"}))
public class Position extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "grade_level", length = 20)
    private String gradeLevel;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected Position() {}

    public static Position create(String tenantId, String title,
                                  String description, String gradeLevel) {
        Position pos = new Position();
        pos.setTenantId(tenantId);
        pos.title = title;
        pos.description = description;
        pos.gradeLevel = gradeLevel;
        pos.active = true;
        return pos;
    }

    public void update(String title, String description, String gradeLevel) {
        if (title != null && !title.isBlank()) this.title = title;
        if (description != null) this.description = description;
        if (gradeLevel != null) this.gradeLevel = gradeLevel;
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getGradeLevel() { return gradeLevel; }
    public boolean isActive() { return active; }
}