# ADR 0004: Demo Feedback — Recruitment, Lifecycle Workflows, and Public Careers Page

**Status:** Draft for discussion
**Date:** 2026-07-15
**Context:** Feedback from an HR manager demo of AndikishaHR. Two requests: (1) introduce Recruitment, Onboarding, and Off-boarding services, (2) introduce a public recruitment page where candidates submit their data and CV, and the system rates them against job requirements. The careers page would be sold as an extra feature.

---

## Part 1: Service Placement Decisions

### 1.1 Recruitment Service — already planned, no change

The Release 02 plan already defines `recruitment-service` (HTTP 8094 / gRPC 9094 / DB 5446) with entities `JobRequisition`, `JobPosting`, `Applicant`, `Interview`, `InterviewFeedback`, `Offer`, and the hire-to-onboard conversion via the Employee Service gRPC `CreateEmployeeFromCandidate`. The demo feedback validates this plan.

**Decision:** No change to the existing spec. The careers page (Part 2) extends it.

**Constraint that still holds:** Release 02 work does not start until Release 01 passes UAT. The demo feedback does not override the gate. If the careers page becomes a sales lever, the correct move is to re-sequence Release 02 priorities, not to break the gate.

### 1.2 Onboarding and Off-boarding — workflows in Employee Service, not standalone services

**Recommendation: do not create standalone services.**

Reasons:

1. **No independent data ownership.** Onboarding and offboarding operate on the employee record, documents, assets, access, and final pay. Every entity they touch is owned by another service. A standalone service would own only checklist state.
2. **The architecture already assumes Employee Service placement.** The Release 02 dependency table states the Asset Service must wait for the Employee Service offboarding flow. The product planning document defines both workflows inside Module 1 (Employee Management).
3. **Distributed transaction cost.** Splitting the lifecycle across three services turns "activate employee" into a cross-service saga with no compensating benefit at current scale (17 services already).
4. **The real request is product visibility.** The HR manager wants to see Onboarding and Offboarding as named capabilities. That is a UI and menu decision, not a service boundary decision.

**What to build instead (inside Employee Service):**

- `LifecycleWorkflowTemplate` — tenant-configurable checklist template per workflow type (ONBOARDING, OFFBOARDING) and per employment type
- `LifecycleWorkflowInstance` — an active workflow attached to one employee, with status, started/completed timestamps
- `LifecycleTask` — individual checklist item with assignee role, due date, completion evidence (document reference, confirmation flag)
- Domain events: `OnboardingStartedEvent`, `OnboardingCompletedEvent`, `OffboardingStartedEvent`, `EmployeeTerminatedEvent` (Asset Service already expects the last one)
- Tenant-portal UI: dedicated "Onboarding" and "Offboarding" sections under the People area, presented as distinct modules

**Extraction trigger (documented, not speculative):** if workflow orchestration later needs cross-domain coordination beyond events (for example, blocking payroll finalisation on incomplete offboarding across multiple services), revisit extraction with real usage data. Until then, this stays in Employee Service.

---

## Part 2: Public Careers Page with CV Analysis

### 2.1 What it is

A public, tenant-branded careers page where candidates view open positions, submit an application with a CV, and the system parses and scores the CV against the structured requirements of the job posting. HR sees a ranked, explainable pipeline inside the tenant portal. Sold as a plan add-on.

This is new scope. The current Recruitment Service spec covers the internal ATS but not a public candidate surface or automated CV analysis.

### 2.2 Non-negotiable constraints (decide before design)

**Advisory scoring only.** The Data Protection Act 2019 restricts significant decisions based solely on automated processing. The score ranks and explains. It never auto-rejects. The UI must make this explicit to HR users, and no workflow may branch on score alone.

**Candidate data is personal data.** Obligations before build:
- Explicit consent checkbox at submission, with a plain-language privacy notice
- Stated retention period (proposed default: 12 months post-application, tenant-configurable within a legal ceiling)
- Automated purge job when retention expires
- Extend the Audit Service consent register and DSAR workflow to cover candidates, not only employees
- Candidate data lives in the tenant schema like all other tenant data, Kenya-resident hosting unchanged

**Public write surface threat model.** This is the platform's first unauthenticated write endpoint accepting file uploads. Required from day one:
- File type allowlist (PDF, DOCX) and hard size limit (proposed: 5 MB)
- Malware scanning before any parsing (for example ClamAV in the ingestion path)
- Per-IP and per-tenant rate limiting at the gateway
- Bot protection on the submission form (honeypot field minimum, CAPTCHA if abuse observed)
- Uploaded files quarantined in object storage, never executed or rendered server-side before scanning

### 2.3 Structured requirements on the job posting

Scoring is only as good as the target. Extend `JobPosting` with a structured requirements block:

| Field | Type | Scoring role |
|---|---|---|
| `requiredSkills` | list | Hard match component |
| `preferredSkills` | list | Soft match component |
| `minYearsExperience` | integer | Threshold + proximity |
| `educationLevel` | enum | Threshold |
| `certifications` | list | Bonus component |
| `location` / `workMode` | enum | Filter or flag, not score |
| `languageRequirements` | list | Threshold |

HR defines these when creating the posting. Free-text job descriptions remain, but scoring reads only the structured block. This keeps the scoring explainable and auditable.

### 2.4 CV analysis pipeline (async, event-driven)

