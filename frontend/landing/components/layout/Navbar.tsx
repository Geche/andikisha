"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Compliance", href: "/features#compliance" },
  { label: "Customers", href: "/about#customers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white border-b border-ink-200 shadow-[0_2px_8px_rgba(7,30,19,0.04)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto max-w-[1320px] px-6 md:px-12">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/" aria-label="AndikishaHR home" className="shrink-0">
              <LogoFull
                variant={scrolled ? "default" : "white-mark"}
                className="h-7 w-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[15px] font-medium transition-colors duration-200",
                    scrolled
                      ? "text-ink-700 hover:text-ink-900"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                className={cn(
                  "text-[15px] font-medium transition-colors px-3 py-2",
                  scrolled ? "text-ink-700 hover:text-ink-900" : "text-white/80 hover:text-white"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/demo"
                className={cn(
                  "text-[14px] font-semibold px-4 py-2 rounded-lg border transition-colors duration-200",
                  scrolled
                    ? "border-ink-200 text-ink-900 hover:bg-ink-100"
                    : "border-white/30 text-white hover:bg-white/10"
                )}
              >
                Book a demo
              </Link>
              <Link
                href="/pricing"
                className="text-[14px] font-semibold px-4 py-2 rounded-lg bg-amber text-ink-900 hover:bg-amber-dark transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              >
                Start free trial
              </Link>
            </div>

            <button
              className={cn(
                "md:hidden p-2 rounded-lg transition-colors",
                scrolled ? "text-ink-700 hover:bg-ink-100" : "text-white hover:bg-white/10"
              )}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen sheet */}
      <div
        className={cn(
          "fixed inset-0 z-[60] md:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div
          className="absolute inset-0 bg-brand-950/95 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/10">
            <Link href="/" aria-label="AndikishaHR home" onClick={() => setMobileOpen(false)}>
              <LogoFull variant="white-mark" className="h-7 w-auto" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center px-8" aria-label="Mobile">
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center h-14 text-[22px] font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center h-14 text-[22px] font-semibold text-white/80 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div className="px-8 pb-10 flex flex-col gap-3">
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-12 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
            >
              Start free trial
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-12 rounded-lg border border-white/20 text-white font-semibold text-[15px] hover:bg-white/10 transition-colors"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer so content below nav isn't hidden */}
      <div className="h-[72px]" />
    </>
  );
}
