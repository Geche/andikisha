# SmartHR Screen Mapping

A lookup table for which SmartHR screens to reference when building specific AndikishaHR features. Use this with Rule 1 from `SKILL.md`: visual reference only, no code copied.

The table maps AndikishaHR features (left) to SmartHR demo URL paths (right). Browse the SmartHR URL visually, study the structure, then rebuild in the AndikishaHR stack.

## platform-portal (SUPER_ADMIN, internal Andikisha staff)

The SmartHR Super Admin section is the most directly useful part of the template. The structure of these screens maps cleanly onto what `platform-portal` needs.

| AndikishaHR feature | SmartHR reference |
|---|---|
| Platform dashboard | `/super-admin/dashboard` |
| Tenants list | `/super-admin/companies` |
| Tenant detail (metadata only) | Adapt from `/super-admin/companies` |
| Subscriptions and plans | `/super-admin/subscription` |
| Pricing tiers | `/super-admin/package` |
| Domain configuration | `/super-admin/domain` |
| Billing and transactions | `/super-admin/purchase-transaction` |
| Tenant usage metrics | `/super-admin/tenant-usage-metrics` |
| Tenant support inbox | `/super-admin/tenant-support-tickets` |
| Support agents | `/super-admin/agents` |
| SLA policies | `/super-admin/sla-policies` |
| Escalation rules | `/super-admin/escalation-rules` |

## tenant-portal `/admin/*` (HR, payroll, compliance)

Dashboards:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Admin dashboard (organisation overview) | `/admin-dashboard` |
| HR dashboard | `/hr-dashboard` |
| Payroll dashboard | `/payroll-dashboard` |
| Attendance dashboard | `/attendance-dashboard` |
| Finance dashboard (for cost reports) | `/finance-dashboard` |

Employee management:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Employees list | `/employees` |
| Employees grid view | `/employees-grid` |
| Employee detail | `/employee-details` |
| Departments | `/departments` |
| Designations | `/designations` |
| Policies and handbooks | `/policy` |

Payroll:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Employee salary structures | `/payroll/employee-salary` |
| Payslip view | `/payroll/payslip` |
| Payroll items (allowances, deductions) | `/payroll/payroll-items` |
| Payroll runs list | Adapt from `/payroll-dashboard` |

Leave management:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Leave requests admin view | `/leaves` |
| Leave settings (policies, accruals) | `/leave-settings` |
| Holiday calendar | `/holiday-calendar` |
| Public holidays | `/hrm/holidays` |

Attendance:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Attendance admin view | `/attendance-admin` |
| Timesheets | `/timesheets` |
| Shift and schedule | `/schedule-timing` |
| Overtime register | `/overtime` |

Performance (Phase 3 placeholder, hidden in MVP):

| AndikishaHR feature | SmartHR reference |
|---|---|
| Performance indicators | `/performance/performance-indicator` |
| Performance reviews | `/performance/performance-review` |
| Goal tracking | `/performance/goal-tracking` |

Reports:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Payslip report | `/reports/payslip-report` |
| Attendance report | `/reports/attendance-report` |
| Leave report | `/reports/leave-report` |
| Expense report | `/reports/expenses-report` |
| Employee report | `/reports/employee-report` |
| Daily report | `/reports/daily-report` |

User management:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Users list (manage tenant users) | `/user-management/manage-users` |
| Roles and permissions | `/user-management/roles-permissions` |

Settings:

| AndikishaHR feature | SmartHR reference |
|---|---|
| Profile settings | `/general-settings/profile-settings` |
| Security settings | `/general-settings/security-settings` |
| Notification preferences | `/general-settings/notifications-settings` |
| Connected apps and integrations | `/general-settings/connected-apps` |
| Salary settings | `/app-settings/salary-settings` |
| Approval workflows | `/app-settings/approval-settings` |
| Leave types | `/app-settings/leave-type` |
| Custom fields | `/app-settings/custom-fields` |
| Email settings | `/system-settings/email-settings` |
| Email templates | `/system-settings/email-templates` |
| SMS settings | `/system-settings/sms-settings` |
| SMS templates | `/system-settings/sms-template` |
| OTP settings | `/system-settings/otp-settings` |
| Payment gateways | `/financial-settings/payment-gateways` |
| Tax rates (read-only, sourced from platform-portal) | `/financial-settings/tax-rates` |
| Currencies | `/financial-settings/currencies` |
| Localisation | `/website-settings/localization-settings` |
| Authentication settings | `/website-settings/authentication-settings` |

