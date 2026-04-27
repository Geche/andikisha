# AndikishaHR — Product Planning Document

**Version:** 1.1  
**Status:** Living Document  
**Audience:** Product, Design, and Engineering Teams  
**Last Updated:** April 2026

---

## Table of Contents

1. Product Overview
2. Core Modules and Features
3. User Roles and Permissions
4. System Architecture Considerations
5. Integrations
6. Compliance and Localization
7. User Experience Considerations
8. Roadmap and Prioritization
9. Success Metrics
10. Implementation Status

---

## 1. Product Overview

### Vision

To become the most trusted HR and payroll platform for African businesses — one that works within the realities of the continent, not against them.

### Mission

AndikishaHR gives African SMEs the tools to manage their people accurately, compliantly, and without friction — on any device, in any connectivity condition, at a price that makes sense for their stage of growth.

### Core Value Proposition

Kenya has 1.56 million licensed businesses. Eighty-five percent of them still run payroll on spreadsheets, generating monthly errors that average KES 50,000 to 200,000 for a company with 30 employees. Statutory penalties reach 25% of annual revenue for non-compliance — not an edge case, but a routine risk for businesses without automated systems.

AndikishaHR addresses this directly. The platform automates Kenya's entire statutory compliance stack (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB), distributes payslips to employees on their phones, and files returns with KRA — without requiring the business owner to understand the underlying tax code. It is designed mobile-first because that is how most employees in this market access technology, and it works offline because connectivity is unreliable.

The differentiation is not feature breadth. It is depth of local fit: statutory rules built in, not bolted on; M-Pesa as a primary payment rail, not a plugin; Swahili as a first-class language, not an afterthought.

### Target Users

**Business Owners and Directors**  
Typically 30 to 200 employees. They care about cost, compliance risk, and whether the tool is simple enough that they do not need to hire a specialist to run it. They approve payroll, review headcount costs, and want alerts before penalties happen — not after.

**HR Managers and HR Officers**  
They spend the most time in the system — managing employee records, running payroll, processing leave, generating reports for management, and handling onboarding and exits. They need a platform that reduces administrative time so they can focus on people management.

**Payroll Officers**  
Responsible for accuracy and timeliness. They need clean calculation audit trails, easy correction workflows, and one-click statutory filing. A mistake in payroll has direct financial and legal consequences.

**Line Managers and Supervisors**  
They approve leave, review timesheets, and manage shift schedules for their teams. They access the platform occasionally, mainly on mobile. Workflows need to be simple and approvals need to be one or two taps.

**Employees**  
They want payslips on their phones, leave balances visible without asking HR, and the ability to update their own contact and banking details. Most will access the platform via the PWA on a mid-range Android device with a prepaid data plan.

**System Administrators**  
They configure tenant settings, manage integrations, control RBAC, and oversee audit logs. They are technical users within the customer's organisation, or the platform owner in smaller companies.

---

## 2. Core Modules and Features

---

### Module 1: Employee Management

**Description**  
The central record of every person connected to a tenant — permanent staff, casual workers, contractors, and directors. Every other module references the employee record as its source of truth.

**Feature List**

- Employee profile (personal details, national ID, KRA PIN, contact information, next of kin)
- Employment details (type, department, designation, reporting line, start date, probation end date, employment terms)
- Salary structure assignment (base, allowances, deductions, grade)
- Document repository per employee (contract, ID scans, certificates, NSSF card)
- Onboarding workflow (task checklist, document collection, system access provisioning)
- Offboarding workflow (exit checklist, asset return, final pay calculation, certificate of service generation)
- Probation period tracking with automated manager alerts at configurable intervals
- Employment type management (permanent, contract, casual, director, intern)
- Multi-location and multi-department support
- Organisational chart visualisation
- Bulk employee import via CSV or Excel
- Employee status management (active, on leave, suspended, exited)

**Key User Flows**

*New hire onboarding:* HR manager creates employee profile, assigns employment type and salary structure, triggers onboarding checklist. System notifies employee with login credentials. Employee completes profile, uploads required documents. HR reviews and activates the account. Payroll service picks up the employee on the next scheduled run.

*Employee exit:* HR initiates offboarding. System generates exit checklist (asset return, access revocation, certificate of service, final pay). Payroll calculates terminal benefits including gratuity, outstanding leave days, and accrued overtime. Employee record is archived, not deleted, for audit purposes.

---

### Module 2: Payroll Management

**Description**  
The most technically complex and commercially important module. Handles gross-to-net calculation for all employment types, applies Kenya's full statutory deduction stack, generates payslips, and disburses salary via M-Pesa or bank transfer.

**Feature List**

- Multi-period payroll runs (monthly, bi-weekly, weekly, daily for casual workers)
- Gross-to-net calculation engine with configurable salary components
- PAYE calculation with progressive tax brackets (auto-updated with Finance Bill changes)
- NSSF Tier I and Tier II deduction (employer and employee shares)
- SHIF contribution (2.75% uncapped, minimum KES 300)
- Housing Levy (1.5% each employer and employee)
- NITA levy calculation
- HELB deduction management
- Custom deduction and allowance configuration per employee or grade
- Bonus, commission, and overtime processing
- Salary advance and loan management with automated repayment schedules
- Director payroll with different tax treatment
- Airtime and data allowance processing
- Pension fund deductions (private schemes beyond NSSF)
- Payslip generation and distribution (SMS, email, WhatsApp, in-app)
- Year-end P9 form generation per employee
- P10 annual summary generation
- Payroll approval workflow (prepare, review, approve, disburse)
- Payroll reversal and correction workflows
- Payroll history and audit trail
- Payroll cost reporting by department, location, and cost centre

**Key User Flows**

*Monthly payroll run:* Payroll officer initiates run for the pay period. System aggregates attendance data, applies approved leaves, calculates overtime. Compliance engine applies all statutory deductions at current rates. Officer reviews calculation summary and exception report. Manager approves. System generates payslips and initiates bulk payment via M-Pesa or bank file. Confirmation receipts are stored against the payroll run.

