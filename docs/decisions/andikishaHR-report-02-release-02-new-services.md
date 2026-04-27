# AndikishaHR — Release Plan: Service Upgrades & New Features

**Subtitle:** REPORT 02 — New Services & Features (Release 02)  
**Version:** 1.0  
**Date:** April 2026  
**Audience:** Product, Engineering, and Design Teams  
**Source:** Derived from the AndikishaHR Feature Strategy & Differentiation Roadmap, Service Modifications Report, and Product Planning Document v1.1

---

## Scope Statement

Release 02 introduces four entirely new microservices and five cross-cutting
capabilities across seven service domains. None of the items in this release
should be scoped, estimated, or built until Release 01 has completed UAT and
is deployed to production.

The UAT gate is non-negotiable. Several Release 02 items have hard dependencies
on Release 01 service upgrades — specifically the Employee Service employment
type additions, the Document Service e-signature capability, the Notification
Service WhatsApp workflows, the Analytics Service full build, and the Compliance
Service versioned rate ledger. Building Release 02 features before those
foundations are stable means building on unverified ground.

The cross-release dependency constraints table at the end of this document
maps each Release 02 item to its specific Release 01 prerequisites.

---

## Domain 1: Expense Management

### Expense Service

**Service:** `expense-service` | HTTP 8093 / gRPC 9093 / DB 5445 (`andikisha_expense`)

**Description**

A dedicated service that manages the full expense claim lifecycle — from employee
submission through multi-level approval to reimbursement via the next payroll run
or immediate M-Pesa payment.

**Problem it solves**

Expense claims in most Kenyan SMEs are managed on paper or via WhatsApp messages
with receipt photos attached. There is no approval audit trail. Reimbursements are
manually calculated and often delayed or missed. Finance teams have no visibility
into outstanding liabilities until month-end, making cash flow planning unreliable.

**Target users**

Employees (submit claims and track reimbursement status), Line Managers and HR
Managers (approve claims within their threshold), Finance and Admin teams (configure
categories, limits, and approval tiers), Business Owners (approve high-value claims
and view expense liability reports).

**Why it is strategically important**

Expense management is the second most common HR-adjacent operational pain point
after payroll for Kenyan SMEs. Adding it to the platform increases daily active
usage among employees and managers, strengthens the subscription renewal case at
financial year-end, and creates a natural data feed into the accounting export
integration. Once expense data lives in the platform, finance teams need it to stay
there — which directly reduces churn.

**Business impact**

Increases platform stickiness. Finance teams that use the accounting export feature
need expense data to flow from this service — creating a dependency that discourages
switching. Per-transaction revenue potential from immediate M-Pesa reimbursements
where a small fee applies per advance.

**Core entities**

`ExpenseClaim`, `ExpenseItem`, `ExpenseCategory`, `ExpenseApprovalLevel`

**Key capabilities**

Mobile receipt photo capture via the PWA, configurable approval levels by claim
amount threshold, next-payroll or immediate M-Pesa reimbursement per claim,
taxable benefit-in-kind tracking per expense category, daily spend limits per
category, WhatsApp-based approval routing through the Notification Service.

**Suggested module**

Standalone `expense-service`. Cannot be absorbed into the Payroll Service — it
owns a distinct approval workflow domain with its own state machine. The Payroll
Service calls this service at run time via gRPC to retrieve pending reimbursements
for inclusion as a separate payslip line item.

**Technical complexity:** Medium

**Dependencies**

Document Service (receipt file storage), Payroll Service (gRPC
`GetPendingExpenseReimbursements` at payroll run time), Integration Hub (M-Pesa
immediate reimbursement trigger), Notification Service (WhatsApp approval routing
and delivery).

---

## Domain 2: Talent Acquisition

### Recruitment Service

**Service:** `recruitment-service` | HTTP 8094 / gRPC 9094 / DB 5446 (`andikisha_recruitment`)

**Description**

An applicant tracking system embedded within the HR platform. Covers the full
hiring workflow from job requisition through posting, candidate pipeline management,
interview scheduling, offer generation, and digital acceptance. A hired candidate
converts directly into an employee record with no data re-entry by HR.

**Problem it solves**

Most Kenyan SMEs manage hiring via email threads, WhatsApp groups, and spreadsheets.
There is no structured pipeline, no consistent interview scoring, no offer audit
trail, and no automated conversion to employee record when a candidate joins. HR
teams spend significant time manually transcribing application data into the payroll
system each time a new employee starts.

**Target users**

