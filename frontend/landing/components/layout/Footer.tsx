import Link from "next/link";
import { LogoFull } from "@andikisha/ui";

const PRODUCT_LINKS = [
  { label: "Payroll & Compliance",  href: "/product#payroll" },
  { label: "Employee Self-Service", href: "/product#self-service" },
  { label: "Leave Management",      href: "/product#leave" },
  { label: "Time & Attendance",     href: "/product#time-attendance" },
  { label: "M-Pesa Disbursements",  href: "/product#disbursements" },
  { label: "Pricing",               href: "/pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us",  href: "/about" },
  { label: "Partners",  href: "/partners" },
  { label: "Blog",      href: "/blog" },
  { label: "Careers",   href: "/about#careers" },
  { label: "Contact",   href: "/contact" },
];

const RESOURCE_LINKS = [
  { label: "Blog",             href: "/blog" },
  { label: "Compliance guide", href: "/blog" },
  { label: "Calculator",       href: "/#calculator" },
  { label: "Help centre",      href: "/contact" },
  { label: "Support",          href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",   href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Data Processing",  href: "/dpa" },
  { label: "Security",         href: "/security" },
  { label: "Cookie Policy",    href: "/privacy#cookies" },
];

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-5">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-[13px] text-white/50 hover:text-white/85 transition-colors duration-200"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white/60">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand — 2 cols */}
          <div className="lg:col-span-2">
            <Link href="/" aria-label="AndikishaHR home" className="mb-5 inline-block">
              <LogoFull variant="white-mark" className="h-[22px] w-auto" />
            </Link>
            <p className="text-[13px] text-white/40 leading-[1.65] mt-4 max-w-[240px] mb-4">
              HR and payroll, calculated correctly. Built for modern African businesses.
            </p>
            <p className="text-[12px] text-white/25 leading-[1.65]">
              Westlands Business Park<br />
              Nairobi, Kenya<br />
              hello@andikishahr.com
            </p>
          </div>

          <FooterCol title="Product"   links={PRODUCT_LINKS} />
          <FooterCol title="Company"   links={COMPANY_LINKS} />
          <FooterCol title="Resources" links={RESOURCE_LINKS} />
          <FooterCol title="Legal"     links={LEGAL_LINKS} />
        </div>

        <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
            <span className="ml-3 text-white/15">KDPA Reg: [PENDING]</span>
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "LinkedIn",    href: "https://linkedin.com/company/andikishahr" },
              { label: "X (Twitter)", href: "https://twitter.com/andikishahr" },
              { label: "YouTube",     href: "https://youtube.com/@andikishahr" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-white/30 hover:text-white/65 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