*Payroll correction:* Officer identifies an error post-approval. Initiates reversal for affected employees. Applies corrections. System calculates difference and generates supplementary payslip. Audit trail records original, reversal, and corrected amounts.

---

### Module 3: Compliance Engine

**Description**  
A standalone service that owns the statutory rules layer. It is decoupled from the payroll engine so that regulatory changes can be updated and tested without touching payroll processing logic.

**Feature List**

- Statutory rate table management (PAYE brackets, NSSF limits, SHIF rates, Housing Levy, NITA)
- Auto-versioned rate updates with effective date management
- Compliance calendar (filing deadlines for KRA, NSSF, SHIF, Housing Levy)
- Proactive compliance alerts (notify admins 7, 3, and 1 day before deadlines)
- KRA iTax PAYE return generation (P10 monthly submission format)
- NSSF remittance report generation
- SHIF remittance report generation
- Housing Levy monthly remittance report
- Employment Act compliance checks (minimum wage validation, leave entitlement enforcement, notice period calculation)
- Statutory filing status tracker (filed, pending, overdue, acknowledged)
- Withholding tax (WHT) certificate generation for contractors
- Compliance audit report

**Key User Flows**

*Monthly statutory filing:* System generates PAYE return after payroll approval. Payroll officer reviews filing report. One-click submission to KRA iTax via API. Filing receipt stored against the payroll run period. Compliance dashboard updates filing status to "filed" with timestamp.

*Rate change update:* Finance Bill passes with new PAYE brackets effective July. Admin receives in-app alert. Compliance team reviews proposed rate update in the admin portal. Approves update with effective date. System applies new brackets to all payroll runs from the effective date, without any code changes.

---

### Module 4: Leave Management

**Description**  
Manages all leave types, accruals, approval workflows, and leave calendar for the organisation. Feeds directly into payroll for deductions or payouts.

**Feature List**

- Configurable leave types (annual, sick, maternity, paternity, compassionate, study, unpaid)
- Leave accrual rules per leave type and employment contract
- Leave balance tracking in real time
- Leave request submission by employee (PWA, SMS, WhatsApp)
- Multi-level approval workflow (line manager, HR)
- Leave calendar with team view (see who is on leave before approving)
- Public holiday calendar (Kenya, with regional customisation for other markets)
- Leave encashment calculation
- Carry-forward and expiry rules per leave type
- Maternity and paternity leave tracking with return-to-work alerts
- Leave deduction from payroll (unpaid leave)
- Leave report (utilisation, balance, trends)
- Employment Act compliance enforcement (minimum 21 days annual, 30 days sick, 90 days maternity, 14 days paternity)

**Key User Flows**

*Employee leave request:* Employee opens PWA (offline if needed), selects leave type, picks dates, adds notes. System checks balance and flags conflicts. Line manager receives notification (push, SMS, or WhatsApp). Manager reviews team calendar, approves or declines with comment. Employee notified. Leave calendar and balance update in real time.

*Payroll integration:* At payroll run, system pulls approved unpaid leave days. Deduction is calculated and reflected in payslip with separate line item and explanation.

---

### Module 5: Time, Attendance, and Shift Management

**Description**  
Tracks when employees work — through biometric devices, mobile geofencing, or manual entry. Feeds directly into payroll for overtime and deductions.

**Feature List**

- Biometric device integration (ZKTeco and compatible hardware via SDK)
- Mobile clock-in with GPS geofencing (for field workers and remote teams)
- USSD clock-in as fallback for feature phone users
- Offline attendance capture with sync-on-reconnect
- Manual attendance entry for override or exception handling
- Shift scheduling and rotation management
- Shift template library (fixed, rotating, split shifts)
- Shift assignment by team, department, or individual
- Overtime calculation (1.5x weekday, 2x weekend and public holiday)
- Overtime pre-approval workflow
- Night shift and public holiday differential management
- Attendance exception report (late arrivals, early departures, absent, unaccounted)
- Timesheet approval workflow
- Time and attendance data export to payroll

**Key User Flows**

*Shift scheduling:* Supervisor opens shift calendar for the week on mobile. Assigns shifts to team members. System checks for conflicts with approved leave. Employees notified of their schedule. Shift changes trigger re-notification.

*Biometric sync:* Employees clock in and out on ZKTeco terminal at the site. Device syncs attendance records to the platform at configured intervals. System calculates worked hours against scheduled shift. Exceptions flagged to supervisor for review.

---

### Module 6: Recruitment and Applicant Tracking

**Description**  
Covers the hiring workflow from job requisition to offer acceptance. Keeps the hiring process inside the same platform so that a hired candidate converts directly to an employee record without re-entering data.

**Feature List**

- Job requisition creation and approval
- Job posting (internal and external, including WhatsApp sharing)
- Applicant tracking board (applied, screened, interviewed, offered, hired, rejected)
- CV and document collection
- Interview scheduling with calendar integration
- Interview feedback and scoring
- Offer letter generation with configurable templates
- Digital offer acceptance
- Automatic conversion of accepted candidates to employee records
- Recruitment pipeline analytics (time to hire, source of hire, offer acceptance rate)
- WhatsApp-based candidate communication templates
- Referral tracking

**Key User Flows**

*Hire-to-onboard:* HR creates job requisition. Line manager approves. Job posted. Applications received and tracked on the pipeline board. Shortlisted candidates scheduled for interview. Interviewer submits feedback. Offer generated from salary structure template. Candidate accepts digitally. System creates employee profile pre-populated from application data. Onboarding checklist triggered automatically.

---

### Module 7: Performance and Appraisal

**Description**  
Structures the performance management cycle — goal setting, continuous feedback, periodic reviews, and appraisal scoring. Connects to employee development and salary review workflows.

**Feature List**

- Performance cycle configuration (annual, bi-annual, quarterly)
- Goal setting with KPI and OKR framework support
- Continuous feedback (manager to employee, peer to peer)
- Self-assessment forms
- Manager appraisal forms
- 360-degree feedback (optional module)
- Performance rating and score calculation
- Performance improvement plan (PIP) workflow
- Appraisal completion tracking and reminders
- Performance history per employee
- Performance-linked pay review workflow
- Analytics (rating distribution, completion rate, high performer identification)

