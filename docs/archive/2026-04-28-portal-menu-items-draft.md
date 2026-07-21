# AndikishaHR — Frontend Portal Menu Items

> **Status:** Draft for review  
> **Scope:** Superadmin Portal, Admin Portal, Manager Portal, Employee Portal  
> **Last updated:** 2026-04-28

---

## 1. Superadmin Portal (Platform Operations)

| Menu | Sub-menu / Sections | Purpose |
|------|---------------------|---------|
| **Dashboard** | — | Platform-wide health, active tenants, MRR/ARR, alerts, recent activity |
| **Tenants** | All Tenants · Onboarding Queue · Suspended · Trials · Audit Log | CRUD tenant lifecycle; provision, suspend, reactivate, impersonate, cancel |
| **Plans & Licensing** | Plans · Feature Flags · Seat Limits · Upgrades / Downgrades | Manage subscription tiers, per-tenant feature toggles, plan limits |
| **System Health** | Services · Queues · DB · Cache · Circuit Breakers · Migrations | Real-time infra status, RabbitMQ depth, Redis, Flyway, error rates |
| **Audit & Compliance** | Cross-tenant Audit · Compliance Reports · Data Residency | Search/filter audit logs by tenant/domain/action; generate attestations |
| **Billing & Revenue** | MRR/ARR · Invoices · Payments · Coupons · Revenue Export | Financial dashboard, manual invoicing, refunds, promo codes |
| **Security & Access** | Users · Sessions · Password Resets · IP Blocks · Incidents | Force logout, rotate secrets, block IPs, review login history, MFA reset |
| **Support & Operations** | Tickets · Announcements · Engagement · Tenant Contact | Support queue, broadcast/targeted messages, tenant NPS/engagement scores |
| **Communications** | Broadcasts · Email Templates · Campaigns · Changelog | Send in-app/email campaigns, manage templates, publish platform changelog |
| **Data & Migration** | Imports · Exports · Backups · Migrations · Bulk Changes | Competitor data migration, bulk CSV import/export, backup/restore, archive |
| **Platform Configuration** | Statutory Rates · Countries · Holidays · Overtime Rules | Update KRA/NSSF/SHIF brackets, add country support, public holidays |
| **Profile** | — | View/edit superadmin profile, change password, MFA |
| **Settings** | Notifications · API Keys · Webhooks · Maintenance Mode | Platform defaults, service token rotation, status page config |
| **Logout** | — | End session |

---

## 2. Admin Portal (Tenant Administration)

| Menu | Sub-menu / Sections | Purpose |
|------|---------------------|---------|
| **Dashboard** | — | Tenant KPIs (headcount, payroll summary, leave stats, compliance alerts) |
| **Organization** | Company Profile · Departments · Positions · Work Schedule | Manage company info, org structure, job titles, shifts/hours |
| **Employees** | Directory · Add Employee · Bulk Import · Terminations · History | Full employee lifecycle, bulk CSV upload, employment history audit |
| **Payroll** | Payroll Runs · Payslips · Payment Files · Reversals · Reports | Initiate/approve/reverse runs, download payslip PDFs, disbursement files |
| **Compliance** | Statutory Rates · Filing Deadlines · KRA/NSSF/SHIF Reports | View statutory config, compliance calendar, generate remittance reports |
| **Leave** | Policies · Balances · Requests · Approvals · Calendar | Configure leave types, view/adjust balances, approve/reject requests |
| **Time & Attendance** | Records · Shifts · Timesheets · Overtime · Exceptions | Clock records, shift schedules, approve timesheets, exception review |
| **Documents** | All Documents · Templates · Upload · Versions | Contracts, payslips, ID scans, certificate generation, version control |
| **Reports & Analytics** | HR Reports · Payroll Reports · Custom Reports | Pre-built and custom reports, charts, export to Excel/PDF |
| **Integrations** | M-Pesa · Banks · KRA iTax · Biometric · Accounting | Configure/disconnect external service adapters, view sync status |
| **Notifications** | Templates · History · Preferences | Manage tenant notification templates, delivery history, default prefs |
| **User Management** | Admins · Roles · Invitations · Activity | Invite HR/payroll users, assign roles, audit user actions |
| **Settings** | Tenant Config · Feature Flags · Payroll Schedule · Notifications | Company preferences, enable/disable modules, pay day/frequency |
| **Profile** | — | Edit name/email/phone, password, MFA, avatar |
| **Help & Support** | Documentation · Contact Support · Ticket History | Self-service docs, raise support tickets, view responses |
| **Logout** | — | End session |

