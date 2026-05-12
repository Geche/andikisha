# Template Usage Guide: SmartHR Reference

## What this is

This document explains how to use the SmartHR template that lives in the `template/` directory at the repo root. The template is a purchased commercial admin template from Dreams Technologies. It is reference material, not source code.

You bought it. You can study it. You do not import from it.

## What's in the repo

Two versions of the template are kept at the repo root:

- `template/smarthr-nextjs/` for the Next.js version (browsing component structure, studying how a Next.js admin app can be organised)
- `template/smarthr-html/` for the static HTML version (fastest way to browse screens visually without running a dev server)

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
- Bootstrap CSS classes (`btn`, `card`, `row`, `col-`, `mb-3`, and so on)
- Imports from `react-bootstrap`, `antd`, `primereact`
- SCSS files (the AndikishaHR stack is Tailwind utility classes only)
- The template's colour palette or font choices
- The template's icon libraries (`@fortawesome/*`, `react-feather`, `react-icons`, weather icons, country flags)

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
- Performance Review, Performance Appraisal, Goal Tracking
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
- M-Pesa B2C disbursement views and the M-Pesa callback log
- KRA iTax filing screens (P10 monthly, P9 annual)
- NSSF, SHIF, Housing Levy portal submission tracking
- WhatsApp approval flow surfaces (the manager-replies-in-thread pattern)
- USSD session monitoring (for the platform-portal)
- Earned Wage Access request flows
- Casual payroll runs (daily-rated and piece-rate worker payroll)
- Multi-period payroll calendar (monthly, weekly, bi-weekly, daily in one tenant)

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

## Maintenance

This document is updated whenever:

- A new section of the template becomes the reference for a new AndikishaHR feature
- A previously-referenced section is built out and the visual decisions are now committed to AndikishaHR's own design system
- A Kenya-specific feature is designed and the document needs to record that the template was not the source

Treat this document as living. Update it as the product evolves.

---

*Companion to the Claude Code skill at `.claude/skills/template-reference/SKILL.md`. The skill exists to remind Claude Code of these rules at the moment of UI design work. This document is the long-form reference for humans and other AI assistants.*