## tenant-portal `/my/*` (employee self-service)

| AndikishaHR feature | SmartHR reference |
|---|---|
| Employee dashboard (home) | `/employee-dashboard` |
| Profile page | `/pages/profile` |
| Personal details and bank account | `/general-settings/profile-settings` |
| Security (password, 2FA) | `/general-settings/security-settings` |
| Notification preferences | `/general-settings/notifications-settings` |
| Leave requests (employee view) | `/leaves-employee` |
| Attendance (employee view) | `/attendance-employee` |
| Payslips list | Adapt from `/payroll/payslip` |

Note: SmartHR's employee surfaces are less mobile-optimised than what AndikishaHR needs. Use the information architecture as guidance and adapt the actual layout for mobile-first.

## Authentication screens (used by both apps)

SmartHR ships three variants of each auth screen. Pick one variant per screen and rebuild it.

| AndikishaHR feature | SmartHR reference variants |
|---|---|
| Login | `/login` (cover), `/login-2` (illustration), `/login-3` (basic) |
| Register (rare; tenants are provisioned by SUPER_ADMIN, not self-signup) | `/register`, `/register-2`, `/register-3` |
| Forgot password | `/forgot-password`, `/forgot-password-2`, `/forgot-password-3` |
| Reset password | `/reset-password`, `/reset-password-2`, `/reset-password-3` |
| Email verification | `/email-verification`, `/email-verification-2`, `/email-verification-3` |
| Two-step verification | `/two-step-verification`, `/two-step-verification-2`, `/two-step-verification-3` |
| Lock screen | `/lock-screen` |
| 404 error | `/error-404` |
| 500 error | `/error-500` |

## Layout chrome

| AndikishaHR target | SmartHR reference |
|---|---|
| `tenant-portal` admin chrome (sidebar, top bar) | `/layout-transparent` is what Lawrence selected. Also worth comparing: `/layout-modern`, `/layout-two-column` |
| `tenant-portal` employee chrome (mobile-friendly) | Adapt the bottom-nav patterns or the simplified `/layout-without-header` variant |
| `platform-portal` chrome | Use the same chrome as admin since the audience is desktop-only |

## Out-of-scope: do not reference

These SmartHR sections exist but Andikisha does not build them. Do not study them for AndikishaHR work:

- CRM (`/contacts`, `/companies-grid`, `/deals-grid`, `/leads-grid`, `/pipeline`, `/analytics`)
- Projects (`/projects-grid`, `/tasks`, `/task-board`)
- Recruitment (`/job-grid`, `/candidates-grid`, `/refferals`, `/resume-parsing`, `/campus-hiring`)
- Sales (`/estimates`, `/invoices`, `/payments`)
- Accounting (`/accounting/categories`, `/accounting/budgets`)
- Assets (`/assets/asset-list`, `/assets/asset-categories`) — placeholder for Phase 3, not in MVP
- Training (`/training/*`) — placeholder for Phase 3, not in MVP
- Applications (`/application/chat`, `/application/voice-call`, `/application/video-call`, `/application/email`, `/application/social-feed`, `/application/kanban-view`)
- Knowledge base (`/knowledgebase`)
- File manager (`/application/file-manager`)

## Kenya-specific features with no SmartHR analogue

Design these from scratch. No template reference applies.

- Statutory compliance dashboards (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB)
- Compliance calendar (filing deadlines for KRA, NSSF, SHIF, Housing Levy)
- M-Pesa B2C disbursement views and callback log
- KRA iTax filing screens (P10 monthly submission, P9 annual certificate)
- NSSF portal submission tracking
- SHIF portal submission tracking
- Housing Levy portal submission tracking
- Regulatory changelog
- WhatsApp approval thread surfaces (for managers approving leave or expenses)
- USSD session monitoring (platform-portal)
- Earned Wage Access request and disbursement flows
- Casual payroll runs (daily-rated, piece-rate)
- Multi-period payroll calendar (monthly + weekly + bi-weekly + daily in one tenant)
- WHT certificate generation for contractors
- ZKTeco biometric device sync status
- Geofencing zone management for mobile clock-in

For these, the references are the AndikishaHR landing site, the brand guide, existing components in `@andikisha/ui`, and the patterns established in other completed AndikishaHR surfaces.
