# AndikishaHR — Landing Page

Production-ready Next.js 15 landing page for AndikishaHR, the HR and Payroll platform for Kenyan businesses.

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, features, pricing, FAQ, CTA |
| `/features` | Full product feature breakdown with compliance engine |
| `/pricing` | Pricing cards + full comparison table |
| `/about` | Company story, mission, team, careers |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/demo` | Demo request form |
| `/contact` | Contact form + details |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/security` | Security and compliance |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Fonts:** Bricolage Grotesque (display) + DM Sans (body) + DM Mono (numbers)
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## Local Development

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn

### Setup

```bash
# Clone or extract the project
cd andikisha-landing

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

No environment variables are required to run the landing page in development.

For production, create a `.env.local` file for any integrations you add:

```env
# Example — add when connecting a real email service
RESEND_API_KEY=re_xxxxxxxxxxxx

# Example — add when connecting analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Deployment to Vercel

### One-click deploy (recommended)

1. Push the project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Leave all settings at default — Vercel detects Next.js automatically
5. Click **Deploy**

The project builds and deploys in under 2 minutes with zero configuration.

### CLI deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Adding Real Form Submission

The demo and contact forms currently log to the console. To connect a real email service:

### Using Resend (recommended)

```bash
npm install resend
```

Create `app/api/demo/route.ts`:

```ts
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  await resend.emails.send({
    from: "hello@andikishahr.com",
    to: "sales@andikishahr.com",
    subject: `New demo request — ${body.company}`,
    text: JSON.stringify(body, null, 2),
  });
  return NextResponse.json({ ok: true });
}
```

Then update `app/demo/DemoForm.tsx` to POST to `/api/demo` instead of the local function.

---

## Connecting Analytics

Add Google Analytics 4 to `app/layout.tsx`:

```tsx
import { GoogleAnalytics } from "@next/third-parties/google";

// Inside <html>:
<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
```

---

## Custom Domain on Vercel

1. Go to your Vercel project → **Settings** → **Domains**
2. Add `andikishahr.com` and `www.andikishahr.com`
3. Update your DNS records at your registrar:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`

---

## Project Structure

```
andikisha-landing/
├── app/
│   ├── layout.tsx              Root layout (fonts, nav, footer)
│   ├── globals.css             Tailwind base + custom component classes
│   ├── page.tsx                Home page
│   ├── not-found.tsx           404 page
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   ├── contact/
│   │   ├── page.tsx
│   │   └── ContactForm.tsx
│   ├── demo/
│   │   ├── page.tsx
│   │   └── DemoForm.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   └── security/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          Fixed nav, mobile menu, active link detection
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── DashboardMockup.tsx Animated payroll dashboard (client)
│   │   ├── TrustRail.tsx       Animated stats bar (client)
│   │   ├── ProblemSection.tsx
│   │   ├── FeaturesSection.tsx Tab-switcher (client)
│   │   ├── BenefitsSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── PricingSection.tsx
│   │   ├── FAQSection.tsx      Accordion (client)
│   │   └── FinalCTA.tsx
│   └── ui/
│       ├── AnimatedSection.tsx IntersectionObserver fade-up (client)
│       ├── ScrollProgress.tsx  Top progress bar (client)
│       ├── WhatsAppFloat.tsx   Fixed WhatsApp button (client)
│       └── MobileCTABar.tsx    Bottom bar on mobile (client)
├── lib/
│   ├── data.ts                 All content data
│   └── utils.ts                cn() helper
└── hooks/                      (available for custom hooks)
```

---

## Customisation

### Brand colors

Edit `tailwind.config.ts` → `theme.extend.colors.brand` and `amber`.

### Content

All copy, testimonials, blog posts, pricing, and FAQs live in `lib/data.ts`. Edit that file to update content across the site without touching component files.

### Adding a real blog CMS

Replace the `BLOG_POSTS` array in `lib/data.ts` with a fetch from Contentful, Sanity, or any headless CMS. The blog listing and post pages are already structured to accept the same data shape.

---

## License

Private — AndikishaHR Limited. All rights reserved.
