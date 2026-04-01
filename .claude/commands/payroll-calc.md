---
description: Validate Kenyan payroll calculations by computing PAYE, NSSF, SHIF, Housing Levy, and net pay for a given gross salary. Use this to verify that the KenyanTaxCalculator implementation is correct.
---

Calculate the full Kenyan payroll deduction breakdown for a given gross salary.

## Input

Ask the user for:
1. Monthly gross salary (KES)
2. Whether employee has HELB deductions (and amount if yes)
3. Whether employee qualifies for disability exemption

## Calculation Steps

Apply the rates from the kenyan-compliance skill in this exact order:

1. NSSF Employee Contribution
   - Tier I: 6% of first KES 7,000 = KES 420
   - Tier II: 6% of (min(gross, 36,000) - 7,000) if gross > 7,000
   - Total NSSF capped at KES 2,160

2. Housing Levy Employee: 1.5% of gross

3. Taxable Income = Gross - NSSF Employee - Housing Levy

4. PAYE (graduated):
   - First 24,000 at 10%
   - 24,001 - 32,333 at 25%
   - 32,334 - 500,000 at 30%
   - 500,001 - 800,000 at 32.5%
   - Above 800,000 at 35%

5. SHIF = 2.75% of gross

6. Reliefs:
   - Personal Relief: KES 2,400
   - Insurance Relief: 15% of SHIF, max KES 5,000

7. Net PAYE = PAYE - Personal Relief - Insurance Relief (min 0)

8. Total Deductions = Net PAYE + NSSF + SHIF + Housing Levy + HELB

9. Net Pay = Gross - Total Deductions

## Output

Show a payslip-style breakdown:

```
PAYROLL CALCULATION - KES {gross}
================================
Gross Pay:                {gross}

Deductions:
  PAYE:                   {paye}
  NSSF (Tier I + II):     {nssf}
  SHIF:                   {shif}
  Housing Levy:           {housing}
  HELB:                   {helb}
  Total Deductions:       {total_deductions}

Reliefs Applied:
  Personal Relief:        2,400
  Insurance Relief:       {insurance_relief}

Net Pay:                  {net_pay}
================================
```

Then compare this against the KenyanTaxCalculator.java implementation in the payroll-service if it exists, and flag any discrepancies.
