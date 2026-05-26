-- Kenya PAYE Tax Brackets (FY 2024/2025, monthly) - test version with explicit timestamps
INSERT INTO tax_brackets (id, tenant_id, country, band_number, lower_bound, upper_bound, rate, effective_from,
                          is_active, created_at, updated_at, version)
VALUES
    (gen_random_uuid(), 'SYSTEM', 'KE', 1, 0,         24000,  0.10,  '2024-07-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 2, 24000.01,  32300,  0.25,  '2024-07-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 3, 32300.01,  500000, 0.30,  '2024-07-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 4, 500000.01, 800000, 0.325, '2024-07-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 5, 800000.01, NULL,   0.35,  '2024-07-01', TRUE, NOW(), NOW(), 0);

-- Kenya Statutory Rates
INSERT INTO statutory_rates (id, tenant_id, country, rate_type, rate_value, limit_amount, secondary_limit,
                              fixed_amount, description, effective_from, is_active, created_at, updated_at, version)
VALUES
    (gen_random_uuid(), 'SYSTEM', 'KE', 'NSSF', 0.06, 7000, 36000, NULL,
     'NSSF contribution rate 6%. Tier I limit KES 7,000. Tier II limit KES 36,000.', '2024-02-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 'SHIF', 0.0275, NULL, NULL, NULL,
     'Social Health Insurance Fund at 2.75% of gross. Replaced NHIF October 2024.', '2024-10-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 'HOUSING_LEVY_EMPLOYEE', 0.015, NULL, NULL, NULL,
     'Affordable Housing Levy employee contribution 1.5% of gross.', '2024-03-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 'HOUSING_LEVY_EMPLOYER', 0.015, NULL, NULL, NULL,
     'Affordable Housing Levy employer contribution 1.5% of gross.', '2024-03-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 'NITA', 0, NULL, NULL, 50,
     'NITA levy KES 50 per employee per month. Employer only.', '2024-01-01', TRUE, NOW(), NOW(), 0);

-- Kenya Tax Reliefs
INSERT INTO tax_reliefs (id, tenant_id, country, relief_type, monthly_amount, rate, max_amount, description,
                         effective_from, is_active, created_at, updated_at, version)
VALUES
    (gen_random_uuid(), 'SYSTEM', 'KE', 'PERSONAL_RELIEF', 2400, NULL, NULL,
     'Personal relief KES 2,400 per month.', '2024-07-01', TRUE, NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'KE', 'INSURANCE_RELIEF', NULL, 0.15, 5000,
     'Insurance relief at 15% of SHIF contribution, capped at KES 5,000 per month.', '2024-10-01', TRUE, NOW(), NOW(), 0);