HR Managers and HR Officers (manage the full pipeline and configure workflows),
Line Managers (raise requisitions, conduct interviews, and submit scored feedback),
Business Owners (approve headcount requisitions and salary offers), Candidates
(submit applications, receive communication, and sign offer letters digitally).

**Why it is strategically important**

Completing the hire-to-retire loop is the defining difference between a payroll
tool and an HR platform. Without recruitment, the platform's first interaction with
an employee's data is after they have already joined. With recruitment, the platform
owns the relationship from the first job application. This is a category-positioning
move — it places AndikishaHR alongside SeamlessHR and Workday in enterprise
procurement conversations rather than alongside basic payroll calculators.

**Business impact**

Justifies a higher per-employee subscription price at the Professional and Enterprise
tiers. Creates a referral tracking feature that business owners value as a retention
tool. WhatsApp-based candidate communication differentiates the platform in a market
where most candidate outreach already happens on WhatsApp.

**Core entities**

`JobRequisition`, `JobPosting`, `Applicant`, `Interview`, `InterviewFeedback`, `Offer`

**Key capabilities**

Multi-stage applicant pipeline board with drag-and-drop stage progression, interview
scheduling with Google Calendar integration, scored interview feedback per interviewer,
digital offer letter generation with e-signature via the Document Service, automatic
employee record creation from accepted offer data via Employee Service gRPC, recruitment
analytics (time-to-hire, offer acceptance rate, source-of-hire breakdown), WhatsApp
candidate communication templates.

**Suggested module**

Standalone `recruitment-service`. The domain is distinct from employee lifecycle
management — an applicant is not an employee until the offer is accepted and
signed. Keeping these bounded contexts separate prevents the employee record from
being polluted with candidate-stage data.

**Technical complexity:** Medium

**Dependencies**

Employee Service (gRPC `CreateEmployeeFromCandidate` called on offer acceptance to
create the employee record pre-populated from application data), Document Service
(offer letter storage and signature request generation), Notification Service
(candidate communication and hiring manager approval alerts), Analytics Service
(recruitment funnel data for dashboard aggregation).

---

## Domain 3: Performance & Development

### Performance Service

**Service:** `performance-service` | HTTP 8095 / gRPC 9095 / DB 5447 (`andikisha_performance`)

**Description**

Manages the performance management cycle from goal setting through continuous
feedback collection to final appraisal scoring. Salary review recommendations link
directly to the Payroll Service for implementation after approval.

**Problem it solves**

Performance management in most Kenyan SMEs is either absent or runs on annual PDF
forms completed inconsistently and filed without follow-up. There is no structured
link between appraisal outcomes and salary decisions, and no audit trail for
employment decisions made on performance grounds. When an employment dispute arises,
the business has no documented performance history to reference.

**Target users**

Employees (set goals, submit self-reviews, acknowledge manager reviews), Line Managers
(confirm goals, submit manager reviews, make salary increase recommendations),
HR Managers (configure appraisal cycles, view score distributions, oversee the
process), Business Owners and Finance Directors (approve salary review recommendations
before implementation).

**Why it is strategically important**

Performance management data feeds directly into the attrition risk scoring model in
the Analytics Service — an employee with no performance review in over 12 months is
flagged as an attrition risk factor. It also links salary review decisions to
documented performance outcomes, which aligns with the Kenya Employment Act 2007
requirements for fair and transparent compensation management. Employers who use
performance management have structured people data they cannot easily migrate
elsewhere — creating durable retention.

**Business impact**

Unlocks a Professional or Enterprise tier upsell. Employers who run formal appraisal
cycles are significantly more invested in the platform. The salary review workflow
creates a direct connection between HR and Finance that no standalone payroll tool
can replicate.

**Core entities**

`PerformanceCycle`, `PerformanceGoal`, `AppraisalReview`, `SalaryReviewRecommendation`

**Key capabilities**

KPI and OKR goal-setting frameworks, self-review and manager review submission
workflows, 360-degree peer review configuration, cycle cadence options (annual,
bi-annual, quarterly), performance score distribution analytics per department,
salary increase recommendations with multi-level approval, direct Employee Service
salary structure update on final approval.

**Suggested module**

Standalone `performance-service`. The appraisal domain is distinct from both employee
records and payroll — it owns the review state machine and salary recommendation
workflow independently. The Payroll Service receives approved salary changes as events;
it does not reach into the performance database.

**Technical complexity:** Medium

**Dependencies**

