# AndikishaHR Documentation

Where things live, and where new documents go.

## Directory map

| Folder | Holds | Add here when |
|---|---|---|
| `decisions/` | Decision records — numbered ADRs (`0001-…`) and dated engineering decisions | You made a call that constrains future work. Required by `CLAUDE.md` for any deviation from project conventions. |
| `architecture/` | System-wide architecture references, readiness reviews, implementation order | The document describes the system as a whole, not one feature. |
| `product/` | Product planning, feature strategy, menu inventory, release notes | The document is about what to build and why, not how. |
| `plans/` | Implementation plans — the step-by-step for a body of work | You are about to execute a multi-step change. |
| `specs/` | Design specs paired with a plan — the target state | You are describing what a feature should become. |
| `design/brand/` | Brand guide, colour definitions, landing-page brief | The document defines brand identity. |
| `design/system/` | Design-system rules, token plans, template usage policy | The document governs the shared UI vocabulary. |
| `design/features/` | Dated per-feature UI designs | You are designing one screen or flow. |
| `audits/` | Read-only findings against existing code or UI | You inspected something and recorded what you found, without changing it. |
| `verification/` | Post-change evidence — screenshots, scenario transcripts, verification notes | You proved a change works. |
| `backlog/` | `BACKLOG.md` (source of truth) plus dated remediation backlogs | You are tracking work not yet scheduled. |
| `engineering/` | Working notes by area: `backend/`, `frontend/`, `research/`, `known-issues/`, `backfill/`, `ci/` | The note is diagnostic or investigative, tied to one area. |
| `api-contracts/` | Generated REST API contract docs | Output of `/gen-api-docs`. |
| `testing/` | Test guides — Postman, E2E, SIT checklists | The document explains how to test something. |
| `operations/` | Deployment and environment setup | The document is about running the system, not building it. |
| `archive/` | Superseded documents kept for reference | The document is no longer true but shouldn't vanish. |

## Conventions

- **Filenames are dated** where the document captures a point in time:
  `YYYY-MM-DD-short-description.md`. Decision records use their ADR number instead.
- **Decision records are numbered sequentially.** Check the highest existing number
  in `decisions/` before claiming one.
- **Audits describe findings; verification describes proof.** An audit that led to a
  fix does not move to `verification/` — the fix gets its own verification note.
- **Nothing lives at `docs/` root** except this README. If a document doesn't fit a
  folder above, the folder list is wrong — extend it deliberately rather than
  dropping the file at the root.

## Known gaps

- `testing/postman-testing-guide.md` and `testing/sit-checklist-template.md` reference
  `docs/api-contracts/AndikishaHR-Postman-Collection.json`, which is not in the repo.
- `operations/2026-05-29-deployment-gap-analysis.md` references `docs/github-secrets.md`,
  which does not exist.
- `product/menu-source-of-truth.md` references two ADRs that were never written
  (`0003-multi-role-foundation`, `0004-permissions-engine-and-custom-roles`). Those
  numbers are now taken by unrelated decisions — renumber the references if those
  ADRs are ever authored.
