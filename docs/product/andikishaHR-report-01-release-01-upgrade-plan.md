# AndikishaHR — Release Plan: Service Upgrades & New Features

**Subtitle:** REPORT 01 — Current Services Upgrade Plan (Release 01)  
**Version:** 1.0  
**Date:** April 2026  
**Audience:** Product, Engineering, and Design Teams  
**Source:** Derived from the AndikishaHR Feature Strategy & Differentiation Roadmap, Service Modifications Report, and Product Planning Document v1.1

---

## Scope Statement

Release 01 covers all enhancements and improvements to the 13 existing services
defined in the original system architecture. All 13 services are implemented.
This release upgrades each service to support the expanded platform capabilities
defined in the feature strategy — including casual payroll, earned wage access,
versioned compliance, WhatsApp workflows, geofenced attendance, and AI-ready
analytics infrastructure.

Release 02 must not begin until all 13 services in this release have completed
UAT and are deployed to production.

---

## 1. API Gateway

**Service:** `api-gateway` | HTTP 8080 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Routes only cover the original 13 services. No rate limiting tiers. No circuit breaker configuration. |
| Proposed Improvement | Expand route table to all 17 services. Add per-tenant rate limiting via Redis (Starter: 60 req/min, Professional: 300, Enterprise: 1,000). Add Resilience4j circuit breakers per route with structured `503` fallback responses. Apply a concurrent-run lock on payroll disbursement endpoints. |
| Business Impact | Prevents one tenant from degrading platform performance for others. Protects payroll disbursement from duplicate runs. Gives enterprise customers a predictable SLA. |
| Technical Scope | Medium |
| Dependencies | Redis (already in infrastructure stack). All 17 services must have stable HTTP ports before gateway routes are finalised. |

---

## 2. Auth Service

**Service:** `auth-service` | HTTP 8081 / gRPC 9081 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | No support for feature phone users — the JWT flow requires a browser or native app. No automated SUPER_ADMIN provisioning endpoint for platform bootstrap. |
| Proposed Improvement | Add USSD session entity — a 4-digit PIN mapped to a short-lived session token (5-minute TTL) for employees on basic phones. Add internal-only SUPER_ADMIN provisioning endpoint for tenant bootstrap. Add `ValidateUssdSession` gRPC RPC for the Integration Hub to call during USSD flows. |
| Business Impact | Extends platform access to employees without smartphones — critical for agriculture, security, construction, and manufacturing workforce segments. |
| Technical Scope | Low |
| Dependencies | Integration Hub Service (consumes the new gRPC RPC). Africa's Talking USSD channel (Integration Hub manages the external connection). |

---

## 3. Employee Service

**Service:** `employee-service` | HTTP 8082 / gRPC 9082 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Employment type only covers PERMANENT, CONTRACT, and INTERN. No distinction between casual workers (daily-rated) and independent contractors (WHT applies). No language preference field for Swahili payslip delivery. No attrition risk score field — risk data cannot be surfaced on the HR dashboard without querying the Analytics Service on every page load. No salary advance tracking separate from payroll deductions. |
| Proposed Improvement | Extend `EmploymentType` enum to include CASUAL, CONTRACTOR, and DIRECTOR. Add `preferredLanguage` field ("en" or "sw") to the employee record. Add `attritionRiskScore` and `attritionRiskUpdatedAt` fields written by the Analytics Service via a new gRPC RPC. Add `ewaEnabled`, `ewaStatus`, `ewaOutstandingBalance`, and `ewaMaxAdvancePercent` fields to support Earned Wage Access eligibility. Add `SalaryAdvance` entity for loan and advance repayment schedule tracking. Add `contractorKraPin` field for withholding tax certificate generation. Add three new gRPC RPCs: `GetEmploymentDetails`, `UpdateAttritionRiskScore`, `CreateEmployeeFromCandidate`. |
| Business Impact | Unlocks casual and contractor payroll — a significant underserved market segment. Enables attrition early warning on the HR dashboard. Supports the hire-to-onboard conversion flow from the Recruitment Service without HR re-entering data. |
| Technical Scope | Medium |
| Dependencies | Analytics Service (writes attrition risk score back via gRPC). Payroll Service (reads employment type for calculation logic). Recruitment Service (calls `CreateEmployeeFromCandidate` on offer acceptance). |

---

## 4. Tenant Service

