package com.andikisha.auth.domain.repository;

import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {

    List<RolePermission> findByTenantIdAndRole(String tenantId, Role role);

    @Query("""
        SELECT CONCAT(p.resource, ':', p.action, ':', p.scope)
        FROM RolePermission rp
        JOIN rp.permission p
        WHERE rp.tenantId = :tenantId AND rp.role = :role
        """)
    List<String> findPermissionStringsByTenantIdAndRole(String tenantId, Role role);

    @Query("""
        SELECT CASE WHEN COUNT(rp) > 0 THEN true ELSE false END
        FROM RolePermission rp
        JOIN rp.permission p
        WHERE rp.tenantId = :tenantId
        AND rp.role = :role
        AND p.resource = :resource
        AND p.action = :action
        AND (p.scope = :scope OR p.scope = 'all')
        """)
    boolean hasPermission(String tenantId, Role role,
                          String resource, String action, String scope);
}