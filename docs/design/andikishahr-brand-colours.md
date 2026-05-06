# AndikishaHR Brand Colours

Extracted from the official logo SVG files. Use these values across all frontend applications — `landing`, `admin-portal`, and `employee-portal`.

---

## Logo Colour Sources

The logomark has two shapes. Both colours are locked — never substitute.

| Element | Token | Hex |
|---|---|---|
| Logomark primary shape | `brand-900` | `#0B3D2E` |
| Logomark accent shape | `amber` | `#E8A020` |
| Wordmark text | `near-black` | `#02110C` |

---

## Full Colour Palette

### Primary — Forest Green

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `brand-950` | `#071E13` | 7 / 30 / 19 | Footer background, deepest dark surfaces |
| `brand-900` | `#0B3D2E` | 11 / 61 / 46 | Hero, nav, dark sections, logomark shape 1 |
| `brand-800` | `#0F5040` | 15 / 80 / 64 | Hover states, hero gradient end |
| `brand-700` | `#166A50` | 22 / 106 / 80 | Section eyebrow text, check icons, stat labels |
| `brand-500` | `#27A870` | 39 / 168 / 112 | Success states, compliance indicators, status dots |
| `brand-100` | `#D1F5E6` | 209 / 245 / 230 | Light badge fills |
| `brand-50` | `#E8F5F0` | 232 / 245 / 240 | Card hover fills, icon backgrounds |

### Accent — Warm Amber

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `amber` | `#E8A020` | 232 / 160 / 32 | Logomark shape 2, CTA buttons, scroll bar, star ratings |
| `amber-dark` | `#C98510` | 201 / 133 / 16 | CTA hover/pressed state |
| `amber-light` | `#FEF3DC` | 254 / 243 / 220 | Icon backgrounds, badge fills on light |

### Surfaces

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `surface` | `#FFFFFF` | 255 / 255 / 255 | Cards, inputs, nav background |
| `surface-alt` | `#F8F7F4` | 248 / 247 / 244 | Alternating section backgrounds |

### Neutral — Text & Borders

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `neutral-900` | `#111111` | 17 / 17 / 17 | Headings, primary body text |
| `neutral-700` | `#374151` | 55 / 65 / 81 | Nav links, secondary text |
| `neutral-600` | `#4B5563` | 75 / 85 / 99 | Body copy, card descriptions |
| `neutral-400` | `#9CA3AF` | 156 / 163 / 175 | Placeholder text, chevrons, meta |
| `neutral-200` | `#E5E7EB` | 229 / 231 / 235 | Card borders, dividers, input borders |
| `neutral-100` | `#F3F4F6` | 243 / 244 / 246 | Unselected tab backgrounds |

### Functional

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `near-black` | `#02110C` | 2 / 17 / 12 | Wordmark text colour |
| `whatsapp` | `#25D366` | 37 / 211 / 102 | WhatsApp float button only |
| `error` | `#EF4444` | 239 / 68 / 68 | Form validation errors |
| `info-blue` | `#60A5FA` | 96 / 165 / 250 | Mockup info badges |

---

## Tailwind Config

Paste this into `tailwind.config.ts` under `theme.extend.colors`:

```ts
colors: {
  brand: {
    950: "#071e13",
    900: "#0b3d2e",
    800: "#0f5040",
    700: "#166a50",
    500: "#27a870",
    100: "#d1f5e6",
    50:  "#e8f5f0",
  },
  amber: {
    DEFAULT: "#e8a020",
    dark:    "#c98510",
    light:   "#fef3dc",
  },
  surface: {
    DEFAULT: "#ffffff",
    alt:     "#f8f7f4",
  },
},
```

---

## CSS Custom Properties

For non-Tailwind usage, paste into your root stylesheet:

```css
:root {
  /* Brand — Forest Green */
  --color-brand-950: #071e13;
  --color-brand-900: #0b3d2e;
  --color-brand-800: #0f5040;
  --color-brand-700: #166a50;
  --color-brand-500: #27a870;
  --color-brand-100: #d1f5e6;
  --color-brand-50:  #e8f5f0;

  /* Accent — Warm Amber */
  --color-amber:       #e8a020;
  --color-amber-dark:  #c98510;
  --color-amber-light: #fef3dc;

  /* Surfaces */
  --color-surface:     #ffffff;
  --color-surface-alt: #f8f7f4;

  /* Neutral */
  --color-neutral-900: #111111;
  --color-neutral-700: #374151;
  --color-neutral-600: #4b5563;
  --color-neutral-400: #9ca3af;
  --color-neutral-200: #e5e7eb;
  --color-neutral-100: #f3f4f6;

  /* Functional */
  --color-near-black: #02110c;
  --color-whatsapp:   #25d366;
  --color-error:      #ef4444;
}
```

---

## Print References

| Colour | HEX | CMYK | Pantone |
|---|---|---|---|
| Forest Green | `#0B3D2E` | 82 / 0 / 25 / 76 | Pantone 3435 C |
| Warm Amber | `#E8A020` | 0 / 31 / 86 / 9 | Pantone 131 C |
| Near Black | `#02110C` | 88 / 0 / 29 / 93 | Pantone Black 6 C |

---

## Rules

- `#E8A020` amber is the **only** colour allowed on CTA buttons. No other accent on interactive elements.
- `#0B3D2E` and `#E8A020` are **locked** — never substitute or adjust saturation/brightness on the logomark shapes.
- Use `brand-500` (`#27A870`) for all success and compliance confirmation states (filed, approved, complete).
- `near-black` (`#02110C`) is preferred over pure `#000000` for all text — it carries the green undertone that keeps the identity cohesive.
- `surface-alt` (`#F8F7F4`) is a warm off-white. Use it for alternating sections. Do not swap for `neutral-100` — the warmth is intentional.
