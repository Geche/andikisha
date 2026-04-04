package com.andikisha.auth.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

@Getter
@Entity
@Table(name = "role_permissions",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "role", "permission_id"}
        ))
public class RolePermission extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    protected RolePermission() {}

    public RolePermission(String tenantId, Role role, Permission permission) {
        setTenantId(tenantId);
        this.role = role;
        this.permission = permission;
    }
}