**Service:** `tenant-service` | HTTP 8083 / gRPC 9083 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Tenant plan configuration does not distinguish between feature-gated capabilities — EWA, multi-country compliance, and advanced analytics are not tied to plan tiers. No mechanism to activate country-specific compliance packs per tenant. No EWA float configuration at the tenant level. |
| Proposed Improvement | Add `TenantCountryPack` entity to track which compliance jurisdictions a tenant has activated (Kenya is always active by default). Add `TenantEwaConfig` entity for float limits, transaction fee percentage, maximum advance percentage, and minimum tenure eligibility. Extend the `Plan` entity with `ewaEnabled`, `multiCountryEnabled`, `maxEmployees`, and `analyticsEnabled` feature flags. Add two new gRPC RPCs: `GetActiveCountryPacks` and `GetEwaConfig`. Publish `TenantCountryPackActivatedEvent` to trigger Compliance Service initialisation. |
| Business Impact | Enables plan-based feature gating — a direct revenue lever. Country pack add-ons create upsell revenue from the existing customer base without new customer acquisition. |
| Technical Scope | Low |
| Dependencies | Compliance Service (consumes `TenantCountryPackActivatedEvent` to load country-specific rates). Payroll Service (calls `GetEwaConfig` before any EWA disbursement). |

---

## 5. Payroll Service

**Service:** `payroll-service` | HTTP 8084 / gRPC 9084 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Only handles monthly payroll runs for salaried employees. No support for casual (daily), task-based, or director payroll. No pre-approval anomaly detection — errors or unusual variances are only visible after the run is approved. No dry-run projection state — a business owner cannot see the projected payroll cost before committing. Salary advances and EWA recoveries are not tracked as payslip line items. |
| Proposed Improvement | Extend `PayrollRunType` to include DAILY, TASK_BASED, DIRECTOR, and SUPPLEMENTARY. Add a DRY_RUN state to the `PayrollRunStatus` state machine — a projection run that calculates gross-to-net without generating payslips or triggering disbursement. Add `PayrollAnomaly` entity with seven anomaly types (gross pay spike, zero statutory deduction, contractor WHT missing, etc.) that are detected before approval. Add a FLAGGED status — anomalies must be acknowledged before the run can proceed to PENDING_REVIEW. Add `EwaAdvance` entity to track individual advance requests, disbursements, and recoveries. Add five new REST endpoints covering dry-run projection, anomaly management, EWA requests, casual payroll initiation, and EWA history. Add two new gRPC RPCs: `CheckEwaEligibility` and `GetPayrollProjection`. Publish five new events including `PayrollRunFlaggedEvent`, `EWAAdvanceRequestedEvent`, and `CasualPayrollCompletedEvent`. |
| Business Impact | Casual payroll opens the platform to agriculture, construction, hospitality, and logistics — sectors that employ the majority of Kenya's working population. Anomaly detection catches errors before payslips go out, reducing correction runs and HR overhead. The dry-run projection gives business owners cost visibility before approval, reducing payment delays and disputes. |
| Technical Scope | High |
| Dependencies | Compliance Service (WHT rate lookup for contractors). Employee Service (`GetEmploymentDetails`, `GetEwaStatus`). Tenant Service (`GetEwaConfig`). Integration Hub (receives `EWAAdvanceRequestedEvent` for M-Pesa disbursement). Expense Service (calls `GetPendingExpenseReimbursements` at payroll run time). Leave Service (`GetLeaveDeductionsForPeriod`). Time-Attendance Service (`GetApprovedOvertimeHours`). |

---

## 6. Compliance Service

**Service:** `compliance-service` | HTTP 8085 / gRPC 9085 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Statutory rates are stored as current values with no history. If a Finance Bill changes PAYE brackets and the system is updated, there is no record of what the rates were before the change — retroactive corrections calculate incorrectly. No filing status tracker. No Employment Act compliance checks. No multi-country support. |
| Proposed Improvement | Move from a point-in-time rate store to a versioned rate ledger. Every rate has an `effectiveFrom` and `effectiveTo` date. The Payroll Service passes the pay period date — not today's date — when requesting rates, ensuring historical accuracy. Add `RegulatoryChangeLog` entity with plain-language change descriptions in English and Swahili. Add `ComplianceFilingRecord` entity tracking filing status per period per obligation (PAYE P10, NSSF, SHIF, Housing Levy). Add `EmploymentActViolation` entity. Add multi-country `RateType` entries for Tanzania (PAYE, NSSF, WCF, SDL) and Uganda (PAYE, NSSF, LST). Add admin notifications when new rates are loaded. Publish four new events: `ComplianceRateUpdatedEvent`, `FilingDeadlineApproachingEvent`, `FilingOverdueEvent`, `EmploymentActViolationDetectedEvent`. |
| Business Impact | The platform's primary defensible moat. No competitor in the Kenyan market maintains a versioned statutory history. Correctly handling historical payroll corrections eliminates a class of compliance errors that routinely generate KRA penalties. Proactive deadline notifications stop overdue filings before they happen. |
| Technical Scope | High |
| Dependencies | Tenant Service (`GetActiveCountryPacks`). Integration Hub (performs actual KRA/NSSF/SHIF submissions and calls back to update filing record status). Notification Service (receives compliance events for deadline alerts). |