**Key User Flows**

*Annual appraisal cycle:* HR opens a new performance period. Employees set goals (or HR sets on their behalf). Mid-year check-in initiated. End-of-year self-assessment submitted. Manager completes appraisal. Scores calibrated. Pay review recommendations generated. Results communicated to employees.

---

### Module 8: Expense Management

**Description**  
Handles employee expense claims, approval, and reimbursement — either as a standalone disbursement or as part of the next payroll run.

**Feature List**

- Expense claim submission with receipt upload
- Expense category configuration
- Single and multi-item claims
- Approval workflow (line manager, finance)
- Expense policy enforcement (per diem limits, allowable categories)
- Reimbursement via M-Pesa or bank (standalone or payroll-linked)
- Expense report by employee, department, category, and period
- Mileage claim calculation
- Advance request against expense

**Key User Flows**

*Field expense claim:* Sales rep submits fuel receipt via PWA. Uploads photo of receipt. System checks against travel policy. Line manager approves on mobile. Finance approves reimbursement. Payment processed via M-Pesa within one business day.

---

### Module 9: Asset Management

**Description**  
Tracks company assets assigned to employees. Ensures assets are returned on offboarding and provides visibility into the total asset register.

**Feature List**

- Asset registry (type, serial number, purchase value, condition)
- Asset assignment to employees
- Assignment agreement generation
- Asset condition tracking
- Maintenance schedule and alerts
- Asset return processing linked to offboarding checklist
- Asset depreciation export for finance
- Vehicle fleet management (for delivery and field teams)
- Asset report by employee, department, and type

---

### Module 10: Employee Self-Service

**Description**  
The employee-facing layer of the platform. Delivered as an offline-capable PWA optimised for low-end Android devices and slow connections.

**Feature List**

- Payslip access and download (current and historical)
- Payslip explanation in plain language (line-by-line breakdown)
- Leave balance view and request submission
- Leave history
- Personal details update (contact, next of kin, bank account)
- Document download (employment contract, certificate of service)
- Attendance and shift schedule view
- Expense claim submission
- Salary advance request
- Notification centre (leave approvals, payroll notifications, announcements)
- Multi-language support (English and Swahili at launch, extensible)
- Offline capability (core views cached, actions queued for sync)

---

### Module 11: Analytics and Reporting

**Description**  
Surfaces HR and payroll data as actionable intelligence for managers and executives. Compliance-first reporting ensures the outputs meet what KRA and labour authorities actually require.

**Feature List**

- Executive HR dashboard (headcount, attrition, leave utilisation, payroll cost trend)
- Payroll cost analysis (by department, location, cost centre)
- Payroll cost vs budget variance
- Statutory compliance dashboard (filing status per obligation, upcoming deadlines)
- Headcount and turnover report
- Leave utilisation report
- Attendance and overtime report
- Custom report builder
- Scheduled report delivery (email)
- Export formats (PDF, Excel, CSV, KRA-compatible text formats)
- Audit trail report (all system actions, user actions, data changes)

---

### Module 12: Notifications and Communication

**Description**  
Handles all outbound communication from the platform — to employees, managers, and administrators — across multiple channels.

**Feature List**

- In-app notification centre
- Email notifications (leave approvals, payroll ready, filing reminders)
- SMS notifications (payslip alerts, leave approvals, compliance deadlines)
- WhatsApp Business API integration (leave requests, payslip links, approval notifications)
- Push notifications via PWA service worker
- Broadcast announcements (from HR to all employees or defined groups)
- Notification preference management per user
- Compliance alert notifications (rate changes, deadline reminders, filing failures)

---

## 3. User Roles and Permissions

### Role Definitions

Roles follow the format `ROLE_NAME` as defined in the auth-service. Each role maps to a set of permissions expressed as `resource:action:scope`. Permissions are evaluated at the API Gateway and enforced within each service.

**SUPER_ADMIN**  
Platform-level administration for AndikishaHR internal operations. Manages tenants, billing configuration, and platform-wide settings. Has no access to any tenant's employee or payroll data. This role is never assigned to a customer user.

**ADMIN**  
Tenant-level administrator — typically the business owner or a designated system admin within the customer organisation. Configures system settings, manages integrations, sets leave and payroll policies, and manages user accounts and role assignments within their tenant. Has full visibility into all data within their tenant.

**HR_MANAGER**  
Full HR access within the tenant. Can manage all employee records, run and approve payroll, manage leave policies, view all compliance reports, and access full analytics. Cannot modify platform-level compliance rate tables — that remains with ADMIN. Cannot access billing or tenant configuration.

**PAYROLL_OFFICER**  
Responsible for payroll processing, calculation, and disbursement. Can initiate and process payroll runs, manage salary structures, generate payslips, and view compliance reports. Cannot create, edit, or delete employee records. Cannot approve payroll unilaterally — approval requires HR_MANAGER or ADMIN sign-off. Cannot approve leave.

**HR**  
General HR operations role. Manages employee records (create, edit, view), handles onboarding and offboarding workflows, manages leave requests, and generates standard HR reports. Cannot process or approve payroll. Cannot modify compliance rate tables or statutory settings.

**LINE_MANAGER**  
Department-scoped management access. Can view employees within their assigned department only. Approves leave requests and timesheets for direct reports. Manages shift schedules for their team. Completes performance appraisals for direct reports. Cannot access payroll data, salary information, or employees outside their department.

**EMPLOYEE**  
Self-service access only. Can view their own payslips, leave balances, attendance records, shift schedule, and personal documents. Can submit leave requests, expense claims, and salary advance requests. Can update their own contact details, next of kin, and bank account information. Cannot view any other employee's data.

### Permission Matrix

Permissions follow `resource:action:scope`. Scope values are `all` (entire tenant), `department` (own department only), and `own` (own record only).

