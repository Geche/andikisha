# AndikishaHR Portal Menu Specifications (v2)

The canonical menu inventory for AndikishaHR. This version reflects the architectural decisions made during the multi-role and portal consolidation work. Items are derived from the documented modules in the Product Planning Document v1.1, the role permission matrix, the service registry, and the upgrade-plan extensions.

## What changed from v1

Three portals collapsed into two apps:

- `admin-portal` and `employee-portal` merged into a single Next.js app called **`tenant-portal`** (port 3000). Inside it, two route groups, `/my/*` for employee self-service and `/admin/*` for HR and payroll operations.
- `superadmin-portal` renamed to **`platform-portal`** (port 3003) and remains a separate Next.js app for internal Andikisha staff.
- `landing` (port 3002) is untouched.

Role model updates that affect the menus:

- **EMPLOYEE is now a baseline role**, granted automatically to every user with an employee record. ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR, and LINE_MANAGER are duty assignments stacked on top.
- **SUPER_ADMIN never holds EMPLOYEE** because SUPER_ADMIN users have no employee record. They are internal Andikisha staff in a separate user pool, accessing only `platform-portal`.
- **Multi-role users are supported.** A person can hold any combination of system roles (other than SUPER_ADMIN, which is exclusive).
- **LINE_MANAGER routes through `/my/*`**, not `/admin/*`. They are an employee with team-management duties. The "My Team" section inside `/my/*` renders conditionally when LINE_MANAGER is present in their role set.
- **Custom tenant-defined roles** are available on Professional tier and above. These roles are tenant-scoped, derived from a system role template, and appear alongside system roles in the user assignment dropdown.

---

## 1. `tenant-portal` `/my/*` (Employee self-service)

**Audience:** EMPLOYEE (baseline role held by every user with an employee record). LINE_MANAGER overlay renders the "My Team" section.

**Form factor:** Offline-capable PWA. The menu must work on a mid-range Android device with patchy connectivity, so keep depth shallow and core actions reachable in one tap.

**Default landing:** `/my/dashboard`

### Top-level navigation (visible to every user)

- **Home / Dashboard** → `/my/dashboard`
  - Next payday countdown
  - Latest payslip card
  - Leave balance summary
  - Today's shift
  - Pending requests (mine)
  - Team approval count (renders only if the user holds LINE_MANAGER)
  - Announcements

- **Payslips** → `/my/payslips`
  - Current payslip
  - Payslip history
  - Plain-language breakdown
  - P9 form (annual tax certificate)
  - Download or share via WhatsApp

- **Leave** → `/my/leave`
  - Request leave
  - My balances (annual, sick, maternity, paternity, compassionate, study)
  - My leave history
  - Team calendar (read-only)
  - Public holidays

- **Time and Attendance** → `/my/attendance`
  - Clock in and out (with geofence)
  - My attendance log
  - My shift schedule
  - Overtime record

- **Expenses** → `/my/expenses`
  - Submit claim (with receipt photo)
  - My claims
  - Reimbursement status

- **Salary Advance and EWA** → `/my/advances`
  - Request advance
  - Available EWA balance
  - Repayment schedule
  - Advance history

- **My Documents** → `/my/documents`
  - Employment contract
  - Certificate of service
  - ID scans and KRA PIN
  - NSSF and SHIF cards
  - Other personal documents

- **My Profile** → `/my/profile`
  - Personal details
  - Contact information
  - Next of kin
  - Bank account and M-Pesa number
  - Emergency contacts
  - Change password
  - Biometric enrolment status

- **Notifications** → `/my/notifications`
  - Inbox
  - Notification preferences (email, SMS, WhatsApp, push)
  - Language preference (English or Kiswahili)

- **Help** → `/my/help`
  - FAQ
  - Contact HR
  - Report an issue

### Conditional section: My Team

Renders only when the authenticated user holds `LINE_MANAGER` in their role set. This section gives line managers their team-management surface without requiring them to switch into `/admin/*`.

- **My Team** → `/my/team`
  - Team members (direct reports, scoped to my department)
  - Pending approvals (leave, timesheets, expenses, overtime)
  - Team calendar
  - Team attendance
  - Shift roster for my team
  - Team leave balances
  - Performance appraisals for direct reports
  - Team payroll cost summary (no individual salary visibility unless the user also holds HR_MANAGER or above)

---

## 2. `tenant-portal` `/admin/*` (HR, payroll, compliance, administration)

**Audience:** ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR. Each role sees a different subset of these menu items. LINE_MANAGER never routes here.

**Form factor:** Desktop-dense power-user UI. Optimised for HR and payroll professionals doing operational work for many employees at once.

**Default landing:** `/admin/dashboard`

### Menu visibility legend

