-- Seed permissions for the SYSTEM tenant (template for new tenants)

INSERT INTO permissions (id, tenant_id, resource, action, scope)
VALUES
    -- Employee permissions
    (gen_random_uuid(), 'SYSTEM', 'employee', 'create', 'all'),
    (gen_random_uuid(), 'SYSTEM', 'employee', 'read',   'all'),
    (gen_random_uuid(), 'SYSTEM', 'employee', 'read',   'department'),
    (gen_random_uuid(), 'SYSTEM', 'employee', 'read',   'own'),
    (gen_random_uuid(), 'SYSTEM', 'employee', 'update', 'all'),
    (gen_random_uuid(), 'SYSTEM', 'employee', 'update', 'own'),
    (gen_random_uuid(), 'SYSTEM', 'employee', 'delete', 'all'),

    -- Payroll permissions
    (gen_random_uuid(), 'SYSTEM', 'payroll', 'create',  'all'),
    (gen_random_uuid(), 'SYSTEM', 'payroll', 'read',    'all'),
    (gen_random_uuid(), 'SYSTEM', 'payroll', 'read',    'own'),
    (gen_random_uuid(), 'SYSTEM', 'payroll', 'approve', 'all'),
    (gen_random_uuid(), 'SYSTEM', 'payroll', 'process', 'all'),

    -- Leave permissions
    (gen_random_uuid(), 'SYSTEM', 'leave', 'create',  'own'),
    (gen_random_uuid(), 'SYSTEM', 'leave', 'read',    'all'),
    (gen_random_uuid(), 'SYSTEM', 'leave', 'read',    'department'),
    (gen_random_uuid(), 'SYSTEM', 'leave', 'read',    'own'),
    (gen_random_uuid(), 'SYSTEM', 'leave', 'approve', 'all'),
    (gen_random_uuid(), 'SYSTEM', 'leave', 'approve', 'department'),

    -- Report permissions
    (gen_random_uuid(), 'SYSTEM', 'report', 'read', 'all'),
    (gen_random_uuid(), 'SYSTEM', 'report', 'read', 'department'),

    -- Tenant / admin permissions
    (gen_random_uuid(), 'SYSTEM', 'tenant', 'manage', 'all'),
    (gen_random_uuid(), 'SYSTEM', 'user',   'manage', 'all')

ON CONFLICT DO NOTHING;