| Resource | Permission | SUPER_ADMIN | ADMIN | HR_MANAGER | PAYROLL_OFFICER | HR | LINE_MANAGER | EMPLOYEE |
|---|---|---|---|---|---|---|---|---|
| **employee** | employee:create:all | Yes | Yes | Yes | No | Yes | No | No |
| | employee:read:all | Yes | Yes | Yes | Yes | Yes | No | No |
| | employee:read:department | Yes | Yes | Yes | Yes | Yes | Yes | No |
| | employee:read:own | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| | employee:update:all | Yes | Yes | Yes | No | Yes | No | No |
| | employee:update:own | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| | employee:delete:all | Yes | Yes | No | No | No | No | No |
| **payroll** | payroll:process:all | Yes | Yes | Yes | Yes | No | No | No |
| | payroll:approve:all | Yes | Yes | Yes | No | No | No | No |
| | payroll:read:all | Yes | Yes | Yes | Yes | No | No | No |
| | payroll:read:own | Yes | Yes | Yes | Yes | Yes | No | Yes |
| | payroll:configure:all | Yes | Yes | Yes | No | No | No | No |
| **leave** | leave:approve:all | Yes | Yes | Yes | No | Yes | No | No |
| | leave:approve:department | Yes | Yes | Yes | No | Yes | Yes | No |
| | leave:read:all | Yes | Yes | Yes | No | Yes | No | No |
| | leave:read:department | Yes | Yes | Yes | No | Yes | Yes | No |
| | leave:read:own | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| | leave:submit:own | No | No | No | No | No | No | Yes |
| | leave:configure:all | Yes | Yes | Yes | No | No | No | No |
| **attendance** | attendance:read:all | Yes | Yes | Yes | Yes | Yes | No | No |
| | attendance:read:department | Yes | Yes | Yes | Yes | Yes | Yes | No |
| | attendance:read:own | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| | attendance:approve:department | Yes | Yes | Yes | No | Yes | Yes | No |
| | attendance:configure:all | Yes | Yes | Yes | No | No | No | No |
| **document** | document:read:all | Yes | Yes | Yes | No | Yes | No | No |
| | document:read:own | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| | document:create:all | Yes | Yes | Yes | No | Yes | No | No |
| | document:delete:all | Yes | Yes | No | No | No | No | No |
| **report** | report:read:all | Yes | Yes | Yes | Yes (payroll only) | Yes (HR only) | Yes (department only) | No |
| | report:export:all | Yes | Yes | Yes | Yes (payroll only) | Yes (HR only) | No | No |
| | report:schedule:all | Yes | Yes | Yes | No | No | No | No |
| **tenant** | tenant:manage:all | Yes | No | No | No | No | No | No |
| | tenant:configure:own | No | Yes | No | No | No | No | No |
| | tenant:read:own | Yes | Yes | No | No | No | No | No |
| **user** | user:create:all | Yes | Yes | No | No | No | No | No |
| | user:read:all | Yes | Yes | Yes | No | Yes | No | No |
| | user:update:all | Yes | Yes | No | No | No | No | No |
| | user:assign-role:all | Yes | Yes | No | No | No | No | No |
| | user:delete:all | Yes | Yes | No | No | No | No | No |

---

## 4. System Architecture Considerations

### High-Level Architecture

AndikishaHR is built on Java 21 (LTS) with Spring Boot 3.4 and Spring Cloud 2024.0, organised as a Gradle multi-module build across 13 microservices, 3 shared libraries, and 2 frontend applications. Each service owns its domain, its database, and its business logic. Services communicate synchronously via gRPC for operations that require an immediate response, and asynchronously via RabbitMQ for event-driven workflows where eventual consistency is acceptable.

The system is multi-tenant with schema-per-tenant isolation in PostgreSQL 16. Each tenant's data is physically separated at the database schema level, preventing any accidental data leakage across organisations while keeping the operational cost of running a single PostgreSQL cluster per service manageable.

The frontend is a pnpm workspace containing two Next.js 15 applications: `admin-portal` (port 3000) for HR, payroll, and management users, and `employee-portal` (port 3001) for self-service employee access. Both applications share packages from `@andikisha/ui`, `@andikisha/api-client`, and `@andikisha/shared-types`. The employee portal is shipped as an offline-capable PWA with service worker caching so that core features work without active connectivity.

### Shared Libraries

Three shared Gradle modules provide cross-cutting concerns without duplicating business logic across services.

`andikisha-common` provides the `BaseEntity` (auditable JPA entity with `createdAt`, `updatedAt`, `createdBy`, `version`), the `Money` value object (amount plus currency with arithmetic operations), and `TenantContext` (thread-local tenant identifier propagated through the request lifecycle).

`andikisha-proto` holds all gRPC `.proto` definitions. Every service that exposes or consumes a gRPC interface imports these definitions — client and server always share the same contract.

`andikisha-events` contains the RabbitMQ domain event classes published and consumed across services (for example, `EmployeeCreatedEvent`, `PayrollApprovedEvent`, `LeaveRequestedEvent`). Services declare typed listeners against these classes rather than string-based topic names.

### Service Map

Each service follows a four-layer DDD package structure: `domain/` (entities, value objects, aggregates, domain events), `application/` (use cases, command handlers, query handlers), `infrastructure/` (repositories, messaging adapters, external clients), and `presentation/` (REST controllers, gRPC service implementations).

Authentication is validated once at the API Gateway. The gateway forwards `X-Tenant-ID`, `X-User-ID`, and `X-User-Role` headers to downstream services — services trust these headers without re-validating the JWT.

