# Template Directory

This directory contains a commercial admin template (SmartHR by Dreams Technologies) that AndikishaHR uses as **visual reference only**.

## Read this before touching anything in this directory

This directory is **not part of the AndikishaHR application**. It is reference material, isolated from the workspace.

- It is excluded from `pnpm-workspace.yaml` via `!template/**`
- Its dependencies are not installed when you run `pnpm install` at the repo root
- Its code is never imported into `frontend/tenant-portal/` or `frontend/platform-portal/`
- Its dependencies are never added to either app's `package.json`

## The three rules

1. **Use it for visual reference and feature blueprint only.** Study the structure of screens, then rebuild in the AndikishaHR stack.

2. **Never import from this directory in production code.** No `import` statements referencing `template/*` in any file under `frontend/tenant-portal/` or `frontend/platform-portal/`. No Bootstrap classes, no SCSS, no template-only dependencies (full list in `.claude/skills/template-reference/forbidden-dependencies.md`).

3. **Only build features on the AndikishaHR roadmap.** The template has CRM, Recruitment, Accounting, and other surfaces that are not in scope. Order from the roadmap, not the template buffet.

## What's in here

- `smarthr-nextjs/` — the Next.js version of the template
- `smarthr-html/` — the static HTML version (faster for browsing screens)

## To run the template standalone

If you want to view screens live without running it inside the workspace:

```bash
cd smarthr-nextjs
pnpm install
pnpm dev
```

This installs the template's dependencies inside the `template/smarthr-nextjs/` directory only. It does not pollute the workspace or your monorepo lockfile.

## The AndikishaHR stack

When building production UI for `frontend/tenant-portal/` or `frontend/platform-portal/`, use:

- Tailwind CSS for styling
- Lucide React for icons
- Bricolage Grotesque for display type, DM Sans for body
- Brand tokens from `andikishahr-brand-colours.md`
- Component primitives from `@andikisha/ui`

## Where to look for guidance

- **Quick reference for which template screen to study for which AndikishaHR feature**: `.claude/skills/template-reference/screen-mapping.md`
- **Full list of forbidden dependencies**: `.claude/skills/template-reference/forbidden-dependencies.md`
- **Long-form usage guide and rationale**: `docs/design/system/template-usage.md`
- **Claude Code skill that auto-enforces these rules**: `.claude/skills/template-reference/SKILL.md`

## What this directory is not

- A starter kit
- A component library
- A design system
- Code to copy

It is a reference. Treat it like a book on a shelf: open it, study it, learn from it, then close it and build your own thing.