```
Candidate submits form + CV
        |
        v
Public API (gateway route, rate-limited, no auth)
        |
        v
Recruitment Service: create Applicant + Application (status: RECEIVED)
Store file in object storage (quarantine bucket)
Publish ApplicationReceivedEvent
        |
        v  (RabbitMQ consumer, same service)
1. Malware scan  -> fail: flag application, alert, stop
2. Text extraction (PDF/DOCX)
3. Structured parsing -> skills, roles, durations, education, certifications
4. Scoring against JobPosting requirements
5. Persist ScoreBreakdown, status -> SCORED
Publish ApplicationScoredEvent
        |
        v
Notification Service: confirmation to candidate (email/WhatsApp)
Tenant portal: ranked pipeline updates
```

**Parsing approach options:**

| Option | Pros | Cons |
|---|---|---|
| A. Library-based extraction + rules (Apache Tika + keyword/section heuristics) | Cheap, deterministic, no external data flow | Brittle on varied CV formats, weak on Kenyan CV conventions |
| B. LLM-based structured extraction (extraction only, schema-constrained output) | Handles format variety well, faster to ship | Per-application cost, needs a data processing agreement with the provider, prompt injection surface from CV content |
| C. Hybrid: Tika for text, LLM for structuring, rules for scoring | Best accuracy-to-explainability ratio | Two components to maintain |

**Recommendation: Option C.** The LLM extracts structure. Deterministic rules compute the score. This keeps the score reproducible and explainable, which matters for the DPA position and for HR trust. Treat CV text as untrusted input to the LLM (extraction-only prompt, schema-validated output, no tool access).

**Open question for you:** which LLM provider, and does candidate CV content leaving the country conflict with your data residency positioning? If it does, scoring rules over locally extracted text (Option A upgraded with better heuristics) becomes the fallback. This needs a decision the same way the Arusifiti escrow custody model did — before design, not during.

### 2.5 Score presentation

Never a bare number. HR sees a breakdown:

- Required skills: matched X of Y, listing which
- Preferred skills: matched X of Y
- Experience: candidate years vs required, met / not met
- Education: met / not met
- Certifications: matched list
- Overall: weighted composite, weights visible per posting

Every component links back to the CV excerpt that produced it. If parsing confidence is low (garbled extraction, image-only PDF), the application is flagged "needs manual review" rather than scored low.

### 2.6 Frontend placement

Options for where the public careers page lives:

| Option | Description | Trade-offs |
|---|---|---|
| A. Routes in `frontend/landing` | `/careers/{tenant-slug}` on the existing landing app (port 3002) | Fastest. Mixes marketing and product surfaces. Tenant branding constrained by landing design system |
| B. New app `frontend/careers` | Fourth Next.js app in the pnpm workspace | Clean separation, own caching/SEO strategy, tenant theming freedom. One more app to deploy on Dokploy |
| C. Subdomain per tenant | `careers.{tenant}.andikisha...` or tenant custom domain | Strongest white-label story for the add-on price. DNS + cert automation work on the VPS |

**Recommendation: start with B, design URLs so C can layer on later.** A dedicated app keeps the unauthenticated surface isolated from the tenant portal's BFF and session machinery, which matters given the FE-BACKLOG-015 class of proxy allowlist issues you have already hit. Tenant resolution happens by slug in the path, resolved server-side against Tenant Service, no auth context anywhere in the app.

Tenant branding scope for v1: logo, primary colour, company description. Nothing more until a customer asks.

### 2.7 Candidate experience decisions

- **No candidate accounts in v1.** Apply with email + phone, receive a magic status link. Accounts add auth scope and KDPA surface for marginal v1 value.
- **Application status:** candidate can check status via the magic link (Received, Under Review, Interview, Offer, Closed). No score visibility to candidates, ever.
- **WhatsApp confirmation** on submission fits the existing Notification Service Release 01 upgrade (bi-directional WhatsApp) and matches the local market.
- **Duplicate handling:** same email + same posting within retention window updates the existing application rather than creating a new one.

### 2.8 Commercial model

The mechanism already exists: Tenant Service plan feature flags (Release 01 upgrade). The careers page becomes a flagged capability.

Proposed structure for discussion:

- Recruitment Service (internal ATS): Professional tier and above
- Public careers page + CV analysis: add-on on top of Recruitment, or bundled into Enterprise
- Metering consideration: CV parsing has a per-application cost if an LLM is involved. Either cap applications per month per tier or price the add-on to absorb realistic volume. Decide after the parsing approach is fixed.

### 2.9 Dependencies and sequencing

The careers page depends on the Recruitment Service core (postings, applicants, pipeline), which depends on the Release 01 gate items already documented (Employee Service employment types, Document Service e-signature, Notification Service WhatsApp).

Proposed sequencing within Release 02:

1. Recruitment Service core (existing spec, unchanged)
2. Structured requirements block on JobPosting
3. Public careers app + submission endpoint + security hardening
4. CV parsing and scoring pipeline
5. Candidate DSAR/consent extension in Audit Service (parallel with 3–4)

Steps 3 and 4 are separable. A careers page that collects applications into the pipeline without scoring is already sellable. Scoring can follow as a fast-follow, which also gives you real CV samples to validate parsing accuracy against before the scoring goes live.

---

## Decisions Required From You

1. Confirm onboarding/offboarding stay in Employee Service as workflow modules (Part 1.2)
2. LLM involvement in CV parsing vs local-only extraction, given data residency positioning (Part 2.4)
3. Retention period default and ceiling for candidate data (Part 2.2)
4. Frontend placement: dedicated careers app vs landing routes (Part 2.6)
5. Commercial packaging: add-on vs Enterprise bundle (Part 2.8)
6. Whether the careers page justifies re-ordering Release 02 priorities (currently Expense Service sits first in the summary table)

---

*Draft for review. Adapt into `docs/decisions/` once decisions 1–6 are made.*
