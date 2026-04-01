# Recommended Implementation Order — AndikishaHR

## Phase 0: Shared Foundations (unblocks everything)

1. `shared/andikisha-common` — BaseEntity, Money, TenantContext, shared exceptions
2. `shared/andikisha-events` — Domain event base class + core event classes
3. `shared/andikisha-proto` — .proto definitions for all gRPC service contracts

## Phase 1: Foundation Services

4. `tenant-service` — All services resolve tenant context via gRPC calls here; must be first
5. `auth-service` — JWT issuance/validation; unblocks API Gateway and all secured endpoints
6. `api-gateway` — Route config, JWT filter, rate limiting; unblocks end-to-end HTTP flows
7. `employee-service` — Core HR domain anchor; most other services reference employee UUIDs

## Phase 2: Core HR Services

8. `leave-service` — Depends on employee-service only
9. `time-attendance-service` — Depends on employee-service only
10. `compliance-service` — Kenya statutory rules; input to payroll
11. `payroll-service` — Depends on employee, compliance, time-attendance, leave

## Phase 3: Supporting Services

12. `notification-service` — Listens to events from all above services
13. `document-service` — Payslips, contracts; depends on payroll + employee
14. `integration-hub-service` — M-Pesa, external APIs; depends on payroll

## Phase 4: Intelligence Services

15. `audit-service` — Subscribes to all domain events
16. `analytics-service` — Reads from multiple service databases (read replicas)

## Phase 5: Infrastructure

17. Docker Compose for local development
18. Kubernetes manifests for production
