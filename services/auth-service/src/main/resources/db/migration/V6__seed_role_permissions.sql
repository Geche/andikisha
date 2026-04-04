-- Seed role-permission mappings for the SYSTEM tenant template
-- SUPER_ADMIN and ADMIN bypass checks in code, no entries needed

-- HR_MANAGER: Full HR + payroll visibility, approvals
INSERT INTO role_permissions (id, tenant_id, role, permission_id)
SELECT gen_random_uuid(), 'SYSTEM', 'HR_MANAGER', p.id
FROM permissions p
WHERE p.tenant_id = 'SYSTEM'
  AND CONCAT(p.resource, ':', p.action, ':', p.scope) IN ('employee:create:all',
                                                          'employee:read:all',
                                                          'employee:update:all',
                                                          'employee:delete:all',
                                                          'payroll:read:all',
                                                          'payroll:approve:all',
                                                          'leave:read:all',
                                                          'leave:approve:all',
                                                          'report:read:all',
                                                          'user:manage:all'
    )
    ON CONFLICT DO NOTHING;

-- PAYROLL_OFFICER: Payroll processing only, no employee management
INSERT INTO role_permissions (id, tenant_id, role, permission_id)
SELECT gen_random_uuid(), 'SYSTEM', 'PAYROLL_OFFICER', p.id
FROM permissions p
WHERE p.tenant_id = 'SYSTEM'
  AND CONCAT(p.resource, ':', p.action, ':', p.scope) IN (
                                                          'employee:read:all',
                                                          'payroll:create:all',
                                                          'payroll:read:all',
                                                          'payroll:process:all',
                                                          'report:read:all'
    )
    ON CONFLICT DO NOTHING;

-- HR: Employee management and leave, no payroll processing
INSERT INTO role_permissions (id, tenant_id, role, permission_id)
SELECT gen_random_uuid(), 'SYSTEM', 'HR', p.id
FROM permissions p
WHERE p.tenant_id = 'SYSTEM'
  AND CONCAT(p.resource, ':', p.action, ':', p.scope) IN (
                                                          'employee:create:all',
                                                          'employee:read:all',
                                                          'employee:update:all',
                                                          'leave:read:all',
                                                          'leave:approve:all',
                                                          'report:read:all'
    )
    ON CONFLICT DO NOTHING;

-- LINE_MANAGER: Department-scoped approvals and visibility
INSERT INTO role_permissions (id, tenant_id, role, permission_id)
SELECT gen_random_uuid(), 'SYSTEM', 'LINE_MANAGER', p.id
FROM permissions p
WHERE p.tenant_id = 'SYSTEM'
  AND CONCAT(p.resource, ':', p.action, ':', p.scope) IN (
                                                          'employee:read:department',
                                                          'leave:read:department',
                                                          'leave:approve:department',
                                                          'report:read:department'
    )
    ON CONFLICT DO NOTHING;

-- EMPLOYEE: Self-service only
INSERT INTO role_permissions (id, tenant_id, role, permission_id)
SELECT gen_random_uuid(), 'SYSTEM', 'EMPLOYEE', p.id
FROM permissions p
WHERE p.tenant_id = 'SYSTEM'
  AND CONCAT(p.resource, ':', p.action, ':', p.scope) IN (
                                                          'employee:read:own',
                                                          'employee:update:own',
                                                          'payroll:read:own',
                                                          'leave:create:own',
                                                          'leave:read:own'
    )
    ON CONFLICT DO NOTHING;