| Service | HTTP Port | gRPC Port | Responsibility | Communication Pattern |
|---|---|---|---|---|
| api-gateway | 8080 | — | Single entry point via Spring Cloud Gateway (reactive), JWT validation, rate limiting, request routing | REST inbound, gRPC outbound |
| auth-service | 8081 | 9081 | JWT issuance and refresh, session management, RBAC enforcement, user registration | gRPC (sync) |
| employee-service | 8082 | 9082 | Employee lifecycle, org structure, department and position management | gRPC (sync), RabbitMQ (events) |
| tenant-service | 8083 | 9083 | Tenant provisioning, schema management, billing metadata | gRPC (sync) |
| payroll-service | 8084 | 9084 | Gross-to-net calculation, payslip generation, payment file creation | gRPC (sync), Spring Batch (background jobs) |
| compliance-service | 8085 | 9085 | Statutory rate management, compliance rules, filing report generation, country pack configuration | gRPC (sync), RabbitMQ (events) |
| time-attendance-service | 8086 | 9086 | Clock-in/out, biometric sync, shift scheduling, overtime calculation | gRPC (sync), RabbitMQ (events) |
| leave-service | 8087 | 9087 | Leave policies, request workflows, balance tracking, calendar | gRPC (sync), RabbitMQ (events) |
| document-service | 8088 | 9088 | File storage, versioning, access control, document generation | gRPC (sync) |
| notification-service | 8089 | 9089 | Multi-channel notifications (email, SMS, WhatsApp, push) | RabbitMQ (consumer) |
| integration-hub-service | 8090 | 9090 | M-Pesa, KRA iTax, NSSF, SHIF, bank APIs, biometric device adapters | RabbitMQ + REST adapters |
| analytics-service | 8091 | 9091 | Read models, report generation, dashboard data, scheduled exports | CQRS read side, Spring Batch (scheduled reports) |
| audit-service | 8092 | 9092 | Immutable event log, KDPA compliance, data subject access | RabbitMQ (consumer) |

### Key Architectural Principles

**Domain-Driven Design.** Each service represents a bounded context. Business rules live inside the `domain/` layer of the service that owns them. Shared libraries (`andikisha-common`, `andikisha-proto`, `andikisha-events`) are limited to cross-cutting infrastructure — never shared business logic.

**Event-driven for lifecycle events.** When an employee is terminated, the Employee Service publishes `EmployeeTerminatedEvent` to RabbitMQ via `andikisha-events`. The Payroll Service, Leave Service, and Notification Service each react independently. No service calls another service directly for lifecycle side effects.

**Compliance Service is sovereign.** No other service calculates statutory deductions. The Payroll Service calls the Compliance Service via gRPC for the applicable rules and rates, receives them, and applies them. This means compliance logic has exactly one place to be updated, tested, and audited.

**Offline-first PWA.** The employee portal uses a service worker to cache critical data (payslips, leave balances, shift schedules). Write actions (leave requests, attendance clock-in) queue locally when offline and sync when connectivity returns. This is not a degraded mode — it is the design.

**Spring Batch for background processing.** Payroll runs, report generation, bulk notifications, and statutory report building all run as Spring Batch jobs. These are never blocking operations on the request lifecycle. Spring Batch provides restart-on-failure and step-level audit trails for long-running jobs.

**Persistence stack.** Each service uses Spring Data JPA with Hibernate for the ORM layer and Flyway for schema migrations. Flyway migration scripts are version-controlled per service in `src/main/resources/db/migration/`. Redis is used for caching (Spring Cache with Redis backend) and rate limiting at the gateway.

---

## 5. Integrations

### Payment Integrations

**Safaricom M-Pesa (Daraja API)**
Bulk salary disbursement via the B2C (Business to Customer) API. Employees receive salary directly to their M-Pesa wallet. The Integration Hub manages the Daraja OAuth token lifecycle, initiates the bulk payment request, and handles the asynchronous callback confirming payment status per employee. Failed payments are flagged in the payroll run summary and can be retried individually.

**Bank API Integrations**
For employees with bank accounts, the system generates EFT credit files in the format required by major Kenyan banks (KCB, Equity, Co-operative, NCBA, Stanbic). Files are either uploaded manually by the payroll officer or sent via direct bank API where available.

### Government and Statutory Integrations

**KRA iTax API**
Monthly PAYE return submission (P10 form) directly to the KRA iTax portal via API. The Compliance Service generates the submission payload after payroll approval, and the Integration Hub handles authentication and submission. Filing receipt and acknowledgement number are stored against the payroll period.

**NSSF Portal**
Monthly NSSF remittance report in the format required for NSSF portal upload. Phase 2 target is direct API submission where the NSSF portal supports it.

**SHIF (Social Health Authority)**
Monthly SHIF contribution report for the SHA portal. Integration pattern mirrors NSSF.

**eCitizen / Housing Levy**
Monthly Housing Levy remittance aligned with KRA iTax submission requirements.

### Biometric Device Integration

**ZKTeco SDK**
Two-way integration with ZKTeco biometric terminals, the most widely used brand among Kenyan SMEs. The Integration Hub runs a background sync service that pulls attendance records from connected devices at configured intervals. It also pushes employee fingerprint templates to devices when new employees are enrolled.

Supports fingerprint and facial recognition models. The integration is designed to accommodate other biometric hardware vendors through an adapter pattern in the Integration Hub.

### Communication Integrations

**Africa's Talking**
SMS and USSD gateway. Handles payslip SMS notifications, leave approval alerts, compliance deadline reminders, and the USSD interface for employees using feature phones.

**WhatsApp Business API**
Outbound notifications for leave approvals, payslip availability, and urgent compliance alerts. Inbound message handling for leave request initiation via WhatsApp (Phase 2).

**Email (SMTP / SendGrid)**
Standard email notifications, payslip PDF delivery, and report scheduling.

### Third-Party HR and Productivity Integrations (Phase 3)

- Google Workspace and Microsoft 365 (calendar sync for leave and interviews)
- Asana and Trello (lightweight project and task assignment visibility)
- Accounting software exports (QuickBooks, Xero, Sage) for payroll journal entries

---

## 6. Compliance and Localization

### Kenya Labour Law Compliance

**Employment Act 2007**

