# Template Usage Guide: SmartHR Reference

## What this is

This document explains how to use the SmartHR template that lives in the `template/` directory at the repo root. The template is a purchased commercial admin template from Dreams Technologies. It is reference material, not source code.

You bought it. You can study it. You do not import from it.

## Why this document exists

The SmartHR template is genuinely useful as a visual reference. It contains pre-designed screens for almost every HR and payroll scenario, plus a comprehensive Super Admin section that maps closely to AndikishaHR's `platform-portal`. The structural decisions on each screen, the information density, the way data is grouped, the way settings are organised, all have value.

But the template ships with a stack that does not match AndikishaHR's. It uses Bootstrap, react-bootstrap, Ant Design, PrimeReact, FontAwesome, Feather Icons, and several other libraries that have no place in the AndikishaHR codebase. If you tried to use the template as a starter kit, you would inherit hundreds of megabytes of dependencies, a CSS framework that fights Tailwind for every component, and a visual identity that overrides the brand you carefully built into the landing site.

This document codifies the boundary: the template is a reference, not a foundation. It exists to be studied, not imported.

## What's in the repo

Two versions of the template are kept at the repo root:

- `template/smarthr-nextjs/` for the Next.js version
- `template/smarthr-html/` for the static HTML version

Both are read-only as far as this project is concerned. They are not part of the pnpm workspace. Their dependencies are not installed alongside the rest of the project. Build commands at the repo root do not touch them.

To run the template standalone for live browsing, change into the directory and run it independently:

```bash
cd template/smarthr-nextjs
pnpm install
pnpm dev
```

This installs the template's dependency tree only inside that directory and does not pollute the monorepo workspace.

## The three rules

### Rule 1: Use it for visual reference and feature blueprint

When you need to design a payslip screen, look at SmartHR's payslip page for layout structure. When designing the platform-portal's tenant management surfaces, study SmartHR's Super Admin section. The structural decisions in the template (what information sits where, how dense the table is, what filters live on a list page, how a settings tree is organised) are the value you get from owning the template.

You translate that structure into the AndikishaHR stack. You do not translate the code.

### Rule 2: Do not copy code wholesale

Nothing from `template/` is imported into `frontend/tenant-portal/` or `frontend/platform-portal/`. Specifically forbidden in production code:

- Any `import` statement that references `template/*`
- Bootstrap CSS classes (`btn`, `card`, `row`, `col-`, `mb-3`, `d-flex`, `text-muted`, and so on)
- Imports from `react-bootstrap`, `antd`, `primereact`
- SCSS files (the AndikishaHR stack is Tailwind utility classes only)
- The template's colour palette or font choices
- The template's icon libraries (`@fortawesome/*`, `react-feather`, `react-icons`, weather icons, country flags)

The complete list of forbidden dependencies lives at `.claude/skills/template-reference/forbidden-dependencies.md`.

Production code uses the AndikishaHR stack only:

- Tailwind CSS for styling
- Lucide React for icons
- Bricolage Grotesque for display type, DM Sans for body
- Brand tokens defined in `andikishahr-brand-colours.md`
- Component primitives from `@andikisha/ui`

### Rule 3: Do not build features the template has but the roadmap does not

The template includes a buffet of screens: CRM, Recruitment, Accounting, Project Management, Voice and Video Calling, Social Feed, Knowledge Base, File Manager. None of these are in the AndikishaHR Phase 1 to Phase 4 roadmap. You order from the roadmap, not the buffet.

The features that map to AndikishaHR (and therefore are worth referencing visually) are listed in the next section.

## High-value sections by app

The complete screen-to-feature mapping lives at `.claude/skills/template-reference/screen-mapping.md`. The summary below covers the headline targets.

### For `platform-portal` (internal Andikisha staff)

The SmartHR Super Admin section is your structural blueprint. It contains:

- Platform Dashboard
- Companies (the tenant list)
- Subscriptions
- Packages (pricing tiers)
- Domain
- Purchase Transactions
- Tenant Usage Metrics
- Tenant Support Tickets
- Agents, SLA Policies, Escalation Rules

The structure of these screens maps cleanly onto what `platform-portal` needs. Study the layouts, then rebuild in the AndikishaHR stack.

### For `tenant-portal` `/admin/*` (HR, payroll, compliance)

Reference these SmartHR screens for layout inspiration:

- HR Dashboard, Payroll Dashboard, Attendance Dashboard
- Employees List, Employees Grid, Employee Details
- Departments, Designations
- Payslip, Employee Salary, Payroll Items
- Leaves (Admin), Leave Settings
- Attendance (Admin), Timesheets, Shift and Schedule, Overtime
- Performance Review, Performance Appraisal, Goal Tracking (Phase 3 placeholder)
- Reports section (Expense Report, Payslip Report, Attendance Report, Leave Report)
- The settings tree (General, App, System, Financial, Other)
- User Management, Roles and Permissions

