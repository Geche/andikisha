# AndikishaHR SIT Execution Checklist

**Date:** ___________  
**Tester:** ___________  
**Docker Compose version:** ___________  
**Git tag / SHA:** ___________

## Pre-flight

- [ ] Full stack started: `docker compose -f docker-compose.infra.yml -f docker-compose.full.yml up -d`
- [ ] All 13 services showing `healthy`: `docker compose ps`
- [ ] Gateway health: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`
- [ ] Postman collection imported from `docs/api-contracts/AndikishaHR-Postman-Collection.json`

## Folder 00 — Bootstrap (run first)

| Step | Request | Expected | Pass? | Notes |
|------|---------|----------|-------|-------|
| 1 | Provision Super Admin | 201, `superAdminToken` set | | |
| 2 | Super Admin Login | 200, token refreshed | | |
| 3 | List Plans | 200, ≥1 plan, `planId` set | | |
| 4 | Provision Tenant | 201, `tenantId` set | | |
| 5 | Tenant Admin Login | 200, `tenantToken` set | | |

## Folder 03 — Employee Management

| Step | Request | Expected | Pass? | Notes |
|------|---------|----------|-------|-------|
| 1 | Create Employee | 201, employee created | | |
| 2 | KRA PIN uppercase | KRA PIN stored uppercase | | |
| 3 | List Employees (EMPLOYEE role) | 403 | | PII protection |

## Folder 04 — Payroll Flow

| Step | Request | Expected | Pass? | Notes |
|------|---------|----------|-------|-------|
| 1 | Initiate Payroll | 201, status=DRAFT | | |
| 2 | Calculate Payroll | 200, status=CALCULATED | | |
| 3 | Verify SHIF | gross × 2.75% ± KES 1 | | |
| 4 | Verify Housing Levy | gross × 1.5% ± KES 1 | | |
| 5 | Approve Payroll | 200, status=APPROVED | | |

## Folder 05 — Leave Flow

| Step | Request | Expected | Pass? | Notes |
|------|---------|----------|-------|-------|
| 1 | Submit Leave | 201, status=PENDING | | |
| 2 | Manager self-approval | 422 SELF_APPROVAL_PROHIBITED | | CB-10 |
| 3 | Approve Leave | 200, status=APPROVED | | |
| 4 | Balance deducted | available reduced by leave days | | |

## Folder 12 — Audit Trail

| Step | Request | Expected | Pass? | Notes |
|------|---------|----------|-------|-------|
| 1 | List audit entries | domain field populated | | |
| 2 | Unauthenticated access | 401 | | |

## UAT Sign-off

| Check | Result |
|-------|--------|
| Total requests executed | |
| Passed | |
| Failed | |
| Sign-off | |