---

## 7. Time and Attendance Service

**Service:** `time-attendance-service` | HTTP 8086 / gRPC 9086 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Original specification covers biometric integration and basic attendance recording only. Does not cover geofenced mobile clock-in, offline capture with sync, shift scheduling, overtime pre-approval, or timesheet workflows. |
| Proposed Improvement | Add four capability areas. First, geofenced clock-in via the PWA — the system validates the employee's GPS coordinates against a registered `WorkLocation` radius (default 50 metres) before recording the clock event. Second, offline-first attendance capture — clock events recorded without connectivity are stored locally in the PWA and synced via the Integration Hub with the original capture timestamp preserved. Third, shift scheduling — supervisors build and publish weekly shift schedules; employees only see their schedule after it is published. Fourth, overtime pre-approval workflow — overtime must be approved before hours are worked, not after, feeding approved hours directly into the Payroll Service at run time. Add `WorkLocation` entity. Add `OvertimeRequest` and `Timesheet` entities with approval workflows. Publish `ShiftPublishedEvent`, `OvertimeApprovedEvent`, `TimesheetApprovedEvent`, and `LateArrivalPatternEvent`. |
| Business Impact | Removes the KES 15,000–50,000 ZKTeco hardware cost as a barrier to entry for SMEs. Geofenced attendance is sufficient for most SME use cases. Pre-approved overtime eliminates retrospective disputes and ensures the payroll figure is never a surprise. |
| Technical Scope | Medium |
| Dependencies | Employee Service (validates employee on clock-in). Compliance Service (`GetPublicHolidayCalendar` for overtime multipliers). Integration Hub (offline batch sync endpoint, ZKTeco device polling). |

---

## 8. Leave Service

**Service:** `leave-service` | HTTP 8087 / gRPC 9087 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Approvals only work via in-app or email notification — no WhatsApp workflow. Leave balance checks require an active internet connection and a login. Leave encashment is not calculated automatically on exit. No Employment Act compliance validation before leave policy initialisation. |
| Proposed Improvement | Add WhatsApp approval workflow — a `LeaveRequestSubmittedViaPwaEvent` triggers the Notification Service to send a WhatsApp message to the line manager with approve/reject options. The manager's reply is parsed by the Notification Service and routed back via a callback endpoint on this service. Add a lightweight `GetLeaveBalanceSummary` gRPC RPC for the Integration Hub to call during USSD sessions. Add `LeaveEncashment` entity with terminal and annual encashment calculation, feeding automatically into the Payroll Service at run time. Add `LeaveCalendarEvent` entity for public holiday calendars per country. Add Employment Act compliance validation (via Compliance Service gRPC) before leave policy is applied to a new employee. |
| Business Impact | WhatsApp approvals dramatically reduce approval delays for line managers who rarely open a browser. USSD balance checks extend self-service access to employees on feature phones. Automated leave encashment removes a common source of exit payment errors and disputes. |
| Technical Scope | Medium |
| Dependencies | Notification Service (WhatsApp approval workflow routing and callback). Compliance Service (`ValidateEmploymentActCompliance`, `GetPublicHolidayCalendar`). Payroll Service (`GetLeaveDeductionsForPeriod`). Integration Hub (calls `GetLeaveBalanceSummary` during USSD sessions). |

---

## 9. Document Service

**Service:** `document-service` | HTTP 8088 / gRPC 9088 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Original specification covers file storage and basic document management only. Does not cover payslip explanation generation, e-signature for offer letters and contracts, or automated certificate of service generation on offboarding. |
| Proposed Improvement | Add three capability areas beyond core storage. First, `PayslipExplanation` entity — generated from the Payroll Service's calculation audit trail, stored in English and Swahili, and returned as a structured breakdown alongside every payslip PDF. Second, `SignatureRequest` entity — digital signature capture for offer letters and employment contracts, with expiry and decline tracking. Third, automated certificate of service generation triggered by `EmployeeTerminatedEvent`. Extend `DocumentType` enum to include CERTIFICATE_OF_SERVICE, ASSET_ASSIGNMENT_FORM, and EXPENSE_RECEIPT. Add gRPC RPCs: `StorePayslip` (with calculation audit trail parameter), `StoreOfferLetter`, `GenerateCertificateOfService`. Publish `PayslipExplanationReadyEvent`, `DocumentExpiryAlertEvent`, and `SignatureCompletedEvent`. |
| Business Impact | Plain-language payslip explanations reduce the volume of "why is my salary this amount?" queries that consume HR time every month. Swahili support makes the feature accessible across the full workforce. Digital offer letter signing removes a logistics overhead from the hiring process. |
| Technical Scope | Medium |
| Dependencies | Payroll Service (sends calculation audit trail at payslip generation time). Notification Service (delivers WhatsApp payslip link on `PayslipExplanationReadyEvent`). Recruitment Service (calls `StoreOfferLetter` when offer is generated). Employee Service (triggers `GenerateCertificateOfService` on offboarding). |

