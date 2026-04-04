package com.andikisha.auth.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

@Getter
@Entity
@Table(name = "permissions")
public class Permission extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String resource;

    @Column(nullable = false, length = 30)
    private String action;

    @Column(nullable = false, length = 30)
    private String scope;

    protected Permission() {}

    public Permission(String tenantId, String resource, String action, String scope) {
        setTenantId(tenantId);
        this.resource = resource;
        this.action = action;
        this.scope = scope;
    }

    public String toPermissionString() {
        return resource + ":" + action + ":" + scope;
    }

}