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
Taxable Income: 120,000 - 2,160 - 1,800 = 116,040.00
PAYE:           0-24K @10% = 2,400.00
                24K-32.333K @25% = 2,083.25
                32.333K-116,040 @30% = 25,111.80
                Gross PAYE = 29,595.05
                Less personal relief = -2,400.00 → PAYE = 27,195.05
Net Pay:        120,000 - 2,160 - 3,300 - 1,800 - 27,195.05 = 85,544.95
```
System payslip must match within KES 1.00 rounding tolerance.
