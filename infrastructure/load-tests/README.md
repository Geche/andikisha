# AndikishaHR Load Tests

k6 load tests for the two highest-risk flows.

## Prerequisites

- k6 installed: https://grafana.com/docs/k6/latest/set-up/install-k6/
- Full stack running: `cd infrastructure/docker && docker compose -f docker-compose.infra.yml -f docker-compose.full.yml up -d`
- `TENANT_ID` bootstrapped via the Super Admin provisioning flow

## Running

### Payroll flow (primary SLA test)
```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  -e TENANT_ID=<tenant-uuid> \
  -e TENANT_EMAIL=admin@acmekenya.co.ke \
  -e TENANT_PASSWORD=TenantAdmin@2026! \
  infrastructure/load-tests/k6/payroll-flow.js
```

### Leave concurrency stress test
```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  -e TENANT_ID=<tenant-uuid> \
  infrastructure/load-tests/k6/leave-flow.js
```

## Pass/Fail Thresholds

| Metric | Threshold |
|--------|-----------|
| API p95 response time | < 2,000 ms |
| Payroll calculation p95 | < 10,000 ms |
| Error rate | < 1% |
| Payroll approval success | > 99% |

## Kenyan Payroll Manual Verification (UAT-5)

For John Kamau (gross KES 120,000):

```
NSSF:           Tier I  7,000 × 6%  =  420.00
                Tier II 29,000 × 6% = 1,740.00  → Total 2,160.00
SHIF:           120,000 × 2.75%     = 3,300.00
Housing Levy:   120,000 × 1.5%      = 1,800.00
Taxable Income: 120,000 - 2,160 = 117,840.00 (Housing Levy does NOT reduce taxable income per Finance Act 2023)
PAYE:           0-24K @10% = 2,400.00
                24K-32.3K @25% = 2,075.00
                32.3K-117,840 @30% = 25,662.00
                Gross PAYE = 30,137.00
                Less personal relief = -2,400.00 → PAYE = 27,737.00
Net Pay:        120,000 - 2,160 - 3,300 - 1,800 - 27,737.00 = 85,003.00
```
System payslip must match within KES 1.00 rounding tolerance.
