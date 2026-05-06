# AndikishaHR — Superadmin / Platform Admin Responsibilities

> This document lists **all responsibilities** assigned to the Superadmin role across the AndikishaHR platform.

---

## 1. Account & Authentication Management

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 1 | **Provision initial SUPER_ADMIN** account (callable exactly once) | ✅ `SuperAdminAuthController.provision()` |
| 2 | **SUPER_ADMIN login** — authenticate and receive SYSTEM-scoped JWT | ✅ `SuperAdminAuthController.login()` |
| 3 | **Refresh token** renewal for SUPER_ADMIN session | ✅ `SuperAdminAuthService` generates refresh token |
| 4 | **List active SUPER_ADMIN sessions** | ❌ Not implemented |
| 5 | **Revoke SUPER_ADMIN session** (force logout) | ❌ Not implemented |
| 6 | **Rotate JWT secret** across the platform | ❌ Not implemented |

---

## 2. Tenant Onboarding & Provisioning

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 7 | **Initiate tenant onboarding** from a captured lead (demo request, contact form, or sales handoff) | ⚠️ Partial (landing API exists; no CRM/lead-to-tenant pipeline) |
| 8 | **Provision trial tenant** with plan, country, currency, and trial expiry | ✅ `TenantController.create()` starts TRIAL status automatically (14 days) |
| 9 | **Provision database schema** for the new tenant across all bounded contexts | ⚠️ Partial (Flyway runs per service; no automated cross-service schema provisioning) |
| 10 | **Create tenant admin account** (primary company admin) with email + temporary password | ⚠️ Partial (auto-creates from adminEmail in tenant request; no separate user provisioning API) |
| 11 | **Configure company statutory registrations** (KRA PIN, NSSF number, SHIF number) | ✅ `TenantController.update()` |
| 12 | **Set payroll schedule** (frequency, pay day, currency) | ✅ `TenantController.update()` |
| 13 | **Configure company profile** (company name, country, currency, address, phone) | ✅ `TenantController.update()` |
| 14 | **Set up default departments** (HR, Finance, Operations, etc.) based on country template | ❌ Not implemented |
| 15 | **Set up default positions / job titles** based on industry template | ❌ Not implemented |
| 16 | **Set up default leave policies** (Annual, Sick, Maternity, Paternity) based on country labour law | ❌ Not implemented |
| 17 | **Set up default work schedule** (days, hours, overtime rules) | ❌ Not implemented |
| 18 | **Set up default salary structure templates** (basic, housing, transport, medical allowances) | ❌ Not implemented |
| 19 | **Set up default statutory compliance configuration** (PAYE brackets, NSSF tiers, SHIF rates, Housing Levy) | ⚠️ Partial (compliance-service holds brackets; no per-tenant override API) |
| 20 | **Bulk import employees** via CSV / Excel upload with validation | ❌ Not implemented |
| 21 | **Bulk import salary structures** via CSV / Excel | ❌ Not implemented |
| 22 | **Generate employee onboarding template** (CSV with headers matching tenant configuration) | ❌ Not implemented |
| 23 | **Configure payment disbursement methods** (MPesa STK push, bank transfer, manual) | ❌ Not implemented |
| 24 | **Enable plan-appropriate feature flags** for the tenant | ⚠️ Partial (flags exist; no automatic per-plan mapping) |
| 25 | **Set seat limits** per role based on plan (e.g., Starter = 1 HR Manager, 0 Payroll; Growth = 3 HR, 2 Payroll, etc.) | ❌ Not implemented |
| 26 | **Invite tenant admin team** (HR Manager, Payroll Manager, Finance, Line Managers) via email | ❌ Not implemented |
| 27 | **Resend admin invitation** if expired or missed | ❌ Not implemented |
| 28 | **Track onboarding completion checklist** (company profile, employees, statutory, leave, payroll configured) | ❌ Not implemented |
| 29 | **Nudge tenant** with automated reminders for incomplete onboarding steps | ❌ Not implemented |
| 30 | **Complete onboarding review** — mark tenant as fully onboarded and ready for first payroll | ❌ Not implemented |
| 31 | **Abort / roll back onboarding** (tenant decided not to proceed, clear schema + data) | ❌ Not implemented |