Employee Service (reads employee and department data for review assignments; receives
`SalaryReviewApprovedEvent` to update salary structure), Notification Service (cycle
deadline reminders, review submission alerts to managers and employees), Analytics
Service (performance distribution data for attrition model input).

---

## Domain 4: Asset & Resource Management

### Asset Service

**Service:** `asset-service` | HTTP 8096 / gRPC 9096 / DB 5448 (`andikisha_asset`)

**Description**

Tracks company-owned assets assigned to employees from purchase through assignment,
maintenance scheduling, and eventual return or disposal. Integrates with the
employee offboarding workflow to surface all outstanding asset returns automatically
before an exit is processed.

**Problem it solves**

Many Kenyan SMEs lose track of company equipment during staff turnover. A laptop or
vehicle assigned to an exiting employee is often not flagged for return because no
one cross-checks the asset register at offboarding time. The cumulative cost of
unreturned or undocumented assets across a 50-person company over three years
represents a real but largely invisible financial liability.

**Target users**

HR Managers and Admins (manage the asset register, record assignments and returns),
Employees (view their currently assigned assets), Finance teams (asset valuation,
depreciation reporting, and maintenance cost tracking), Business Owners (high-level
asset utilisation overview).

**Why it is strategically important**

Asset management completes the full offboarding workflow. The platform cannot generate
a complete and legally defensible exit checklist without knowing which company
assets need to be returned. It also creates a link to the accounting export
integration — asset depreciation schedules become part of the monthly finance journal
exported to QuickBooks or Xero.

**Business impact**

Relatively low standalone revenue impact but high retention contribution — it gives
finance and operations teams a reason to interact with the platform daily, expanding
the platform's internal footprint within each customer organisation beyond the HR
and payroll teams. More stakeholders using the platform means a broader internal
coalition defending the subscription at renewal time.

**Core entities**

`Asset`, `AssetCategory`, `AssetAssignment`, `AssetMaintenanceRecord`

**Key capabilities**

Asset register with depreciation years per category, condition tracking recorded
at both assignment and return, maintenance schedule management with overdue alerts,
automated offboarding integration (outstanding assets surfaced when
`EmployeeTerminatedEvent` is received — HR must confirm return manually, the system
does not auto-return), assignment and return document generation via the Document
Service, warranty expiry notifications.

**Suggested module**

Standalone `asset-service`. Asset assignment is an independent domain with its
own lifecycle state machine — it should not be folded into the Employee Service.
The assignment history, condition tracking, and maintenance management are distinct
from employee data management and would create inappropriate coupling if combined.

**Technical complexity:** Low

**Dependencies**

Employee Service (gRPC `GetActiveAssignmentsByEmployee` called during offboarding
workflow), Document Service (generates asset assignment and return confirmation
forms), Notification Service (maintenance schedule alerts, warranty expiry reminders,
return reminders for exiting employees), Audit Service (receives `AssetAssignedEvent`
and `AssetReturnedEvent` for the immutable audit trail).

---

## Domain 5: AI & Workforce Intelligence

### Attrition Early Warning

**Hosted in:** Analytics Service (scheduled nightly batch job — no new service required)

**Description**

A nightly batch job scores every active employee on a 0–100 attrition risk scale
using eight measurable factors drawn from leave, attendance, payroll, and performance
data already held within the platform. Scores above 70 trigger an alert to the HR
Manager. All scores are visible on the HR dashboard with contributing factor
breakdowns.

**Problem it solves**

Replacing an employee costs between 50% and 200% of their annual salary when
recruitment, onboarding, and productivity gap costs are included. Most businesses
only discover that an employee is about to leave when they hand in their notice.
By that point, the decision is already made. Early warning allows targeted retention
conversations while there is still time to act.

**Target users**

HR Managers and Business Owners (view risk scores and contributing factors on the
HR dashboard). Individual scores are not visible to line managers to avoid bias in
day-to-day management decisions.

**Why it is strategically important**

This feature is only possible because the platform holds payroll, leave, attendance,
and performance data in one place. A standalone analytics tool would not have access
to all eight risk factors. The model's accuracy compounds over time — after 12 months
of platform usage, the attrition scores become significantly more accurate for each
customer's specific business context. That is a data advantage no competitor can
replicate retroactively.

**Business impact**

Repositions AndikishaHR from a payroll tool to a strategic workforce platform.
Justifies a higher price point in enterprise procurement conversations and creates
a compelling ROI narrative. If the platform prevents one senior hire replacement
per year at an average cost of KES 500,000 to KES 1,500,000, the annual subscription
pays for itself many times over.

**Risk factors scored (eight)**

