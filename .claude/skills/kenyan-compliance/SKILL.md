---
name: kenyan-compliance
description: Kenyan statutory compliance rules for payroll, tax, and employment law. Auto-applies when working on payroll-service, compliance-service, or any tax/deduction calculation logic.
---

# Kenya Payroll Compliance Reference

## PAYE Tax Brackets (Monthly, FY 2024/2025)

| Band | Monthly Income (KES) | Rate |
|------|---------------------|------|
| 1 | 0 - 24,000 | 10% |
| 2 | 24,001 - 32,333 | 25% |
| 3 | 32,334 - 500,000 | 30% |
| 4 | 500,001 - 800,000 | 32.5% |
| 5 | Above 800,000 | 35% |

Personal Relief: KES 2,400 per month
Insurance Relief: 15% of SHIF contribution, capped at KES 5,000 per month
Disability Exemption: First KES 150,000 monthly is exempt

## NSSF Contributions (Post-February 2024)

| Tier | Pensionable Earnings | Rate (Employee) | Rate (Employer) |
|------|---------------------|-----------------|-----------------|
| I | First KES 7,000 | 6% | 6% |
| II | KES 7,001 - 36,000 | 6% | 6% |

Employee max contribution: KES 2,160/month
Employer max contribution: KES 2,160/month

## SHIF (Social Health Insurance Fund)

Rate: 2.75% of gross salary
No upper limit
Effective: October 2024 (replaced NHIF)
Tax deductible

## Housing Levy (Affordable Housing Act)

Employee: 1.5% of gross salary
Employer: 1.5% of gross salary
Tax deductible from December 2024

## NITA Levy

Employer only: KES 50 per employee per month

## HELB Deductions

Varies per employee (loan-specific)
Employer remits on behalf of employee
Deducted from net pay after PAYE

## Calculation Order

1. Gross Pay = Basic + Allowances (Housing, Transport, Medical, etc.)
2. NSSF Employee Contribution (Tier I + Tier II)
3. Housing Levy (1.5% of gross)
4. Taxable Income = Gross - NSSF Employee - Housing Levy
5. Graduated PAYE on taxable income
6. Less: Personal Relief (KES 2,400)
7. Less: Insurance Relief (15% of SHIF, max KES 5,000)
8. Net PAYE = PAYE - Reliefs (minimum 0)
9. SHIF = 2.75% of gross
10. Total Deductions = PAYE + NSSF + SHIF + Housing Levy + HELB (if applicable)
11. Net Pay = Gross - Total Deductions

## Employment Act Leave Entitlements

| Type | Days | Notes |
|------|------|-------|
| Annual | 21 working days | After 12 months continuous service |
| Sick | 30 days (7 full + 23 half pay) | Requires medical certificate after 2 days |
| Maternity | 90 calendar days | Full pay, cannot be combined with annual leave |
| Paternity | 14 calendar days | Full pay |
| Compassionate | 3-5 days (policy) | Not in statute, company discretion |

## Overtime Rates

| Period | Rate |
|--------|------|
| Weekday (Mon-Fri) | 1.5x normal hourly rate |
| Weekend (Sat-Sun) | 2.0x normal hourly rate |
| Public Holiday | 2.0x normal hourly rate |

## Statutory Remittance Deadlines

| Obligation | Deadline |
|-----------|----------|
| PAYE | 9th of following month |
| NSSF | 15th of following month |
| SHIF | 9th of following month |
| Housing Levy | 9th of following month |
| NITA | 9th of following month |
| HELB | 15th of following month |

## Implementation Notes

- All monetary calculations use BigDecimal with RoundingMode.HALF_UP and scale 2.
- Tax rates should be configurable (database-driven) since Finance Acts change them annually.
- Store both current and historical rates with effective_date for audit compliance.
- The compliance-service owns rate definitions. Payroll-service queries rates via gRPC before calculating.
- Always generate a calculation breakdown per employee for audit trail.
