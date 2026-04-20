import Link from "next/link";
import { Linkedin, Twitter, Instagram } from "lucide-react";
import { COMPANY, NAV_LINKS } from "@/lib/data";

const PRODUCT_LINKS = [
  { label: "Payroll & Compliance", href: "/features#payroll" },
  { label: "People Management", href: "/features#people" },
  { label: "Employee Self-Service", href: "/features#employee" },
  { label: "Time & Attendance", href: "/features#time" },
  { label: "Pricing", href: "/pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/about#careers" },
  { label: "Partners", href: "/about#partners" },
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
    <footer className="bg-[#060f09] text-white/60">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12 pt-16 pb-8">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand col */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-brand-900 rounded-[8px] flex items-center justify-center font-display font-extrabold text-lg text-amber">
                A
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Andikisha<span className="text-amber">HR</span>
              </span>
            </Link>
            <p className="text-[14px] text-white/45 leading-relaxed mb-5 max-w-[240px]">
              {COMPANY.description}
            </p>

            {/* Social links */}
            <div className="flex gap-3 mb-6">
              <a
                href={COMPANY.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 bg-white/[0.07] rounded-lg flex items-center justify-center text-white/60 hover:bg-white/[0.12] hover:text-white transition-all duration-200"
              >
                <Linkedin size={16} />
              </a>
              <a
                href={COMPANY.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 bg-white/[0.07] rounded-lg flex items-center justify-center text-white/60 hover:bg-white/[0.12] hover:text-white transition-all duration-200"
              >
                <Twitter size={16} />
              </a>
              <a
                href={COMPANY.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/[0.07] rounded-lg flex items-center justify-center text-white/60 hover:bg-white/[0.12] hover:text-white transition-all duration-200"
              >
                <Instagram size={16} />
              </a>
            </div>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              {["KRA Compliant", "GDPR Ready", "Data in East Africa"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded border border-white/10 text-white/55"
                  >
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Product links */}
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/90 font-display mb-4">
              Product
            </div>
            <ul className="flex flex-col gap-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/45 hover:text-white/85 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/90 font-display mb-4">
              Company
            </div>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/45 hover:text-white/85 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/90 font-display mb-4">
              Legal
            </div>
            <ul className="flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/45 hover:text-white/85 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.07] pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[13px] text-white/35">
            © {new Date().getFullYear()} AndikishaHR Limited. All rights
            reserved.
          </p>
          <p className="text-[13px] text-white/55 font-semibold">
            Built in Kenya for Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}