High sick leave frequency, low tenure (under 6 months), salary in the bottom 20%
for their department and role, no performance review in over 12 months, consistent
decline of approved overtime offers, pattern of sick leave adjacent to weekends,
recent manager change within the last 3 months, three or more late arrivals in the
current month.

**Technical complexity:** High — requires 6 to 12 months of platform data before
the model produces reliable scores. Initial scores in the first quarter of operation
should be presented as indicative rather than definitive.

---

### Workforce Cost Forecasting

**Hosted in:** Analytics Service (scheduled monthly batch job — no new service required)

**Description**

A deterministic projection model that forecasts total payroll costs three and six
months ahead. It uses historical payroll snapshots, approved headcount changes,
scheduled salary reviews from the Performance Service, and confirmed statutory rate
changes from the Compliance Service.

**Problem it solves**

Finance directors currently build payroll cost forecasts manually in Excel every
quarter. The process takes several hours, requires inputs from HR, payroll, and
operations teams, and the output is typically outdated within weeks of completion.
There is no automated link between HR decisions (new hires, salary reviews,
redundancies) and the financial forecast.

**Target users**

Business Owners, Finance Directors, HR Managers (viewing the forecast in the
analytics dashboard and exporting it for board presentations).

**Why it is strategically important**

Workforce cost is typically the largest single line item on a Kenyan SME's income
statement, often representing 40% to 60% of total operating costs. Giving finance
teams an automated, always-current forecast creates a direct connection between
the HR platform and the board's financial planning process — something no local HR
platform currently provides.

**Business impact**

Expands the platform's value perception beyond HR and payroll compliance into
financial planning and board-level reporting. Business owners who use the forecast
feature describe the platform as a business intelligence tool rather than a
compliance overhead — making the subscription renewal decision significantly easier
to justify.

**Technical complexity:** Medium — this is a deterministic model using structured
data already in the platform. It does not require machine learning infrastructure.
Uncertainty ranges are calculated from historical variance in payroll run deltas.

---

## Domain 6: Multi-Country Compliance Expansion

### Tanzania and Uganda Compliance Packs

**Hosted in:** Compliance Service (country-pack architecture) and Tenant Service
(country pack activation per tenant)

**Description**

Country-specific statutory rate tables, public holiday calendars, filing deadlines,
and remittance report formats for Tanzania (PAYE, NSSF, WCF, SDL) and Uganda
(PAYE, NSSF, LST). Each pack activates per tenant via the Tenant Service and loads
the correct rate history into the Compliance Service versioned ledger.

**Problem it solves**

A Kenyan business that opens operations in Tanzania or Uganda currently runs a
separate payroll system for each country, or outsources to a local payroll bureau
at significant cost. There is no SaaS platform in the East African market that
handles multi-country payroll with the same statutory depth that AndikishaHR
delivers for Kenya.

**Target users**

HR Managers and Payroll Officers at businesses operating across multiple East African
markets. Finance Directors who need consolidated payroll cost reporting across
all jurisdictions in a single dashboard.

**Why it is strategically important**

Multi-country payroll is the clearest geographic expansion path for the platform.
It also creates a direct upsell mechanism — country packs are sold as add-ons to
the Professional or Enterprise plan, generating additional revenue from the existing
customer base without requiring new customer acquisition.

**Business impact**

Tanzania and Uganda together add a formal employment base comparable in size to
Kenya's. Businesses expanding into these markets will not want to re-evaluate their
HR platform — they will prefer to activate a new country pack on the tool they
already use and trust. Each new country pack activation is recurring add-on revenue
per tenant per month.

**Technical complexity:** Medium per country — the Compliance Service versioned
rate ledger already supports the country-pack architecture. The effort per country
is the compliance research, government portal integration testing, and statutory
rate verification. This work requires a compliance specialist for each jurisdiction,
not just an engineering sprint.

---

## Domain 7: Accounting & Finance Integrations

### QuickBooks, Xero, and Sage Payroll Journal Exports

**Hosted in:** Integration Hub Service

**Description**

After each approved payroll run, the Integration Hub generates a payroll journal
entry in the format required by the connected accounting software and pushes it
automatically. The finance team receives a reconcilable journal with the correct
account codes, eliminating the monthly manual re-entry of payroll totals.

**Problem it solves**

Every Kenyan business using accounting software also uses a payroll system. These
two systems almost never communicate. The finance team manually transcribes payroll
totals, statutory contribution amounts, and net pay figures into the accounting
system every month. This process takes two to three hours, is error-prone, and is
impossible to audit systematically. Any discrepancy between payroll and accounting
requires manual investigation.

