import Link from "next/link";
import { LogoFull } from "@andikisha/ui";
import NewsletterForm from "@/components/ui/NewsletterForm";

const PRODUCT_LINKS = [
  { label: "Payroll & Compliance", href: "/features#payroll" },
  { label: "People Management", href: "/features#people" },
  { label: "Employee Self-Service", href: "/features#employee" },
  { label: "Time & Attendance", href: "/features#integrations" },
  { label: "Pricing", href: "/pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/about#careers" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "Data Processing", href: "/dpa" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white/60">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="AndikishaHR home" className="mb-4 inline-block">
              <LogoFull variant="white-mark" className="h-7 w-auto" />
            </Link>
            <p className="text-[14px] text-white/45 leading-relaxed mb-1 mt-4 max-w-[240px]">
              HR and payroll built for modern African businesses.
            </p>
            <p className="text-[13px] text-white/30 leading-relaxed mb-5 max-w-[240px]">
              Westlands Business Park<br />
              Nairobi, Kenya<br />
              hello@andikishahr.com
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {["KRA Compliant", "KDPA Registered", "Data in East Africa"].map((badge) => (
                <span
                  key={badge}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded border border-white/10 text-white/45"
                >
                  {badge}
                </span>
              ))}
            </div>
            <NewsletterForm />
          </div>

          {/* Product */}
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/80 mb-4">Product</p>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/45 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/80 mb-4">Company</p>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/45 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/80 mb-4">Legal</p>
            <ul className="flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[14px] text-white/45 hover:text-white/80 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.07] pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[13px] text-white/30">
            © {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
            {/* TODO: replace with real KDPA registration number */}
            <span className="ml-3 text-white/20">KDPA Reg: [PENDING]</span>
          </p>
          <div className="flex items-center gap-5">
            <a href="https://twitter.com/andikishahr" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/35 hover:text-white/70 transition-colors">Twitter</a>
            <a href="https://linkedin.com/company/andikishahr" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/35 hover:text-white/70 transition-colors">LinkedIn</a>
            <Link href="/contact" className="text-[13px] text-white/35 hover:text-white/70 transition-colors">Contact support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