### For `tenant-portal` `/my/*` (employee self-service)

Reference these SmartHR screens:

- Employee Dashboard
- Leaves (Employee)
- Attendance (Employee)
- Profile settings
- The compact form layouts in the various authentication screens

The employee surfaces in SmartHR are less mobile-optimised than what AndikishaHR needs, so the layout inspiration is partial. The information architecture is still useful.

### Authentication screens (used by both apps)

SmartHR ships three variants each of Login, Register, Forgot Password, Reset Password, Email Verification, and 2-Step Verification. Useful as a menu of "what should this screen look like" options. Pick the variant that fits the AndikishaHR brand and rebuild it in Tailwind.

## What the template does not cover

The template is a generic global HR admin product. It does not cover any Kenya-specific or East Africa-specific features. The following are designed from scratch using AndikishaHR brand tokens, your landing-site patterns, and `@andikisha/ui` primitives:

- Statutory compliance dashboards (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB)
- Compliance calendar (filing deadlines)
- M-Pesa B2C disbursement views and the M-Pesa callback log
- KRA iTax filing screens (P10 monthly, P9 annual)
- NSSF, SHIF, Housing Levy portal submission tracking
- Regulatory changelog (rate updates from the Finance Bill)
- WhatsApp approval flow surfaces (the manager-replies-in-thread pattern)
- USSD session monitoring (for the platform-portal)
- Earned Wage Access request flows
- Casual payroll runs (daily-rated and piece-rate worker payroll)
- Multi-period payroll calendar (monthly, weekly, bi-weekly, daily in one tenant)
- WHT certificate generation for contractors
- ZKTeco biometric device sync status
- Geofencing zone management for mobile clock-in

When designing any of these, consult the landing site, the brand guide, and existing components in `@andikisha/ui`. Do not try to retrofit a SmartHR screen onto a Kenya-specific feature.

## Quick reference

| Do | Do not |
|---|---|
| Browse SmartHR screens for layout structure | Import any file from `template/*` |
| Note information density and grouping | Add Bootstrap, antd, or primereact to your apps' dependencies |
| Adapt structural decisions to the AndikishaHR stack | Use SmartHR's colour palette or fonts |
| Use the Super Admin section as the platform-portal blueprint | Build CRM, Recruitment, or Accounting features just because SmartHR has them |
| Run the template standalone (`cd template/smarthr-nextjs && pnpm dev`) | Wire the template into the root pnpm workspace |
| Study how a settings tree is organised | Copy any SCSS or Bootstrap class from the template |

## When you find yourself wanting to copy code

Stop. The template's code carries Bootstrap, react-bootstrap, Ant Design, PrimeReact, and five-plus icon systems. None of these belong in the AndikishaHR codebase. If a SmartHR component looks like exactly what you need, study its structure on screen, then rebuild it in Tailwind with Lucide icons and brand colours.

## When you find yourself wanting to build something not on the roadmap

Stop. Surface the question. The template's breadth is intentional (it's sold to many different customers), but AndikishaHR is a focused product with a defined Phase 1 to Phase 4 plan. If a feature is needed but not on the roadmap, that is a roadmap discussion, not a build decision.

## How this is enforced

Three mechanisms work together to keep the template at arm's length:

1. **The Claude Code skill** at `.claude/skills/template-reference/SKILL.md` triggers automatically when Claude Code does any UI work in `tenant-portal` or `platform-portal`. The skill reads this document and enforces the three rules.

2. **The pnpm workspace exclusion** in `pnpm-workspace.yaml` via `!template/**` prevents the template from being picked up as a workspace package. Its dependencies cannot be accidentally linked into the monorepo.

3. **Human review** in PRs. Any addition to `frontend/tenant-portal/package.json` or `frontend/platform-portal/package.json` should be cross-checked against `.claude/skills/template-reference/forbidden-dependencies.md`.

If any of these three layers fails, the others should catch it. If all three fail, you have template code in production, which is exactly the failure mode this document exists to prevent.

## Maintenance

This document is updated whenever:

- A new section of the template becomes the reference for a new AndikishaHR feature
- A previously-referenced section is built out and the visual decisions are now committed to AndikishaHR's own design system
- A Kenya-specific feature is designed and the document needs to record that the template was not the source
- The forbidden-dependencies list needs to expand because a new template-only package is discovered

The companion files (`screen-mapping.md` and `forbidden-dependencies.md`) live in the Claude Code skill directory and are updated alongside this document when the related rules change.

Treat all four files (this document, the skill, the screen mapping, the forbidden list) as living. Update them as the product evolves.

---

*Companion to the Claude Code skill at `.claude/skills/template-reference/SKILL.md`. The skill exists to remind Claude Code of these rules at the moment of UI design work. This document is the long-form reference for humans and other AI assistants.*