For each top-level item below, a visibility tag indicates which roles see it. `ADMIN` sees everything (always). The other tags are inclusive (e.g., `HR_MANAGER` means HR_MANAGER and ADMIN both see it).

### Top-level navigation

- **Dashboard** → `/admin/dashboard` _(ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR)_
  - Headcount snapshot
  - Payroll cost trend
  - Compliance status
  - Pending approvals (leave, expenses, timesheets)
  - Upcoming filing deadlines
  - Recent activity feed

- **Employees** → `/admin/employees` _(ADMIN, HR_MANAGER, HR read-only)_
  - All employees
  - Onboarding pipeline
  - Offboarding pipeline
  - Organisation chart
  - Departments and locations
  - Employment types (permanent, contract, casual, director, intern)
  - Bulk import (CSV/Excel)
  - Archived employees

- **Payroll** → `/admin/payroll` _(ADMIN, PAYROLL_OFFICER)_
  - Payroll runs (monthly, weekly, daily, casual)
  - Salary structures and grades
  - Allowances and deductions library
  - Loans and salary advances
  - Earned Wage Access (EWA)
  - Payslips
  - Payment files (M-Pesa B2C, bank EFT)
  - Cost intelligence (dry-run projections)
  - Payroll calendar
  - Adjustments and reversals

- **Compliance** → `/admin/compliance` _(ADMIN, PAYROLL_OFFICER)_
  - Compliance calendar
  - Statutory rates view (PAYE, NSSF Tier I/II, SHIF, Housing Levy, NITA, HELB) — read-only, sourced from `platform-portal`
  - KRA iTax filings (P10 monthly, P9 annual)
  - NSSF submissions
  - SHIF submissions
  - Housing Levy submissions
  - WHT certificates for contractors
  - Compliance audit reports
  - Regulatory changelog

- **Leave** → `/admin/leave` _(ADMIN, HR_MANAGER, HR)_
  - Requests (pending, approved, declined)
  - Team calendar
  - Leave policies and accrual rules
  - Public holiday calendar
  - Balances and entitlements
  - Carry-forward and expiry
  - Leave reports

- **Time and Attendance** → `/admin/attendance` _(ADMIN, HR_MANAGER, HR)_
  - Clock-in records
  - Timesheets (pending approval)
  - Shift schedules
  - Overtime register
  - Biometric device sync (ZKTeco)
  - Geofencing zones
  - Attendance reports

- **Expenses** → `/admin/expenses` _(ADMIN, HR_MANAGER, PAYROLL_OFFICER)_
  - All claims
  - Approval queue
  - Reimbursement runs
  - Expense categories and policy
  - M-Pesa disbursement log

- **Documents** → `/admin/documents` _(ADMIN, HR_MANAGER, HR)_
  - Employee documents
  - Tenant documents (policies, handbooks)
  - Document templates
  - Signed agreements
  - Document expiry tracker

- **Performance** → `/admin/performance` _(ADMIN, HR_MANAGER) — Phase 3, hidden behind feature flag in MVP_
  - Appraisal cycles
  - Goals and KPIs
  - Reviews
  - 360 feedback

- **Assets** → `/admin/assets` _(ADMIN, HR_MANAGER) — Phase 3, hidden behind feature flag in MVP_
  - Asset registry
  - Assignments
  - Maintenance schedule
  - Vehicle fleet

- **Reports and Analytics** → `/admin/reports` _(ADMIN, HR_MANAGER, PAYROLL_OFFICER)_
  - Executive HR dashboard
  - Payroll cost analysis
  - Headcount and turnover
  - Attrition early warning
  - Leave utilisation
  - Attendance and overtime
  - Statutory compliance dashboard
  - Custom report builder
  - Scheduled reports
  - Export centre (PDF, Excel, CSV, KRA-compatible)

- **Notifications** → `/admin/notifications` _(ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR)_
  - Inbox
  - Broadcasts to employees
  - WhatsApp approval threads
  - Notification preferences