---

## 3. Tenant Lifecycle Management

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 32 | **View all tenants** (paginated, sortable) | ✅ `TenantController.listAll()` |
| 33 | **Filter tenants** by status (TRIAL, ACTIVE, SUSPENDED, CANCELLED) | ⚠️ Partial (returns all; filter via `Pageable`) |
| 34 | **Filter tenants** by subscription plan | ✅ Feasible via `Tenant` entity |
| 35 | **Filter tenants** by onboarding stage (NEW, PROFILE_SET, EMPLOYEES_ADDED, PAYROLL_READY, ACTIVE) | ❌ Not implemented |
| 36 | **Search tenants** by company name or admin email | ❌ Not implemented |
| 37 | **View tenant detail** (profile, stats, admin contact, onboarding progress) | ✅ `TenantController.getById()` |
| 38 | **View tenant admin team** (list of users with roles under the tenant) | ❌ Not implemented |
| 39 | **View tenant employee count** | ⚠️ Partial (requires cross-service call or sync) |
| 40 | **View tenant recent activity** (logins, payroll runs, leave requests) | ❌ Not implemented |
| 41 | **Manually create tenant** (onboard new customer) | ✅ `TenantController.create()` |
| 42 | **Update tenant details** (company name, statutory numbers, pay schedule) | ✅ `TenantController.update()` |
| 43 | **Suspend tenant** with reason | ✅ `TenantController.suspend()` |
| 44 | **Reactivate suspended tenant** | ✅ `TenantController.reactivate()` |
| 45 | **Cancel / terminate tenant** (hard or soft delete) | ❌ Not implemented |
| 46 | **Upgrade / downgrade tenant plan** | ✅ `TenantController.changePlan()` |
| 47 | **View tenant trial status** (days remaining, expiry date) | ✅ `Tenant.isTrialExpired()` |
| 48 | **Extend tenant trial period** | ❌ Not implemented |
| 49 | **Force tenant admin password reset** | ❌ Not implemented |
| 50 | **Reset tenant admin MFA** or 2FA device | ❌ Not implemented |
| 51 | **Impersonate tenant** (read-only session for support) | ✅ `SuperAdminAuthController.impersonate()` |
| 52 | **View impersonation session history** | ❌ Not implemented |
| 53 | **Revoke active impersonation token** | ❌ Not implemented |
| 54 | **Transfer tenant ownership** (change primary admin email / account) | ❌ Not implemented |
| 55 | **Re-provision tenant schema** (repair / rebuild after data corruption) | ❌ Not implemented |

---

## 4. Licence & Plan Management

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 56 | **List available subscription plans** | ✅ `PlanController.getAvailablePlans()` |
| 57 | **View plan details** (features, limits, pricing, seat allocations) | ⚠️ Partial (Plan entity exists; no detailed response DTO) |
| 58 | **Create new subscription plan** | ❌ Not implemented |
| 59 | **Update plan features, limits, or pricing** | ❌ Not implemented |
| 60 | **Clone an existing plan** (to derive a custom enterprise plan) | ❌ Not implemented |
| 61 | **Deprecate / retire a plan** (forbid new signups, allow renewals) | ❌ Not implemented |
| 62 | **View tenant licence status** (ACTIVE, GRACE_PERIOD, EXPIRED, SUSPENDED) | ⚠️ Redis-based via `TenantLicenceFilter` |
| 63 | **Manually set licence status** for a tenant | ⚠️ Redis-based; no superadmin API |
| 64 | **View licences expiring soon** (dashboard alert) | ⚠️ `LicenceExpiringEvent` exists; no dedicated endpoint |
| 65 | **Trigger licence renewal / billing cycle** | ❌ Not implemented |
| 66 | **Apply manual credit / discount** to a tenant subscription | ❌ Not implemented |
| 67 | **Override seat limits** for a specific tenant (goodwill / enterprise deal) | ❌ Not implemented |
| 68 | **Set custom billing cycle** (e.g., annual billing with custom start date) | ❌ Not implemented |

