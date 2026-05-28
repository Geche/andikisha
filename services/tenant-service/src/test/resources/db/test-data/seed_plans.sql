INSERT INTO plans (id, tenant_id, name, tier, monthly_price_amount, monthly_price_currency,
                   max_employees, max_admins, payroll_enabled, leave_enabled,
                   attendance_enabled, documents_enabled, analytics_enabled,
                   ewa_enabled, multi_country_enabled, is_active,
                   created_at, updated_at, version)
VALUES
    (gen_random_uuid(), 'SYSTEM', 'Starter', 'STARTER', 2500, 'KES',
     25, 2, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'Professional', 'PROFESSIONAL', 7500, 'KES',
     100, 5, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'Enterprise', 'ENTERPRISE', 15000, 'KES',
     500, 20, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), NOW(), 0);