- **Settings** → `/admin/settings` _(ADMIN only, with sub-items partially visible to HR_MANAGER as noted)_
  - **Organisation** → `/admin/settings/organisation` _(ADMIN, HR_MANAGER)_
    - Profile, branding, registered details, KRA PIN
  - **Users and Roles** → `/admin/settings/users` _(ADMIN only)_
    - User list with multi-role assignment
    - System roles (read-only, the seven product roles)
    - Custom roles (Professional tier and above: create, edit, delete tenant-scoped roles derived from a system role template)
    - Permission overrides per user
  - **Departments and Locations** → `/admin/settings/departments` _(ADMIN, HR_MANAGER)_
  - **Leave Policies** → `/admin/settings/leave-policies` _(ADMIN, HR_MANAGER)_
  - **Payroll Policies** → `/admin/settings/payroll-policies` _(ADMIN, PAYROLL_OFFICER)_
  - **Approval Workflows** → `/admin/settings/approvals` _(ADMIN)_
  - **Integrations** → `/admin/settings/integrations` _(ADMIN only)_
    - M-Pesa (Daraja)
    - KRA iTax
    - NSSF portal
    - SHIF portal
    - Bank APIs (KCB, Equity, Co-op, NCBA, Stanbic)
    - ZKTeco biometrics
    - Africa's Talking (SMS, WhatsApp, USSD)
    - Accounting (QuickBooks, Xero, Sage)
    - Google Workspace and Microsoft 365 directory sync
  - **Billing and Subscription** → `/admin/settings/billing` _(ADMIN only)_
    - Current plan and tier
    - Invoices
    - Payment methods
    - Active employee count and seat usage
  - **API Tokens and Webhooks** → `/admin/settings/api` _(ADMIN only)_
  - **SSO and Security** → `/admin/settings/security` _(ADMIN only)_
    - 2FA enforcement
    - Password policies
    - Session timeout
    - SAML/OIDC configuration
  - **Audit Log** → `/admin/settings/audit` _(ADMIN, HR_MANAGER read-only)_
  - **Localisation** → `/admin/settings/localisation` _(ADMIN, HR_MANAGER)_
    - Language (English, Swahili)
    - Currency (KES default)
    - Timezone (Africa/Nairobi default)

---

## 3. `platform-portal` (Internal Andikisha staff)

**Audience:** SUPER_ADMIN only. Separate Next.js app deployed at port 3003 (production: separate subdomain or VPN-gated origin).

**Critical constraint:** Has no access to any tenant's employee or payroll data. Operates strictly at the platform and metadata layer.

**Default landing:** `/dashboard`

### Top-level navigation

- **Platform Dashboard** → `/dashboard`
  - Active tenant count
  - MRR and ARR
  - New signups this period
  - Service health summary (13 backend services)
  - Active incidents
  - Background job queue status
  - Recent provisioning activity

- **Tenants** → `/tenants`
  - All tenants (list and grid)
  - Provision new tenant
  - Tenant detail view (metadata only, never employee data)
  - Subscriptions and plan assignment
  - Feature flags per tenant
  - Tenant suspension and reactivation
  - Schema management (per-tenant PostgreSQL schemas)
  - Tenant migration tools
  - Tenant usage metrics (active employees, storage, API calls)

- **Billing and Revenue** → `/billing`
  - Invoices (across all tenants)
  - Plans and pricing tiers
  - Payment methods
  - Usage metering (active employees per tenant)
  - Revenue reports
  - Churn analytics
  - Dunning and overdue accounts
  - Purchase transactions log

- **Compliance Library** → `/compliance`
  - PAYE brackets (versioned, the editable source of truth)
  - NSSF Tier I and Tier II rates
  - SHIF rates
  - Housing Levy
  - NITA
  - HELB
  - Country packs (Kenya, Tanzania, Uganda)
  - Effective date scheduler
  - Regulatory changelog publisher
  - Compliance alert composer (push to all tenants)

- **Integration Hub** → `/integrations`
  - KRA iTax credentials and health
  - NSSF portal status
  - SHIF portal status
  - Daraja (M-Pesa) sandbox and production
  - Africa's Talking (SMS, WhatsApp, USSD) status
  - Bank API health (KCB, Equity, Co-op, NCBA, Stanbic)
  - Accounting connector status
  - Webhook log and retries
  - Third-party API quotas

- **Support** → `/support`
  - Tenant support tickets (inbox across all tenants)
  - Support agents (internal staff list)
  - SLA policies
  - Escalation rules
  - Knowledge base for internal use

- **Platform Users** → `/users`
  - SUPER_ADMIN accounts (internal Andikisha staff)
  - Support agent accounts
  - Internal access logs
  - Two-factor enforcement
  - IP allowlisting

- **Audit and Security** → `/audit`
  - Cross-tenant audit log
  - Security events
  - Failed login monitoring
  - KDPA data subject access requests
  - Data export and deletion requests
  - Encryption key rotation
  - Penetration test reports
  - Compliance certifications

- **System Health** → `/system`
  - Service status (auth, tenant, employee, payroll, compliance, leave, attendance, expense, document, notification, integration-hub, analytics, audit)
  - Database health per service
  - RabbitMQ queue depths
  - Redis cache status
  - Zipkin distributed traces
  - Background job inspector (Spring Batch)
  - API Gateway metrics
  - gRPC service health

- **Communications** → `/communications`
  - Tenant announcements
  - System maintenance notices
  - Compliance change alerts
  - Email and SMS template library
  - Customer success outbound campaigns
  - In-app banner manager

