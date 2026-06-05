---
name: andikisha-design
description: Use this skill to generate well-branded interfaces and assets for Andikisha (a people & payroll / HRIS platform), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Andikisha is a people & payroll platform. Brand: **forest green** (`#0b3d2e`)
with a single **amber** accent (`#e8a020`), near-black green ink (`#02110c`),
Roboto type, Lucide icons. Calm, grounded, trustworthy — never hypey.

Key files:
- `README.md` — brand story, CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, ICONOGRAPHY, index.
- `colors_and_type.css` — all design tokens (color scales, semantic vars, type, spacing, radii, shadows, motion). Import this first.
- `assets/brand/` — logos (full + mark, in green/amber, black, white). `assets/avatars/` — sample people photos. `ui_kits/lucide-icon.jsx` — shared Lucide icon component + name map. `assets/icons/tabler/` — Tabler webfont (alternate icon set).
- `preview/` — small spec cards (color, type, spacing, components).
- `ui_kits/app/` — interactive HRIS recreation (dashboard, employees, leave, payroll, login).
- `ui_kits/marketing/` — landing-page recreation.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy
assets out and create static HTML files for the user to view. If working on
production code, copy assets and read the rules here to become an expert in
designing with this brand.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some questions, and act as an expert designer who
outputs HTML artifacts _or_ production code, depending on the need.
