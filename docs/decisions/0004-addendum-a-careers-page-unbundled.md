# ADR 0004 Addendum A: Careers Page Unbundled from CV Scoring

**Status:** Accepted
**Date:** 2026-07-18
**Amends:** `docs/decisions/0004-demo-feedback-recruitment-lifecycle-careers-page.md`
**Context:** Run R1 (Recruitment Service core) shipped and verified. Lawrence
tested the service and independently identified the public intake surface via
a live market example (Workable hosted job page,
`apply.workable.com/{company-slug}/j/{job-id}`), validating the careers page
designed in ADR 0004 Part 2. This addendum records the resulting decisions.

---

## Decision A1: The careers page is unbundled from CV scoring

ADR 0004 treated the public careers page and CV analysis as one feature
gated together. They are separable products, and the page alone carries most
of the perceived value (market evidence: Workable's public page performs no
visible scoring and is a paid product).

Consequences:
- The careers page is gated only on ADR 0004 decisions 3–5, now resolved
  below.
- Decision 2 (LLM use and candidate data residency) gates ONLY the scoring
  feature, which remains parked.
- The KDPA obligations (consent at submission, retention, purge, candidate
  DSAR extension) and the public-write-surface threat model (malware scan,
  file limits, rate limiting, bot protection) apply in full to the page
  regardless of scoring. They are page-scope, not scoring-scope.

## Decision A2 (resolves ADR 0004 Decision 4): Placement and URL model

- Shared hosted surface, tenant identified by slug, per the Workable
  pattern: `<public host>/{tenant-slug}` for the tenant's job list and
  `<public host>/{tenant-slug}/j/{publicId}` for one posting.
- `publicId` is a short random identifier generated per posting: stable
  through title edits, unguessable, enumeration-resistant.
- Frontend: dedicated public app (ADR 0004 option B), isolated from the
  tenant-portal's BFF and session machinery. No auth context anywhere in it.
- Custom domains per tenant (option C, Workable's `hasCustomDomain`
  equivalent) are a later white-label upsell, not launch scope.
- Publish semantics: the existing JobPosting publish action now has its
  real meaning — PUBLISHED renders at the public URL, DRAFT does not.
- Tenant branding scope unchanged from ADR 0004: logo, primary colour,
  company description. Nothing more until a customer asks.

## Decision A3: Channel strategy and what it changes

Confirmed channel order for Kenyan SME job distribution: LinkedIn first,
then the public URL directly, then WhatsApp.

- This orders integrations, NOT responsive design. LinkedIn traffic opens
  on phones, so the public page and application form are mobile-first from
  day one.
- Social share metadata (OG tags: logo, job title, company, theme colour)
  ships free with the page for all channels. Share cards are distribution
  and carry a "Powered by AndikishaHR" footer — the growth loop. Never
  paywalled.
- WhatsApp MESSAGING (application confirmations, status updates, interview
  reminders via the Business API) is the sellable add-on
  (RECRUITMENT-BACKLOG-005): real per-conversation Meta costs, real value,
  cleanly meterable. Packaging: careers page as the base paid feature,
  WhatsApp messaging as an add-on on top.

## Decision A4: CV-optional structured application form

Candidates may apply without a CV file. The application form captures
structured data mirroring CV content:

- Required core, deliberately minimal: full name, phone (primary
  identifier), current or most recent role. Email optional.
- Progressive optional sections: work history (repeating employer / role /
  dates entries), education, skills, certifications, CV file attachment.
- National ID optionally collected at application, stored nullable
  (consistent with R1 Decision 1: statutory IDs nullable on Applicant;
  KRA/SHIF/NSSF are onboarding's job, never the application form's).

Strategic effect: structured form data is pre-parsed. Future scoring can
operate on form applicants with no CV parsing and no LLM, shrinking ADR
0004 Decision 2's scope to CV-upload applicants only. The form is both
market inclusion (roles where candidates have no CV: drivers, shop staff,
casual workers) and a reduction of the platform's future dependence on the
data-residency decision.

## Decision A5 (resolves ADR 0004 Decision 3): Retention

Candidate data retention defaults to 12 months from application,
tenant-configurable beneath a ceiling, with automated purge on expiry.
Consent captured at submission with a plain-language notice. Candidate DSAR
and consent-register coverage extends the existing Audit Service work.

## Decision A6: Applicant source tracking

Applicant gains a `source` field at the next schema touch: PUBLIC_PAGE,
LINKEDIN, WHATSAPP, REFERRAL, HR_MANUAL. Costs one column now; answers
"which channel finds us good people" later. R1's manually entered
applicants backfill as HR_MANUAL.

## Sequencing (unchanged obligations, revised order after them)

1. FE-BACKLOG-015 (Critical, one-line) and Run 04 — the recorded Release 01
   debt from the R1 pull-forward. First, no exceptions.
2. Careers page run (public app + application intake + KDPA + threat
   model). Jumps ahead of R2: it depends only on R1, while R2 depends on
   Document Service e-signature, which does not exist.
3. R2 (offers, e-signature, hire-to-onboard conversion) once its
   dependency lands.
4. CV scoring: parked behind ADR 0004 Decision 2, scope now reduced to
   CV-upload applicants by Decision A4.

## Superseded

- ADR 0004's coupling of page and scoring into one gated feature.
- "Mobile form designed last" phrasing from the channel discussion: only
  WhatsApp-specific integration is sequenced last; mobile-first is a day-one
  property of the page.