| Entitlement | Requirement | AndikishaHR Enforcement |
|---|---|---|
| Annual leave | 21 working days per year after 12 months | Accrual tracking, balance enforcement |
| Sick leave | 30 days per year (with certificate) | Leave type configuration with document requirement |
| Maternity leave | 90 days full pay | Separate leave type, return-to-work alert |
| Paternity leave | 14 days full pay | Separate leave type |
| Notice period | 30 days (under 5 years), 60 days (5+ years) | Automated calculation on offboarding |
| Overtime | 1.5x weekday, 2.0x weekend and public holidays | Rate applied in payroll calculation |
| Minimum wage | KES 15,201 per month (2024) | Salary validation on employee creation and review |
| Termination | Grounds and process per Employment Act | Offboarding workflow with compliance checklist |

### Statutory Deductions

**PAYE (Pay As You Earn)**  
Progressive tax brackets updated with every Finance Bill. The Compliance Service holds versioned rate tables with effective dates. The personal relief (KES 2,400 per month as of 2024) and insurance relief are applied automatically. Director income and benefits in kind are handled as a separate tax treatment.

**NSSF**  
Two-tier system: Tier I on the lower earnings limit (currently KES 8,000), Tier II on earnings between the lower and upper limit (currently KES 72,000). Both employer and employee contributions calculated. Employers who operate approved alternative pension schemes can opt out of Tier II — the platform supports this configuration per employer.

**SHIF (Social Health Insurance Fund)**  
2.75% of gross salary, uncapped, minimum KES 300 per month. Fully tax-deductible from December 2024. The platform applies the SHIF relief when calculating taxable income.

**Housing Levy**  
1.5% employer and 1.5% employee contribution (3% total). Fully deductible from December 2024. Monthly submission to KRA iTax.

**NITA Levy**  
0.5% of gross salary, employer contribution only.

**HELB Deductions**  
Employee-specific deduction based on loan agreement. Managed per employee record with repayment amount and term.

**Withholding Tax**  
Applied to contractor and freelancer payments. Certificate of withholding tax generated at each payment.

### Kenya Data Protection Act (KDPA) 2019

**Data Subject Rights**  
The platform supports data subject access requests (employees requesting all data held about them), the right to correction, and the right to deletion where legally permissible (noting that payroll and tax records have statutory retention requirements).

**Consent Management**  
Consent is collected at employee onboarding for data processing. Records of consent are stored with timestamps and version references.

**Audit Trail**  
Every data change, payroll action, and user access event is written to the Audit Service's immutable log. This provides the evidence trail required in the event of a KDPA investigation.

**Data Residency**  
Primary data is stored in AWS eu-west-1 (Ireland) with the option to configure Kenyan-region storage when AWS af-south-1 (Cape Town) or a local cloud provider is specified. This is configurable at the tenant level.

**Breach Notification**  
The platform generates automated alerts to Tenant Admins for any detected security event (failed login threshold exceeded, unusual data export volumes) to support the 72-hour breach notification requirement under KDPA.

### Localisation

**Languages**  
English (default). Swahili (Phase 1, first-class — not a translated overlay). Additional East African languages in Phase 3 based on market expansion.

**Currency**  
Kenya Shilling (KES) at launch. Tanzania Shilling (TZS), Uganda Shilling (UGX), Rwanda Franc (RWF) in Phase 2 for regional expansion.

**Date and Time**  
East Africa Time (UTC+3). Date format follows Kenyan convention (DD/MM/YYYY).

**Public Holidays**  
Kenya public holiday calendar maintained in the system and updated annually. Customisable per tenant for other markets.

---

## 7. User Experience Considerations

### Core UX Principles

**Mobile is the primary surface.**  
Design for a 5-inch Android screen first. Every critical workflow — payslip viewing, leave request, attendance clock-in, approval — must complete in three taps or fewer on mobile. Desktop is secondary.

**Data cost is real.**  
Payloads must be lean. The PWA caches aggressively. Images are compressed. Fonts are system fonts where quality permits. The goal is a useful experience at 2G speeds.

**Offline is not a failure state.**  
When the network drops, the app does not break — it tells the user clearly what is available offline, and queues any write actions for sync when connectivity returns. No data should be lost due to a lost connection.

**Complexity lives behind the UI, not in front of it.**  
PAYE, NSSF Tier II, SHIF, Housing Levy — this is a genuinely complex compliance stack. The employee must never need to understand it. The payslip shows clear line items with plain-language labels. The payroll officer gets a clean calculation summary, not raw tax code.

**Trust is built through transparency.**  
Employees who understand their payslip trust the employer more. Every deduction line on a payslip should have an expandable explanation in plain English and Swahili — what it is, why it is deducted, and what the legal basis is.

**System feedback must be immediate and clear.**  
Every action — leave request submitted, payroll approved, filing sent — must confirm success or failure in plain language. No spinner with no outcome. No silent failures.

### Critical Flows

**Employee Onboarding (First Login)**  
The employee receives an SMS or WhatsApp link on their first day. They open the PWA, set a PIN (no password complexity requirements), and land on a clean dashboard showing their payslip, leave balance, and shift. The setup is guided, not assumed. A contextual walkthrough explains each section on first visit.

**Payslip Access**  
Employee opens PWA. Taps "My Payslip." Current month's payslip loads immediately from cache if offline. Each line item is labelled in plain language. Tapping a deduction item expands a one-sentence explanation. The employee can share the payslip as PDF or WhatsApp forward for loan or rental applications.

**Leave Request**  
Employee selects leave type, picks start and end dates (calendar shows existing team leave to help them choose sensible dates). Submits. Line manager receives a push notification, SMS, or WhatsApp. Manager approves with one tap. Employee receives confirmation. The leave balance updates in real time.

**Payroll Run (Payroll Officer)**  
Officer initiates run from dashboard. System pre-fills the period dates, pulls all active employees, applies attendance data and approved leaves. Officer reviews the summary screen: total gross, total deductions broken down by type, net pay, headcount changes since last run. Exception report flags anomalies (zero-hour employees, new joiners, leavers). Officer approves. System generates payslips, sends notifications, and initiates payment disbursement.

**HR Onboarding Flow (Admin Setup)**  
When a new organisation joins, a setup wizard walks the Tenant Admin through: company details, statutory registrations (PIN, NSSF number, SHIF number), leave policy configuration, pay frequency, and connecting their first integration (M-Pesa or bank). The wizard is estimated to take under 30 minutes for a standard SME. Default settings are sensible Kenyan defaults, not blank forms.