---

## 5. Feature Flags & Feature Gating

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 69 | **View all feature flags** for a specific tenant | ✅ `FeatureFlagController.list()` |
| 70 | **Enable a feature flag** for a tenant | ✅ `FeatureFlagController.enable()` |
| 71 | **Disable a feature flag** for a tenant | ✅ `FeatureFlagController.disable()` |
| 72 | **View global default feature flags** | ❌ Not implemented |
| 73 | **Create new feature flag key** | ❌ Not implemented |
| 74 | **Update feature flag metadata** (description, default state, deprecation) | ❌ Not implemented |
| 75 | **Roll out feature to percentage of tenants** | ❌ Not implemented |
| 76 | **Attach feature flags to plans** (plan A gets features X, Y; plan B gets X, Y, Z) | ❌ Not implemented |
| 77 | **Sunset / kill-switch a feature** (force-disable everywhere) | ❌ Not implemented |
| 78 | **View feature adoption analytics** (which tenants have enabled / used a feature) | ❌ Not implemented |

---

## 6. System Monitoring & Health

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 79 | **View all service health statuses** | ⚠️ Actuator per service; no aggregator |
| 80 | **View service metrics** (CPU, memory, DB connections) | ⚠️ Prometheus per service; no aggregator |
| 81 | **View RabbitMQ queue health** (depth, connection status) | ⚠️ Management API exists; not wrapped |
| 82 | **View Redis cache health** | ❌ Not implemented |
| 83 | **View database health** per tenant (slow queries, connection pool) | ❌ Not implemented |
| 84 | **View circuit breaker states** | ❌ Not implemented |
| 85 | **View recent errors and logs** | ❌ Not implemented |
| 86 | **View API traffic volume** per tenant or system-wide | ❌ Not implemented |
| 87 | **View API latency percentiles** (p50, p95, p99) per endpoint | ❌ Not implemented |
| 88 | **View error rate trends** | ❌ Not implemented |
| 89 | **Trigger system-wide maintenance mode** | ❌ Not implemented |
| 90 | **View Flyway migration status** per service | ❌ Not implemented |
| 91 | **View scheduled job / cron status** | ❌ Not implemented |
| 92 | **View dead letter queue** (failed events needing replay) | ❌ Not implemented |
| 93 | **Re-process failed events** from dead letter queue | ❌ Not implemented |

---