- **Settings** → `/settings`
  - Platform configuration
  - Default tenant template (the seed for new tenants)
  - API rate limits
  - SSO configuration for internal staff
  - Feature flag rollouts (canary, percentage-based)
  - Environment configuration (dev, staging, production)
  - Build and release log

---

## Cross-app notes

### Routing decision after login

Login is single. The auth-service issues a token with a `roles` claim containing every role the user holds. Where the user lands depends on their role set:

- Role set contains `SUPER_ADMIN` → redirect to `platform-portal`
- Role set contains any of `ADMIN`, `HR_MANAGER`, `PAYROLL_OFFICER`, `HR` → `tenant-portal/admin/dashboard`
- Otherwise (EMPLOYEE, optionally with LINE_MANAGER) → `tenant-portal/my/dashboard`

Users who hold both an admin-side role and EMPLOYEE (which is most non-employee staff, since EMPLOYEE is baseline) get a "Switch view" toggle in the user menu that flips between `/admin` and `/my` without re-authenticating.

### Why LINE_MANAGER lives in `/my/*`

A line manager is an employee with extra duties. They take leave, receive a payslip, and clock in for their own shifts. Forcing them to switch into `/admin/*` for their team-management work while their self-service lives in `/my/*` adds friction with no benefit. The admin surfaces are reserved for users whose primary job is running HR or payroll operations.

If a person holds both LINE_MANAGER and an admin-side role (HR_MANAGER, for example), they handle team approvals in `/admin/*` because they already spend their workday there. The "My Team" section in `/my/*` does not render for that user, since their team management already happens in the admin surface.

### Custom roles in the menu

When a tenant on Professional tier and above creates a custom role, that role appears in the user assignment dropdown alongside system roles. The custom role inherits its base permissions from a system role template at creation, then the tenant ADMIN can add or remove individual permissions.

Custom roles do not get new menu items beyond what their inherited permissions grant. The menu structure stays fixed (the seven system roles define the menu scope), but custom roles can have different permission combinations within that fixed structure. For example, a custom "Senior Accountant" role inheriting from PAYROLL_OFFICER might add the audit log permission. The menu items that user sees are the union of permissions across all their assigned roles.

### Multi-role permission resolution

A user holds a set of roles. For each menu item, the visibility check is whether the union of permissions across the user's role set includes the required permission. This means a user with HR_MANAGER + PAYROLL_OFFICER sees the union of both menus, not the intersection.

The permission engine resolves this at session start (`/api/v1/auth/me`) and caches the resolved permission set for 15 minutes. Permission changes force a token refresh.

### Statutory rate tables

Editable only in `platform-portal/compliance`. Read-only in `tenant-portal/admin/compliance`. This enforces the architectural constraint that compliance logic and statutory rates live in one place, owned by Andikisha as the platform operator.

### Shared packages across apps

`tenant-portal` and `platform-portal` both consume `@andikisha/ui`, `@andikisha/api-client`, and `@andikisha/shared-types`. The same component primitives, the same API client, the same TypeScript types. `platform-portal` additionally has stricter route guards that block any tenant-scoped API call at the network layer, not just the UI layer.

### Phase 3 placeholders

Performance and Assets in `/admin/*` are placeholders for Phase 3. They are hidden behind a feature flag in MVP. When the corresponding services (performance-service, asset-service) ship in Phase 3, the feature flag flips and these menu items become visible.

### Visual design reference

UI design for both apps references the SmartHR template at `template/smarthr-nextjs/` and `template/smarthr-html/` for structural inspiration only. No code, dependencies, or visual tokens are copied. All production UI uses the AndikishaHR stack: Tailwind CSS, Lucide React icons, Bricolage Grotesque for display type, DM Sans for body, brand colours from `../design/brand/andikishahr-brand-colours.md`. The full rules of engagement are documented in `docs/design/system/template-usage.md` and enforced by the Claude Code skill at `.claude/skills/template-reference/SKILL.md`.

---

## Maintenance

Update this document when:

- A new top-level menu item is added or removed in any app
- A role's visibility for a specific menu item changes
- A new system role is added (extremely rare; would require product planning approval)
- The Phase 3 feature flag flips for Performance or Assets
- A new module ships that needs to live in either app
- A custom role pattern emerges that warrants documentation

Companion documents:

- `AndikishaHR_Product_Planning_Document_v1.1.md` for module scope and roadmap
- `andikishaHR-service-registry.md` for service ownership
- `andikishaHR-report-01-release-01-upgrade-plan.md` for upgrade-plan extensions (WhatsApp, EWA, USSD, accounting)
- `../design/brand/andikishahr-brand-colours.md` for visual tokens
- `docs/design/system/template-usage.md` for design reference rules

---

*Source documents and last updated: May 2026 reflecting the multi-role and portal consolidation architectural decisions.*