---

## 8. Roadmap and Prioritisation

### MVP — Target: April 2026

The MVP delivers the core loop that justifies a subscription: accurate, compliant payroll for permanent and casual employees, with payslips reaching employees on their phones and statutory returns ready for filing.

| Feature | Priority Rationale |
|---|---|
| Employee Management (create, edit, import, exit) | Foundation for every other module |
| Payroll Engine (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB) | Core product, primary revenue justification |
| Casual Payroll (daily and weekly runs) | Large segment of Kenyan workforce, immediate differentiator |
| Payslip generation and distribution (SMS, email, in-app) | Employee-facing proof of value |
| Leave Management (request, approval, balance) | High-frequency employee workflow |
| Basic Time and Attendance (manual and biometric sync) | Required for payroll accuracy |
| KRA iTax PAYE return generation | Compliance requirement |
| NSSF and SHIF remittance report generation | Compliance requirement |
| M-Pesa salary disbursement | Payment differentiator for Kenyan market |
| Employee Self-Service PWA (offline-capable) | Mobile-first delivery |
| HR Dashboard and basic payroll reports | Management visibility |
| RBAC (ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR, LINE_MANAGER, EMPLOYEE) | Required for multi-user access |
| Multi-tenant architecture | SaaS foundation |
| Audit log | KDPA compliance requirement |
| English and Swahili language support | Local market requirement |

**Service ownership — MVP features**

| Feature | Owning Service(s) |
|---|---|
| Employee Management | employee-service |
| Payroll Engine and Casual Payroll | payroll-service + compliance-service |
| Payslip generation and distribution | document-service + notification-service |
| Leave Management | leave-service |
| Basic Time and Attendance | time-attendance-service |
| KRA, NSSF, SHIF reporting | compliance-service + integration-hub-service |
| M-Pesa salary disbursement | integration-hub-service |
| Employee Self-Service PWA | frontend/employee-portal |
| HR Dashboard and reports | frontend/admin-portal + analytics-service |
| RBAC | auth-service |
| Multi-tenant architecture | Shared infrastructure (tenant-service + andikisha-common) |
| Audit log | audit-service |

---

### Phase 2 — Months 3 to 9 Post-Launch

| Feature | Priority Rationale |
|---|---|
| Shift Management | Retail, hospitality, and manufacturing demand |
| Expense Management with M-Pesa reimbursement | Common SME need, completes the payroll loop |
| Geofencing clock-in (field workers) | No hardware required, expands addressable market |
| Loan and salary advance management | Common benefit in Kenyan companies |
| Director payroll (different tax treatment) | Regulatory requirement for SME directors |
| P9 and P10 year-end form generation | Annual compliance obligation |
| WhatsApp leave approval and notification | High-impact UX upgrade for this market |
| USSD interface for feature phone employees | Expands reach to non-smartphone workforce |
| Contractor and gig worker management with WHT | Growing gig economy segment |
| Analytics expansion (custom reports, cost forecasting) | Management value beyond compliance |
| Tanzania and Uganda country packs (TZS, UGX, local compliance) | Regional expansion |

**Service ownership — Phase 2 features**

