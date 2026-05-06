import Link from "next/link";
import { LogoFull } from "@andikisha/ui";
import NewsletterForm from "@/components/ui/NewsletterForm";

const PRODUCT_LINKS = [
  { label: "Payroll & Compliance", href: "/product#payroll" },
  { label: "Employee Self-Service", href: "/product#self-service" },
  { label: "Leave Management", href: "/product#leave" },
  { label: "Time & Attendance", href: "/product#time-attendance" },
  { label: "M-Pesa Disbursements", href: "/product#disbursements" },
  { label: "Pricing", href: "/pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/about#careers" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Data Processing", href: "/dpa" },
  { label: "Security", href: "/security" },
  { label: "Cookie Policy", href: "/privacy#cookies" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white/60">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand — 2 cols */}
          <div className="sm:col-span-2">
            <Link href="/" aria-label="AndikishaHR home" className="mb-5 inline-block">
              <LogoFull variant="white-mark" className="h-7 w-auto" />
            </Link>
            <p className="text-[14px] text-white/40 leading-relaxed mb-1 mt-4 max-w-[260px]">
              Kenyan HR and payroll, built statute-first. One platform for HR, payroll and compliance.
            </p>
            <p className="text-[13px] text-white/25 leading-relaxed mb-6 max-w-[260px]">
              Westlands Business Park<br />
              Nairobi, Kenya<br />
              hello@andikishahr.com
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {["KRA Compliant", "KDPA Registered", "Data in Kenya"].map((badge) => (
                <span
                  key={badge}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded border border-white/[0.08] text-white/35"
                >
                  {badge}
                </span>
              ))}
            </div>
            <NewsletterForm />
          </div>

          {/* Product */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/60 mb-5">Product</p>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/35 hover:text-white/70 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/60 mb-5">Company</p>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/35 hover:text-white/70 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/60 mb-5">Legal</p>
            <ul className="flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/35 hover:text-white/70 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
            <span className="ml-3 text-white/15">KDPA Reg: [PENDING]</span>
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://linkedin.com/company/andikishahr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-white/30 hover:text-white/65 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/andikishahr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-white/30 hover:text-white/65 transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href="https://facebook.com/andikishahr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-white/30 hover:text-white/65 transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
