# Release 02 re-sequencing: Recruitment Service core first

**Status:** Accepted
**Date:** 2026-07-17
**Context:** ADR 0004 (`docs/decisions/0004-demo-feedback-recruitment-lifecycle-careers-page.md`) and demo feedback from an HR manager.

> Naming note: this record is date-prefixed per repo convention. The `0003-` ADR-style name used in
> Run L1 was a one-off deviation, noted there.

## Original plan

The release plan gated **all** Release 02 work behind Release 01 production sign-off, and sequenced
**Expense Service** first within Release 02. ADR 0004 restates the gate explicitly: "Release 02 work
does not start until Release 01 passes UAT. The demo feedback does not override the gate."

## Decision

Pull the **Recruitment Service core** forward now, ahead of Expense Service, as the first Release 02
service (service 18: HTTP 8094 / gRPC 9094 / Postgres host port 5446).

**Grounds:**
1. **Direct customer demand.** An HR manager demo produced an explicit request for Recruitment plus a
   public careers page (ADR 0004). This is validated market pull, not speculative roadmap.
2. **Run L1 built the thing Recruitment converts into.** The lifecycle workflow module
   (`LifecycleWorkflowTemplate` → `LifecycleWorkflowInstance`, shipped and tested in Run L1) is the
   onboarding target of a hire-to-onboard conversion. Recruitment feeds it.
3. **Commercial differentiation depends on the ATS core existing.** The planned careers page + CV
   scoring is sold as a paid add-on (ADR 0004 §2.8). That add-on has no product without the internal
   ATS (requisitions, postings, pipeline) underneath it.

## Scope pulled forward — pipeline core ONLY

**In:** `JobRequisition`, `JobPosting`, `Applicant` (with pipeline stage), `Interview`,
`InterviewFeedback`; tenant-customisable pipeline stages via templates; REST under a new
`/api/v1/recruitment/**` prefix; the `/admin/recruitment` portal section; LINE_MANAGER touchpoints
under `/my/*`.

## Still gated — NOT pulled forward

- **Offers, e-signature, and hire-to-onboard conversion** (`CreateEmployeeFromCandidate`) → **Run R2**,
  gated on the Release 01 item they depend on: **Document Service e-signature**, which does not exist
  yet (verified: only the Certificate-of-Service *signatory letterhead* block exists, not e-signature).
- **Public careers page, candidate self-submission, CV parsing/scoring** → gated on ADR 0004 decisions
  2–6 (LLM vs local extraction, retention ceiling, frontend placement, packaging, re-ordering).
- **Job-board distribution** (BrighterMonday / Fuzu / LinkedIn) → Integration Hub concern; filed, not built.
- **WhatsApp candidate messaging** → Notification Service Release 01 upgrade; out of scope.

## Not displaced by this decision

Re-sequencing Release 02's *internal* order does **not** relax the Release 01 gate for the work that
remains gated (above), and does not displace open Release 01 obligations — notably the Run 04
remediation items and the FE-BACKLOG-015-class discipline. Those remain live Release 01 commitments.