---

## 10. Notification Service

**Service:** `notification-service` | HTTP 8089 / gRPC 9089 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Original specification covers outbound email and SMS delivery only. Does not cover WhatsApp Business API integration, bi-directional approval workflows, push notifications, multi-language delivery, or the breadth of notification types the expanded platform requires. |
| Proposed Improvement | Build the full service as a multi-channel delivery router. Route each notification to the correct channel based on employee preference and notification type: WhatsApp (Africa's Talking), SMS (Africa's Talking), email (SMTP/SendGrid), and Firebase push. Add `WhatsappApprovalSession` entity to track bi-directional approval conversations — leave approvals, expense approvals, timesheet approvals, and overtime approvals all resolve within the WhatsApp thread. Add a webhook endpoint for inbound WhatsApp replies. Parse manager replies ("1" for approve, "2" for reject) and call the relevant service callback. Add `bodySwahili` field to `NotificationRecord` for all employee-facing messages. Extend `NotificationType` enum to cover all 18 notification categories across the expanded platform. |
| Business Impact | WhatsApp open rates in Kenya exceed 90%. Routing approvals through WhatsApp rather than email removes the single biggest source of process delay in leave and expense management. A manager can approve a leave request in 10 seconds on their phone without logging into anything. |
| Technical Scope | Medium |
| Dependencies | Africa's Talking (WhatsApp Business API and SMS). Firebase (push notifications). Leave Service, Expense Service, Time-Attendance Service (callback endpoints for approval routing). |

---

## 11. Integration Hub Service

**Service:** `integration-hub-service` | HTTP 8090 / gRPC 9090 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Original specification covers M-Pesa and KRA iTax only. Does not cover NSSF portal submission, SHIF portal submission, bank EFT transfers, accounting software exports, Google Workspace and Microsoft 365 directory sync, or USSD session management. |
| Proposed Improvement | Expand to the platform's single external API gateway. Extend `IntegrationType` enum to cover 14 integration types including KRA iTax P10 and P9 submission, NSSF contribution filing, SHIF contribution filing, bank EFT (KCB, Equity, Co-op), QuickBooks/Xero/Sage accounting exports, Google Workspace and Microsoft 365 directory sync, and USSD session state management. Add `AccountingJournalEntry` entity. Add `UssdSession` entity with a state machine covering WELCOME, MENU, LEAVE_BALANCE, CLOCK_IN, and PAYSLIP states. Add USSD callback endpoint (Africa's Talking webhook format). Publish `SalaryDisbursementCompletedEvent`, `SalaryDisbursementFailedEvent`, `FilingSubmittedEvent`, `FilingFailedEvent`, and `AccountingExportCompletedEvent`. |
| Business Impact | Direct KRA iTax submission removes two to three hours of monthly manual work for every payroll officer. Accounting journal exports eliminate the double-entry work between payroll and finance systems. USSD session management extends the platform to feature phone users with no additional hardware. |
| Technical Scope | High |
| Dependencies | Compliance Service (calls back to update `ComplianceFilingRecord` status after KRA/NSSF/SHIF submissions). Auth Service (USSD PIN validation via gRPC). Leave Service (USSD balance query). Time-Attendance Service (USSD clock-in). Africa's Talking, Safaricom Daraja, KCB/Equity/Co-op bank APIs, KRA iTax API, NSSF portal, SHIF portal. |

---

## 12. Analytics Service

