---
name: template-reference
description: Use whenever designing, building, modifying, or reviewing UI for `frontend/tenant-portal/` or `frontend/platform-portal/`. Triggers include creating or editing page components, layouts, navigation chrome, dashboards, list views, detail views, forms, settings screens, authentication screens; making design decisions about typography, colours, icons, spacing; adding or modifying dependencies in either app's `package.json`. The skill enforces the rules of engagement for the SmartHR commercial template that lives at `template/smarthr-nextjs/` and `template/smarthr-html/` in the repo root. It prevents accidental imports from the template directory, blocks template-only dependencies from being added to the AndikishaHR apps, and ensures all production UI uses the AndikishaHR brand stack (Tailwind CSS, Lucide React, Roboto, brand tokens from `tailwind-preset.ts` and `globals.css`). Companion files `screen-mapping.md` and `forbidden-dependencies.md` in the same directory provide lookup detail.
---

# SmartHR Template Reference

A commercial admin template (SmartHR by Dreams Technologies) lives at `template/smarthr-nextjs/` and `template/smarthr-html/` in this repo. It is visual reference material only. It is not a starter kit, not a component library, and not source code for AndikishaHR.

The template is excluded from the pnpm workspace via `!template/**` in `pnpm-workspace.yaml`. Its dependencies are not installed alongside the rest of the project. Build commands at the repo root do not touch it.

## Before doing any UI work

1. Read this skill in full.
2. If the screen you are about to build has an analogue in SmartHR, check `screen-mapping.md` in this directory for the recommended reference path. Browse it visually (the static HTML version at `template/smarthr-html/` is fastest).
3. Apply the three rules below. If you are uncertain whether something is allowed, the answer is almost always "no, surface it for discussion."

## The three rules

### Rule 1: Visual reference only

The template's value is the structural decisions on each screen. What information sits where. How dense the table is. What lives in the filter bar. What's on the card. What's on the payslip page. What sits in a settings tree.

You translate the structure into the AndikishaHR stack. You do not translate the code.

### Rule 2: No template code or dependencies

In any file under `frontend/tenant-portal/` or `frontend/platform-portal/`:

Forbidden:

- Any `import` statement referencing `template/*`
- Any package on the forbidden list in `forbidden-dependencies.md`
- Bootstrap CSS classes (`btn`, `card`, `row`, `col-`, `mb-3`, `d-flex`, `text-muted`, and so on)
- SCSS files (`.scss`, `.sass`)
- The template's colour palette, font families, or icon families

Required (the AndikishaHR stack):

- Tailwind CSS utility classes only
- Brand tokens from `andikishahr-brand-colours.md`
- Lucide React for icons
- Roboto for both display and body type (loaded via `next/font/google`)
- Component primitives from `@andikisha/ui`

If you are about to add a dependency to either app's `package.json`, check it against `forbidden-dependencies.md` first.

### Rule 3: Roadmap-bounded features

The template contains many features Andikisha does not build: CRM, Recruitment, Accounting, Project Management, Voice and Video Calling, Social Feed, Knowledge Base, File Manager. If you find yourself building one because SmartHR has it, stop and ask.

In scope (these are worth referencing visually):

- Employee management (list, grid, detail, departments, designations)
- Payroll and payslips (with Kenya-specific statutory calculations layered on)
- Leave management
- Attendance, timesheets, shifts, overtime
- Performance reviews, appraisals, goals
- Documents and policies
- Reports
- User management and roles
- Settings (general, app, system, financial)
- The Super Admin section as the blueprint for `platform-portal`
- Login, register, forgot password, reset password screens

Anything else: surface the question.

## Kenya-specific features the template does not cover

These are designed from scratch using AndikishaHR brand tokens and patterns from the landing site. Do not try to retrofit a SmartHR screen onto these:

- Statutory compliance dashboards (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB)
- M-Pesa B2C disbursement views
- KRA iTax filing screens (P10 monthly, P9 annual)
- NSSF, SHIF, Housing Levy portal submission tracking
- WhatsApp approval flow surfaces
- USSD session monitoring (platform-portal)
- Earned Wage Access flows
- Casual payroll runs (daily-rated, piece-rate)
- Multi-period payroll calendar (monthly, weekly, bi-weekly, daily in one tenant)

## When in doubt

Stop in any of these situations:

- You want to copy code from the template
- You want to add a template dependency
- You want to build a feature because SmartHR has it but it is not on the AndikishaHR roadmap

Surface the question rather than guess.

## Companion files

- `screen-mapping.md` (same directory): which SmartHR screens are the reference for which AndikishaHR features
- `forbidden-dependencies.md` (same directory): the complete list of packages that must not appear in tenant-portal or platform-portal

## Full reference document

For long-form discussion of how to use the template, including the maintenance policy and the rationale for each rule, see `docs/design/system/template-usage.md`.