| Feature | Owning Service(s) |
|---|---|
| Shift Management | time-attendance-service |
| Geofencing clock-in | time-attendance-service |
| Expense Management with M-Pesa reimbursement | NEW expense-service (14th service) |
| Loan and salary advance management | payroll-service |
| Director payroll | payroll-service |
| P9 and P10 year-end forms | compliance-service + document-service |
| WhatsApp notifications | notification-service |
| USSD interface | integration-hub-service (Africa's Talking USSD adapter) |
| Contractor and gig worker management | employee-service |
| Analytics expansion | analytics-service |
| Tanzania and Uganda country packs | compliance-service |

---

### Phase 3 — Months 9 to 18 Post-Launch

| Feature | Priority Rationale |
|---|---|
| Recruitment and ATS | Complete the hire-to-retire loop |
| Performance and Appraisal | Natural upsell for existing payroll customers |
| Asset Management | Common SME need, links to onboarding and offboarding |
| 360-degree feedback | Mid-market and growing SME demand |
| Advanced analytics and predictive HR | Enterprise and scaling company need |
| Google Workspace and Microsoft 365 integration | Used by most professional SMEs |
| Accounting software export (QuickBooks, Xero, Sage) | Finance team demand |
| Rwanda and Ethiopia country packs | Regional expansion |
| Employee financial wellness tools | Differentiation and employee engagement |
| In-app compliance knowledge base (English and Swahili) | Reduces support load, builds trust |

**Service ownership — Phase 3 features**

| Feature | Owning Service(s) |
|---|---|
| Recruitment and ATS | NEW recruitment-service (15th service) |
| Performance and Appraisal, 360 feedback | NEW performance-service (16th service) |
| Asset Management | NEW asset-service (17th service) |
| Google Workspace and Microsoft 365 integration | integration-hub-service |
| QuickBooks, Xero, Sage accounting exports | integration-hub-service |
| Advanced analytics and predictive HR | analytics-service |
| Rwanda and Ethiopia country packs | compliance-service |

---

### Prioritisation Rationale

Payroll and compliance are prioritised absolutely in MVP because they are the reason a business buys an HR platform in the first place. A business owner does not switch from Excel because they want a recruitment module — they switch because they got a KRA penalty or because payroll took three days a month. That is the pain, and that is where we start.

Employee self-service and mobile delivery are in MVP because they are how the employees experience the product daily. An HR platform that only the HR team uses is a spreadsheet with a login screen. The employees need to see the value.

Everything in Phase 2 either extends the payroll and compliance core (shift management, expense management, contractor payroll) or dramatically improves the user experience in ways that matter specifically to this market (WhatsApp notifications, USSD, geofencing). Phase 3 adds the features that turn a payroll tool into a full HR platform — the modules that drive upsell and retention at scale.

---

## 9. Success Metrics

### Adoption Metrics

| Metric | Target (End of Year 1) |
|---|---|
| Paying customers (tenants) | 200 |
| Employees processed per month | 10,000 |
| Month-on-month customer growth rate | 15% |
| Trial-to-paid conversion rate | 25% |
| Customer churn rate (monthly) | Under 3% |
| Net Promoter Score | 45 or above |

### Engagement Metrics

| Metric | Target |
|---|---|
| Monthly active users (employees on PWA) | 60% of enrolled employees |
| Payslip views per pay cycle | 70% of all employees |
| Leave requests submitted digitally | 80% of all leave requests |
| Payroll runs completed without manual correction | 90% |
| Payroll officer time to complete monthly run | Under 2 hours for a 50-employee company |

### Payroll Accuracy Metrics

| Metric | Target |
|---|---|
| Payroll calculation error rate | Under 0.1% of payslips per run |
| Statutory filing on-time rate | 99% of tenants |
| Failed M-Pesa disbursements | Under 1% per payroll run |
| Payroll reversal rate | Under 2% of runs |

### Compliance Metrics

| Metric | Target |
|---|---|
| KRA iTax filing success rate | 98% first-attempt success |
| NSSF remittance report accuracy | 100% (zero tolerance) |
| SHIF remittance report accuracy | 100% (zero tolerance) |
| Compliance alert open rate | 70% of admins view alert within 24 hours |
| Rate table update deployment time after Finance Bill | Under 48 hours |

### System Performance Metrics

| Metric | Target |
|---|---|
| API response time (p95) | Under 300ms |
| PWA time to interactive on 3G | Under 4 seconds |
| Payroll run processing time (1,000 employees) | Under 5 minutes |
| Platform uptime | 99.9% monthly (under 45 minutes downtime) |
| PWA offline availability for core views | 100% when previously loaded |

### Financial Metrics

| Metric | Target (End of Year 1) |
|---|---|
| Monthly Recurring Revenue (MRR) | KES 3 million |
| Average Revenue Per Account (ARPA) | KES 15,000 per month |
| Customer Acquisition Cost (CAC) | Under KES 20,000 |
| Payback period | Under 18 months |
| Gross margin | Above 70% |

---

## 10. Implementation Status

Current build state as of April 2026. This table is updated at the start of each sprint.

| Component | Status | Notes |
|---|---|---|
| Project scaffolding (Gradle multi-module) | Complete | 13 services + 3 shared libraries + 2 frontend apps |
| Shared libraries (BaseEntity, Money, TenantContext, events, protos) | Complete | All compiled and tested |
| Auth Service (JWT, RBAC, gRPC) | Complete | Register, login, refresh, permissions, gRPC validation |
| Employee Service | Not started | Next priority |
| Tenant Service | Not started | Build alongside Employee Service |
| Payroll Service | Not started | Depends on Employee and Compliance services |
| Compliance Service | Not started | Tax rate engine, statutory rules |
| Leave Service | Not started | Depends on Employee Service |
| Time and Attendance Service | Not started | Depends on Employee Service |
| Document Service | Not started | Phase 3 infrastructure priority |
| Notification Service | Not started | Phase 3 infrastructure priority |
| Integration Hub Service | Not started | M-Pesa, KRA, NSSF adapters |
| Analytics Service | Not started | Phase 4 |
| Audit Service | Not started | Phase 4 |
| API Gateway | Not started | Build after Phase 1 services exist |
| Admin Portal (Next.js) | Skeleton | Routes and layout scaffolded |
| Employee Portal (Next.js) | Skeleton | Routes and layout scaffolded |
| Docker infrastructure | Not started | docker-compose.infra.yml planned |
| CI/CD pipeline | Not started | GitHub Actions planned |

---

*Document prepared for internal use by the AndikishaHR Product, Design, and Engineering teams. This is a living document — update it as product decisions evolve, market feedback arrives, and the roadmap is refined.*

*Owner: Product Team*  
*Version: 1.1*  
*Last Updated: April 2026*

---

## Changelog

### Version 1.1 — April 2026

**Technology Stack (Section 4)**
Updated backend stack references from NestJS/TypeScript to Java 21 LTS, Spring Boot 3.4, Spring Cloud 2024.0, and Gradle Kotlin DSL multi-module build. Updated persistence references from Prisma ORM to Spring Data JPA, Hibernate, and Flyway. Updated background job processing references from BullMQ to Spring Batch. Added shared library descriptions for `andikisha-common`, `andikisha-proto`, and `andikisha-events`. Updated Service Map with explicit HTTP and gRPC port assignments for all 13 services. Documented the four-layer DDD package structure (`domain/`, `application/`, `infrastructure/`, `presentation/`) applied per service. Updated API Gateway description to Spring Cloud Gateway (reactive). Documented header forwarding pattern (`X-Tenant-ID`, `X-User-ID`, `X-User-Role`) from gateway to downstream services.

**User Roles (Section 3)**
Replaced role names with canonical auth-service role constants: `SUPER_ADMIN`, `ADMIN`, `HR_MANAGER`, `PAYROLL_OFFICER`, `HR`, `LINE_MANAGER`, `EMPLOYEE`. Added `HR` as a distinct role separate from `HR_MANAGER`. Replaced the original permission matrix with a resource:action:scope format matrix covering all eight resource types (employee, payroll, leave, attendance, document, report, tenant, user) across all seven roles.

**Roadmap (Section 8)**
Added service ownership mapping tables under MVP, Phase 2, and Phase 3. Identified `expense-service` as a new 14th service in Phase 2. Identified `recruitment-service`, `performance-service`, and `asset-service` as new services (15th, 16th, 17th) in Phase 3. Updated RBAC entry in MVP feature table to use new role names. No features were added, removed, or reprioritised.

**Implementation Status (Section 10)**
New section added documenting current build state across all services, shared libraries, frontend applications, and infrastructure components.

**No changes made to:** vision, mission, value proposition, target users, module feature lists, user flows, integrations, compliance and localization content, UX principles, critical flows, success metrics, or financial targets.
