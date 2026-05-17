# Forbidden Dependencies

The complete list of packages that must not appear in `frontend/tenant-portal/package.json` or `frontend/platform-portal/package.json`. Every package on this list is part of the SmartHR template's dependency tree and is incompatible with the AndikishaHR stack.

Before adding any package to either app, check this list. If the package is here, do not add it. If it solves a real problem that AndikishaHR has, surface the question.

## CSS frameworks and styling

| Package | Why forbidden |
|---|---|
| `bootstrap` | AndikishaHR uses Tailwind, not Bootstrap. Mixing the two means fighting two CSS systems for every component. |
| `react-bootstrap` | Wrapper for Bootstrap. Same reason. |
| `sass`, `sass-loader`, `node-sass` | AndikishaHR uses Tailwind utility classes only. No SCSS files in production code. |
| `style-loader`, `css-loader`, `resolve-url-loader` | Webpack-era patterns. Next.js 15 handles styling internally. |

## UI component libraries

| Package | Why forbidden |
|---|---|
| `antd` | Ant Design. Full UI library with its own design system, ~600KB+ bundle. AndikishaHR builds on `@andikisha/ui` and Tailwind primitives. |
| `@ant-design/*` | Any Ant Design subpackage. Same reason. |
| `primereact` | PrimeReact. Another full UI library with its own design system. Same reason. |
| `primeicons` | Companion to PrimeReact. |

## Icon libraries

AndikishaHR uses Lucide React only. All other icon families are forbidden.

| Package | Why forbidden |
|---|---|
| `@fortawesome/fontawesome-free` | FontAwesome. Brand inconsistency, requires CSS loading. |
| `@fortawesome/free-solid-svg-icons` | FontAwesome subpackage. |
| `@fortawesome/react-fontawesome` | FontAwesome React wrapper. |
| `react-feather` | Feather icons (React port). Different visual language from Lucide. |
| `react-icons` | Catch-all icon library. Too broad, ships unused icons. |
| `weather-icons-react` | Weather-specific icons. Out of scope for an HR product. |
| `react-country-flag` | Country flag library. If flags are needed, render via Unicode emoji or SVG sprite. |

## Charts

AndikishaHR picks one charting library and stays with it. The SmartHR template ships two; both are forbidden until a single choice is made and approved.

| Package | Why forbidden until approved |
|---|---|
| `apexcharts` | One option, ships with the template. Do not add unilaterally. |
| `react-apexcharts` | Wrapper. |
| `chart.js` | Alternative option, also ships with the template. Do not add unilaterally. |
| `react-chartjs-2` | Wrapper. |

If charts are needed in tenant-portal or platform-portal, raise a discussion to pick one library across both apps.

## Date and time pickers

The SmartHR template ships three. Pick one for AndikishaHR (recommended: native `<input type="date">` or `react-day-picker` for richer needs). The template's three are forbidden until a single choice is made.

| Package | Why forbidden until approved |
|---|---|
| `react-datepicker` | One option. |
| `react-time-picker` | One option. |
| `react-bootstrap-daterangepicker` | Bootstrap-styled. |

## Form input enhancements

| Package | Why forbidden |
|---|---|
| `react-input-mask` | Original package is unmaintained for React 18+. Use a maintained alternative if input masking is needed. |
| `@mona-health/react-input-mask` | The fork the template uses. Same concern: surface the question before adding. |

## Rich text editors

The SmartHR template ships two rich text editors plus a base library. AndikishaHR's MVP scope does not include rich text editing. If a future need arises (employee handbooks, policy documents), pick one across the product, not three.

| Package | Why forbidden until approved |
|---|---|
| `quill` | The base library. |
| `react-quill-new` | Quill React wrapper. |
| `react-simple-wysiwyg` | Alternative WYSIWYG. |

## Carousels and sliders

AndikishaHR's UI does not need carousels. Surface the discussion before adding any of these.

| Package | Why forbidden |
|---|---|
| `react-slick` | Slick carousel React wrapper. |
| `slick-carousel` | Slick carousel base. |
| `swiper` | Alternative slider library. |

## Drag and drop

AndikishaHR currently has no drag-and-drop UI in scope. If a need arises (kanban for some future feature), use a single modern library across the product.

| Package | Why forbidden until approved |
|---|---|
| `@hello-pangea/dnd` | The maintained fork of `react-beautiful-dnd`. |
| `dragula` | Older drag-and-drop library, unmaintained. |

## Calendar components

| Package | Why forbidden until approved |
|---|---|
| `@fullcalendar/*` | FullCalendar React. Heavy and stylistically inconsistent with AndikishaHR's brand. If a calendar view is needed, evaluate lighter alternatives or build on `react-day-picker`. |

## Mapping

| Package | Why forbidden until approved |
|---|---|
| `leaflet` | Map library. AndikishaHR may need maps for geofencing zones eventually, but choose deliberately, not because the template happens to include this. |
| `@types/leaflet` | Companion types. |

## State management

| Package | Why forbidden until audited |
|---|---|
| `@reduxjs/toolkit` | If your existing scaffolds use Context, Zustand, or server actions, do not add Redux. The Phase 0 audit of Prompt A must resolve which state management library AndikishaHR uses. Until that is settled, do not introduce a new one. |
| `react-redux` | Companion to Redux. |

## Other template-only packages

| Package | Why forbidden |
|---|---|
| `clipboard-copy` | A small clipboard library. The browser's `navigator.clipboard.writeText()` covers the use case without a dependency. |
| `react-countup` | Number counter animation. Not needed for the AndikishaHR product. |
| `react-awesome-stars-rating` | Star rating widget. Out of scope. |
| `react-tag-input` | Tag input widget. If tagging is needed, build on `@andikisha/ui` primitives. |
| `react-perfect-scrollbar` | Custom scrollbar library. Browser default scrollbars are fine. |
| `yet-another-react-lightbox` | Image lightbox. Out of scope. |
| `web-vitals` | Web Vitals measurement. Next.js 15 has built-in support. |
| `rollup` | Bundler. Next.js handles bundling internally. |
| `rimraf` | Cross-platform `rm -rf`. Not a UI dependency. |

## How to handle a borderline case

If a package solves a real AndikishaHR problem and is not on this list, but you are unsure whether it conflicts with the philosophy:

1. Check if `@andikisha/ui` already has a primitive for this need.
2. Check if a Tailwind-native or unstyled headless library (Radix UI, Headless UI) covers it.
3. Check the package's bundle size, maintenance status, and TypeScript support.
4. Surface the proposal with the rationale before adding.

If the package is just a different shade of something on this list (another full UI library, another icon family, another carousel library), default to refusing it.

## What is allowed

For completeness, the AndikishaHR-approved UI stack:

- `tailwindcss` for styling
- `lucide-react` for icons
- `roboto` (via `next/font/google`) — canonical font for all portals
- `@andikisha/ui` for shared component primitives
- `@andikisha/api-client` for backend API calls
- `@andikisha/shared-types` for shared TypeScript types
- The state management library identified by the Phase 0 audit (single choice across both apps)
- Headless UI primitives from Radix UI or similar, evaluated case by case

Anything beyond this list requires explicit discussion.