## 7. Audit & Compliance

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 94 | **Search cross-tenant audit logs** | ⚠️ `AuditController.listAll()` requires tenant header |
| 95 | **Filter audit logs** by domain (EMPLOYEE, PAYROLL, LEAVE, etc.) | ⚠️ Requires superadmin bypass |
| 96 | **Filter audit logs** by action (CREATE, UPDATE, APPROVE, DELETE) | ⚠️ Requires superadmin bypass |
| 97 | **Filter audit logs** by specific resource | ⚠️ Requires superadmin bypass |
| 98 | **Filter audit logs** by actor (user ID) | ⚠️ Requires superadmin bypass |
| 99 | **Filter audit logs** by date range | ⚠️ Requires superadmin bypass |
| 100 | **Filter audit logs** by tenant | ❌ Not implemented |
| 101 | **View audit summary dashboard** | ⚠️ Requires superadmin bypass |
| 102 | **Export audit report** (PDF / CSV) | ❌ Not implemented |
| 103 | **View suspicious activity alerts** | ❌ Not implemented |
| 104 | **Track all SUPER_ADMIN actions** | ⚠️ Partial (via auth event listeners) |
| 105 | **Generate compliance attestation report** (SOC 2, data residency proof) | ❌ Not implemented |
| 106 | **View data residency & region info** per tenant | ❌ Not implemented |
| 107 | **Review failed audit events** (events that couldn't be persisted) | ❌ Not implemented |

---

## 8. Billing & Revenue Management

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 108 | **View MRR / ARR dashboard** | ❌ Not implemented |
| 109 | **View churn rate and cohort analysis** | ❌ Not implemented |
| 110 | **View lifetime value (LTV)** per tenant | ❌ Not implemented |
| 111 | **View tenant payment history** | ❌ Not implemented |
| 112 | **Generate invoice** for a tenant | ❌ Not implemented |
| 113 | **Void or re-issue an invoice** | ❌ Not implemented |
| 114 | **Process manual refund or credit** | ❌ Not implemented |
| 115 | **View failed payment attempts** | ❌ Not implemented |
| 116 | **Retry a failed payment** | ❌ Not implemented |
| 117 | **Export subscription revenue data** | ❌ Not implemented |
| 118 | **Configure payment gateway** (Paystack, Stripe, Flutterwave) | ❌ Not implemented |
| 119 | **Set up billing webhook endpoints** (invoice.paid, invoice.failed) | ❌ Not implemented |
| 120 | **Apply promotional code / coupon** to tenant | ❌ Not implemented |

---

## 9. Support & Operations

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 121 | **View active user count** (per tenant and system-wide) | ❌ Not implemented |
| 122 | **View peak concurrent users** | ❌ Not implemented |
| 123 | **View tenant engagement score** (login frequency, feature usage) | ❌ Not implemented |
| 124 | **Contact tenant admin** directly from dashboard | ❌ Not implemented |
| 125 | **Send broadcast announcement** to all tenants | ❌ Not implemented |
| 126 | **Send targeted announcement** (by plan, status, or country) | ❌ Not implemented |
| 127 | **View support ticket queue** | ❌ Not implemented |
| 128 | **Assign support ticket** to team member | ❌ Not implemented |
| 129 | **View tenant satisfaction / NPS** | ❌ Not implemented |
| 130 | **Export tenant data** (GDPR / superadmin backup) | ❌ Not implemented |
| 131 | **Purge tenant data** (GDPR right to be forgotten) | ❌ Not implemented |
| 132 | **Schedule tenant data export** (automated backup for enterprise customers) | ❌ Not implemented |
| 133 | **View system changelog / version history** | ❌ Not implemented |
| 134 | **Publish system status / incident** to status page | ❌ Not implemented |
| 135 | **Force platform-wide notification** (critical security update, planned downtime) | ❌ Not implemented |

---

## 10. Security & Incident Response

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 136 | **Force password reset** for any user across any tenant | ❌ Not implemented |
| 137 | **Force logout for all users** of a specific tenant | ❌ Not implemented |
| 138 | **Force logout for a specific user** | ❌ Not implemented |
| 139 | **Force logout all SUPER_ADMIN sessions** | ❌ Not implemented |
| 140 | **Lock / disable a user account** | ⚠️ `User.deactivate()` exists; no superadmin-driven UI |
| 141 | **Unlock / re-enable a user account** | ⚠️ Partial |
| 142 | **View failed login attempts** per user or tenant | ❌ Not implemented |
| 143 | **View login history** (device, location, IP) | ❌ Not implemented |
| 144 | **Flag suspicious IP or device** for review | ❌ Not implemented |
| 145 | **Block IP address** at gateway level | ❌ Not implemented |
| 146 | **Unblock IP address** | ❌ Not implemented |
| 147 | **Trigger security incident** (e.g., suspected breach) | ❌ Not implemented |
| 148 | **View security incident history** | ❌ Not implemented |
| 149 | **Rotate API keys / service tokens** | ❌ Not implemented |
| 150 | **Review and approve OAuth / third-party app integrations** | ❌ Not implemented |

---

## 11. Communication & Engagement

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 151 | **Compose and send in-app message** to all users | ❌ Not implemented |
| 152 | **Compose and send email campaign** to tenant admins | ❌ Not implemented |
| 153 | **Schedule broadcast messages** (e.g., new feature rollout) | ❌ Not implemented |
| 154 | **View message delivery analytics** (open rates, click rates) | ❌ Not implemented |
| 155 | **Manage email templates** (welcome, onboarding, password reset, invoice) | ❌ Not implemented |
| 156 | **Preview and test email templates** | ❌ Not implemented |
| 157 | **Configure notification preferences** defaults for all tenants | ❌ Not implemented |
| 158 | **Publish platform changelog** visible to all tenant admins | ❌ Not implemented |

---

## 12. Data Migration & Import

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 159 | **Upload competitor export** (Excel / CSV from another HRIS) | ❌ Not implemented |
| 160 | **Map competitor schema** to Andikisha schema | ❌ Not implemented |
| 161 | **Preview migration result** before applying | ❌ Not implemented |
| 162 | **Run migration** (create employees, departments, salaries, histories) | ❌ Not implemented |
| 163 | **Rollback migration** if errors detected | ❌ Not implemented |
| 164 | **Export tenant data** for offboarding or backup | ❌ Not implemented |
| 165 | **Verify data integrity** post-migration | ❌ Not implemented |
| 166 | **Import bulk employee changes** via CSV (salary updates, status changes) | ❌ Not implemented |

---

## 13. Configuration & Platform Updates

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 167 | **Update statutory compliance configuration** (e.g., new PAYE brackets from KRA) | ⚠️ Partial (brackets in `compliance-service`; no live-update API) |
| 168 | **Update NSSF tier limits** | ⚠️ Partial |
| 169 | **Update SHIF rates** | ⚠️ Partial |
| 170 | **Update Housing Levy rates** | ⚠️ Partial |
| 171 | **Add or update public holidays** for a country | ❌ Not implemented |
| 172 | **Add new country support** (e.g., Tanzania, Uganda, Rwanda) | ⚠️ Partial (multi-country modelled but no API) |
| 173 | **Configure country-specific leave entitlements** | ❌ Not implemented |
| 174 | **Configure overtime rates** per country / industry | ❌ Not implemented |
| 175 | **Update KRA forms / templates** for document generation | ❌ Not implemented |
| 176 | **Publish platform-wide configuration changes** | ❌ Not implemented |
| 177 | **Validate compliance engine calculations** against known test cases | ❌ Not implemented |

---

## 14. Backup & Disaster Recovery

| # | Responsibility | Backend Status |
|---|----------------|----------------|
| 178 | **Trigger manual database backup** for a tenant | ❌ Not implemented |
| 179 | **Trigger manual database backup** for all tenants | ❌ Not implemented |
| 180 | **View backup status** (last successful, size, retention) | ❌ Not implemented |
| 181 | **Restore tenant from backup** | ❌ Not implemented |
| 182 | **Restore specific table / entity** for tenant (surgical restore) | ❌ Not implemented |
| 183 | **Archive cold tenant data** (move to cheaper storage) | ❌ Not implemented |
| 184 | **Rehydrate archived tenant** | ❌ Not implemented |
| 185 | **Test disaster recovery** (simulate service failure, verify failover) | ❌ Not implemented |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented and exposed via API |
| ⚠️ | Partially implemented or requires workaround |
| ❌ | Not implemented (backend work required) |

---

> **Total:** 185 responsibilities  
> **Implemented:** 23 (~12%)  
> **Partial / Workaround:** 20 (~11%)  
> **Not Implemented:** 142 (~77%)