---

## 3. Manager Portal (Line Manager View)

> **Note:** The Manager Portal is a role-scoped view of the Admin Portal (or a separate lightweight portal) accessible to users with the `LINE_MANAGER` role. It exposes only department-scoped data and approval workflows.

| Menu | Sub-menu / Sections | Purpose |
|------|---------------------|---------|
| **Dashboard** | — | Quick view of team headcount, pending approvals, attendance exceptions |
| **My Team** | Direct Reports · Profiles · Attendance · Leave | View/manage profiles of direct reports only; read-only org info |
| **Approvals** | Leave Requests · Timesheets · Overtime | Approve/reject leave, timesheet, and overtime submissions for direct reports |
| **Attendance** | Records · Schedules · Exceptions | View team clock-in/out history, shift schedules, late/early alerts |
| **Documents** | Team Documents | Access shared team documents (excluding confidential flag items unless authorized) |
| **Reports** | Team Analytics · Leave Utilisation · Attendance Summary | Department-level charts and exports for direct reports only |
| **Profile** | — | Edit personal details, password, MFA, avatar |
| **Settings** | Notifications · Preferences | Configure email/SMS/in-app alerts for approvals and team updates |
| **Help & Support** | Documentation · Contact Support | Access manager-specific help articles and raise tickets |
| **Logout** | — | End session |

---

## 4. Employee Portal (Self-Service PWA)

> **Note:** The Employee Portal is a Next.js 15 Progressive Web App (port 3001) with offline caching for payslips, leave balances, and shift schedules.

| Menu | Sub-menu / Sections | Purpose |
|------|---------------------|---------|
| **Dashboard** | — | Personal snapshot: next payslip date, leave balance, pending requests, clock-in status |
| **Profile** | Personal Details · Employment Info · Documents · History | View/edit contact info, view salary grade, download personal documents, employment history |
| **Payslips** | History · Download PDF · Tax Summary | View all historical payslips, download PDFs, see PAYE/NSSF/SHIF breakdowns |
| **Leave** | Balance · Request Leave · History · Cancel | Check real-time entitlement, submit requests, view past/absent records, cancel pending |
| **Attendance** | Clock In/Out · Timesheets · Schedule · Overtime | GPS/mobile clock-in, view weekly timesheet, upcoming shifts, overtime status |
| **Documents** | Personal · Contracts · Certificates · Company Policies | Access own documents (contract, payslips, P9), read company handbooks |
| **Company Info** | Org Chart · Announcements · Holidays · Policies | View organisation structure, company-wide announcements, public holiday calendar |
| **Settings** | Notifications · Password · 2FA · Language · Offline Mode | Push/email/WhatsApp preferences, security settings, PWA cache management |
| **Help & Support** | FAQs · Raise Ticket · Chat | Access self-service knowledge base, contact HR/support |
| **Logout** | — | End session and clear cached sensitive data |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **Bold menu** | Top-level navigation item |
| **Sub-menu** | Expandable sections or secondary pages under the top-level item |
| **Purpose** | Brief description of what the user can accomplish |

---

## Cross-Portal Shared Concerns

| Concern | Superadmin | Admin | Manager | Employee |
|---------|:----------:|:-----:|:-------:|:--------:|
| Profile | yes | yes | yes | yes |
| Settings | yes | yes | yes | yes |
| Help & Support | yes | yes | yes | yes |
| Notifications (in-app) | yes | yes | yes | yes |
| Multi-factor authentication | yes | yes | yes | yes |
| Offline capability | no | no | no | yes (PWA) |
| Role-based access control | SUPER_ADMIN only | ADMIN/HR_MANAGER/PAYROLL_OFFICER/HR | LINE_MANAGER | EMPLOYEE |

---

*End of document*
