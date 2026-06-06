# VERIFICATION-NOTE-001 — Per-step verification gate

**Applies to:** the design-system token consolidation
(`2026-06-05-token-consolidation-plan.md`) and any step that touches a built app.
**Purpose:** make each user-visible step a *real* gate, not a ritual. A vague
"grep for tokens" passes too easily; the assertions below do not.

Every app-touching step produces a **Verification Record** (section §Audit trail)
containing **all** of A–E. The step is DONE only when A–E pass and all three apps
still build.

## A. Build
Exact command + exit code. Must be 0.

## B. Five mechanical assertions (compiled output, each with quoted evidence)
1. **Canonical tokens emitted** — the new tokens used on the changed surface
   appear in compiled CSS with correct values (e.g. `--color-green-700:#0b3d2e`).
2. **Legacy aliases still resolve** — a sampled legacy class the app actually
   uses still emits its value (e.g. `bg-brand-900` → `#0b3d2e`), proving
   alias-then-migrate did not break existing UI.
3. **No source-of-truth violation** — the app's own `globals.css` no longer
   defines a competing `@theme` colour block; tokens come only from the shared
   `@import`.
4. **Intended shift present** — the warm neutral values are emitted, not the old
   cool ones (e.g. `--color-neutral-500:#737373`, **not** `#6b7280`).
5. **No Tailwind diagnostics** — build/compile emits no "cannot resolve" /
   "unknown utility" / missing-variable warnings for classes used on the surface.

## C. Screenshot attempt (REQUIRED to attempt)
Capture the changed surface(s) via headless browser. Playwright browsers are
cached on this machine (`~/Library/Caches/ms-playwright`). If capture is
genuinely impossible, state why, fall back to B+D, and record the fallback.
**Never claim "verified via screenshot" without an attached image.**

## D. Visual checklist (per changed surface)
- [ ] Headings render **Roboto** (not a serif/sans fallback).
- [ ] Primary action renders **green-700 `#0b3d2e`**; accent renders amber-500.
- [ ] No layout regression vs prior (spacing, borders, radii intact).
- [ ] **Expected delta only** (e.g. subtle neutral warmth / green-tinted shadow);
      nothing unexpected.

## E. Audit trail
Append a dated entry below (and/or in the step's commit body) recording: step,
commit, build cmd+result, the five assertions (pass/fail + evidence), screenshot
method used (or fallback + reason), checklist result.

---

## Audit trail

_(entries appended per step as the migration executes)_