**Service:** `analytics-service` | HTTP 8091 / gRPC 9091 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Original specification covers basic reporting and dashboards only. Does not cover payroll cost intelligence with period-over-period deltas, attrition risk scoring, leave pattern analysis, compliance calendar aggregation, or workforce cost forecasting. |
| Proposed Improvement | Build the full service with five analytical capabilities. First, `PayrollCostSnapshot` entity — stored after every approved payroll run, enabling period-over-period cost comparison with delta calculations by category and department. Second, `WorkforceCostForecast` entity — a deterministic three and six month projection using historical snapshots, approved headcount changes, scheduled salary reviews, and confirmed statutory rate changes. Third, `AttritionRiskScore` entity — a nightly batch job scores every active employee 0–100 using eight risk factors (leave patterns, late arrivals, tenure, salary positioning, absence of recent performance review). Scores are written back to the Employee Service via gRPC. Fourth, leave pattern analysis — sick leave clustering, concurrent absence peaks, and weekend-adjacent sick leave patterns surfaced as HR insights. Fifth, compliance calendar aggregation — all filing obligations, statuses, and deadlines compiled into a single year-view report via Compliance Service gRPC. Add the HR Operations dashboard and Executive dashboard endpoints. |
| Business Impact | Real-time payroll cost intelligence gives business owners visibility they currently get only by building manual spreadsheet models. Attrition risk scoring shifts HR from reactive to proactive — a business can act before an employee resigns, not after. The compliance calendar becomes the single source of truth for every audit and board review. |
| Technical Scope | High |
| Dependencies | Payroll Service, Compliance Service, Leave Service, Time-Attendance Service, Performance Service, Recruitment Service (all called via gRPC for aggregation). Employee Service (receives attrition risk score write-back via gRPC). Notification Service (alert when employee risk score exceeds 70). |

---

## 13. Audit Service

**Service:** `audit-service` | HTTP 8092 / gRPC 9092 | Status: Implemented

| Item | Detail |
|---|---|
| Current Limitation | Original specification covers event-sourced audit logging only. Does not include the Data Subject Access Request (DSAR) workflow or a Consent Register for tracking employee data processing consent as required by the Kenya Data Protection Act 2019. |
| Proposed Improvement | Add `DataSubjectAccessRequest` entity — DSAR submissions compile all audit entries for the requested employee, generate a PDF report, and store it in the Document Service. Must be fulfilled within 30 days per KDPA 2019. Add `ConsentRecord` entity tracking eight consent types (payroll data processing, biometric collection, WhatsApp notifications, SMS notifications, third-party data sharing, EWA terms, and marketing). Consent must be grantable and revocable by the employee at any time. Extend the event consumer to cover all 35+ events published across the expanded platform. |
| Business Impact | DSAR compliance is a legal obligation under KDPA 2019 — missing it carries regulatory risk. The Consent Register becomes the platform's compliance record in any data protection audit, which enterprise customers will require before signing contracts. |
| Technical Scope | Medium |
| Dependencies | All services (consumes all published events). Document Service (stores compiled DSAR report). |

---

## Release 01 Summary

| # | Service | Status | Upgrade Category | Technical Scope |
|---|---|---|---|---|
| 1 | API Gateway | Implemented | Route expansion, rate limiting, circuit breakers | Medium |
| 2 | Auth Service | Implemented | USSD session tokens, SUPER_ADMIN provisioning | Low |
| 3 | Employee Service | Implemented | Employment types, EWA fields, attrition score, salary advances | Medium |
| 4 | Tenant Service | Implemented | Country packs, EWA config, plan feature flags | Low |
| 5 | Payroll Service | Implemented | Casual/director/contractor payroll, anomaly detection, dry-run projection, EWA | High |
| 6 | Compliance Service | Implemented | Versioned rate ledger, regulatory changelog, filing tracker, multi-country | High |
| 7 | Time-Attendance Service | Implemented | Geofenced clock-in, offline sync, shift scheduling, overtime workflow | Medium |
| 8 | Leave Service | Implemented | WhatsApp approvals, USSD balance, leave encashment, Employment Act validation | Medium |
| 9 | Document Service | Implemented | Payslip explanations, e-signature, certificate of service | Medium |
| 10 | Notification Service | Implemented | Bi-directional WhatsApp workflows, multi-channel routing, multi-language | Medium |
| 11 | Integration Hub Service | Implemented | KRA/NSSF/SHIF filing, bank EFT, accounting exports, USSD engine, directory sync | High |
| 12 | Analytics Service | Implemented | Cost intelligence, attrition scoring, leave patterns, compliance calendar, forecasting | High |
| 13 | Audit Service | Implemented | DSAR workflow, consent register | Medium |

---

**UAT Gate**

Release 02 begins only after all 13 services above have passed UAT and are
deployed to production. No Release 02 service should be scoped, estimated,
or built before this gate is cleared.

---

*AndikishaHR Internal Product and Engineering Document — Release 01 Planning Use Only*  
*Owner: Product Team*  
*Version: 1.0 | April 2026*
