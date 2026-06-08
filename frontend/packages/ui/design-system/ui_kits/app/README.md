# Andikisha — App UI Kit (HRIS)

A high-fidelity, interactive recreation of the **Andikisha application** — the
people & payroll workspace. Rebranded from the SmartHR HRM template into
Andikisha's forest-green + amber identity.

## Run it
Open `index.html`. You land on the **login** screen (pre-filled — just click
**Sign in**). From there the app shell is live: navigate via the sidebar.

## Built-out flows
- **Dashboard** — welcome banner, KPI stat tiles, attendance trend (CSS bar
  chart), "who's in today", leave-by-department, pending approvals.
- **Employees** — searchable / filterable people table with avatars, type &
  status badges.
- **Leave** — tabbed requests table; **approve / decline** pending rows live.
- **Payroll** — June run summary, checklist, per-employee breakdown, "Run
  payroll" action.

Other nav items (Attendance, Recruitment, Performance, Expenses, Reports,
Settings) render a labelled placeholder — intentionally left blank, not faked.

## Files
| File | Role |
|---|---|
| `index.html` | Entry — loads React + Babel + the JSX modules |
| `components.jsx` | Primitives: `Icon, Button, Badge, Avatar, Card, CardHead, Stat, BarChart` |
| `shell.jsx` | `Sidebar`, `Topbar`, `NAV` |
| `screens.jsx` | Data (`TEAM`), `Dashboard`, `Employees` |
| `screens2.jsx` | `Leave`, `Payroll`, `Login` |
| `app.jsx` | Root: auth gate + screen routing |

## Notes
- Icons are **Lucide** (inline SVG, via the shared `../lucide-icon.jsx`).
- Tokens come from the root `colors_and_type.css`.
- This is a **cosmetic** recreation — interactions are mocked, no backend.