**Target users**

Finance Managers and Bookkeepers (primary beneficiaries of the automated journal),
Business Owners managing their own accounts, External accountants and auditors who
review the books monthly.

**Why it is strategically important**

QuickBooks, Xero, and Sage collectively cover a significant majority of formal
Kenyan SME accounting. An active integration with any of these three creates a
hard dependency — once the accounting journal flows automatically from AndikishaHR,
switching payroll platforms requires rebuilding the integration from scratch. This
is one of the most durable forms of customer retention in SaaS.

**Business impact**

Increases platform stickiness with the finance function — a stakeholder group that
does not typically interact with the HR platform but whose support is important at
subscription renewal. Creates a referral channel through accounting firms and
bookkeepers who tend to recommend platforms that integrate with the tools they use.

**Technical complexity:** Medium — each accounting platform has its own API and
journal format. The integration work is straightforward but requires testing against
live sandbox environments for each provider.

---

## Release 02 Summary

| # | New Service / Feature | Domain | Status | Technical Scope | Revenue Potential |
|---|---|---|---|---|---|
| 1 | Expense Service | Expense Management | New — not yet built | Medium | Subscription tier + M-Pesa transaction fees |
| 2 | Recruitment Service | Talent Acquisition | New — not yet built | Medium | Premium tier upsell |
| 3 | Performance Service | Performance & Development | New — not yet built | Medium | Premium tier upsell |
| 4 | Asset Service | Asset Management | New — not yet built | Low | Retention / tier stickiness |
| 5 | Attrition Early Warning | AI & Workforce Intelligence | Hosted in Analytics Service | High | Enterprise tier positioning |
| 6 | Workforce Cost Forecasting | AI & Workforce Intelligence | Hosted in Analytics Service | Medium | Enterprise tier positioning |
| 7 | Tanzania Compliance Pack | Multi-Country Expansion | Hosted in Compliance Service | Medium | Country pack add-on revenue |
| 8 | Uganda Compliance Pack | Multi-Country Expansion | Hosted in Compliance Service | Medium | Country pack add-on revenue |
| 9 | QuickBooks / Xero / Sage Exports | Accounting Integrations | Hosted in Integration Hub | Medium | Retention + referral channel |

---

## Cross-Release Dependency Constraints

The table below maps each Release 02 item to the specific Release 01 services that
must be fully implemented and UAT-cleared before that item can begin. These are
hard engineering dependencies — not sequencing preferences.

| Release 02 Item | Must Wait For (Release 01) |
|---|---|
| Expense Service | Payroll Service EWA and anomaly upgrades complete. Document Service e-signature and receipt storage implemented. Integration Hub M-Pesa expansion live. Notification Service WhatsApp routing operational. |
| Recruitment Service | Employee Service employment type additions and `CreateEmployeeFromCandidate` gRPC RPC implemented. Document Service e-signature fully operational. Notification Service WhatsApp routing operational. |
| Performance Service | Employee Service `attritionRiskScore` field and `UpdateAttritionRiskScore` gRPC RPC implemented. Analytics Service `AttritionRiskScore` entity and nightly batch job operational. |
| Asset Service | Document Service fully implemented (asset assignment form generation). Employee Service offboarding workflow additions complete. |
| Attrition Early Warning | Analytics Service full build complete — specifically `PayrollCostSnapshot`, leave pattern data, attendance pattern data, and the `AttritionRiskScore` entity with the nightly batch job. Employee Service `attritionRiskScore` write-back field implemented. A minimum of 3 months of production payroll and attendance data is needed before scores are meaningful. |
| Workforce Cost Forecasting | Analytics Service `PayrollCostSnapshot` entity operational and populated with at least 3 payroll run cycles. Compliance Service versioned rate ledger live and returning historical rates correctly. Performance Service salary recommendations available as a data input. |
| Tanzania and Uganda Country Packs | Compliance Service versioned rate ledger fully implemented and verified in production. Tenant Service country pack activation (`TenantCountryPack` entity and `GetActiveCountryPacks` gRPC RPC) live. |
| Accounting Integrations | Integration Hub full build complete including `AccountingJournalEntry` entity. Payroll Service `PayrollCostSnapshot` data available as a journal source. |

---

*AndikishaHR Internal Product and Engineering Document — Release 02 Planning Use Only*  
*Owner: Product Team*  
*Version: 1.0 | April 2026*  
*Activation condition: Release 01 UAT sign-off required before any Release 02 work begins*
