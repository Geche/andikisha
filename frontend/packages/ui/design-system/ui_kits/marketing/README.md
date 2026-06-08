# Andikisha — Marketing UI Kit

A high-fidelity recreation of the **Andikisha marketing site** — the public
landing page. Built on the Untitled-UI marketing section patterns, restyled into
Andikisha's brand.

## Run it
Open `index.html` and scroll. The pricing **Monthly / Annual** toggle is live.

## Sections
Sticky nav · hero (with an in-browser product mock) · trusted-by logo row ·
feature grid (6) · dark metrics band · testimonial · pricing (3 tiers, billing
toggle) · closing CTA · footer.

## Files
| File | Role |
|---|---|
| `index.html` | Entry — loads React + Babel + the JSX modules |
| `sections-a.jsx` | `Nav, Hero, ProductMock, Logos` + `btn()` / layout helpers |
| `sections-b.jsx` | `Features, Metrics, Testimonial, Pricing, CTA, Footer` |
| `site.jsx` | Root — composes the page |

## Notes
- Icons: **Lucide** (inline SVG, via `../lucide-icon.jsx`). Tokens: root `colors_and_type.css`.
- Copy is written to Andikisha's voice (sentence case, "you", no emoji, no hype).
- Cosmetic recreation; links are inert.
