"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const DARK_HERO_PAGES = ["/"];

export default function Navbar() {
  const pathname = usePathname();
  const hasDarkHero = DARK_HERO_PAGES.includes(pathname);

  const [scrolled, setScrolled] = useState(!hasDarkHero);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stripDismissed, setStripDismissed] = useState(false);

  useEffect(() => {
    setScrolled(!hasDarkHero);
    setMobileOpen(false);
  }, [pathname, hasDarkHero]);

  useEffect(() => {
    if (!hasDarkHero) return;
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) { setScrolled(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasDarkHero, pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isTransparent = !scrolled;

  return (
    <>
      {/* Single sticky wrapper — keeps strip + header together so header never overlaps strip */}
      <div className="sticky top-0 z-50">
        {/* Utility strip */}
        {!stripDismissed && (
          <div className="relative bg-amber text-ink-900 text-center py-2.5 px-12 flex items-center justify-center gap-2">
            <span className="text-[13px] font-semibold leading-none">
              Founding customer access is open — pricing locked for 24 months.
            </span>
            <Link
              href="/early-access"
              className="text-[13px] font-bold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1 leading-none"
            >
              Apply now →
            </Link>
            <button
              onClick={() => setStripDismissed(true)}
              aria-label="Dismiss announcement"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <header
          className={cn(
            "transition-all duration-300",
            isTransparent
              ? "bg-transparent border-b border-transparent"
              : "bg-white border-b border-ink-200 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          )}
        >
          <div className="mx-auto max-w-[1320px] px-6 md:px-12">
            <div className="flex items-center justify-between h-[68px]">

              <Link href="/" aria-label="AndikishaHR home" className="shrink-0">
                <LogoFull
                  variant={isTransparent ? "white-mark" : "default"}
                  className="h-7 w-auto"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-[14px] font-medium transition-colors duration-200",
                      isTransparent
                        ? "text-white/75 hover:text-white"
                        : "text-ink-600 hover:text-ink-900"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                  className={cn(
                    "text-[14px] font-medium px-3 py-2 transition-colors duration-200",
                    isTransparent ? "text-white/75 hover:text-white" : "text-ink-600 hover:text-ink-900"
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/demo"
                  className={cn(
                    "text-[14px] font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200",
                    isTransparent
                      ? "bg-white text-brand-900 hover:bg-white/90"
                      : "bg-brand-900 text-white hover:bg-brand-800"
                  )}
                >
                  Book a Demo
                </Link>
              </div>

              <button
                id="mobile-nav-trigger"
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  isTransparent ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
                )}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile drawer — conditionally rendered to avoid aria-modal issues when closed */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="fixed inset-0 z-[60] lg:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="absolute inset-0 bg-brand-950/98 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-6 h-[68px] border-b border-white/[0.08]">
              <Link href="/" aria-label="AndikishaHR home" onClick={() => setMobileOpen(false)}>
                <LogoFull variant="white-mark" className="h-7 w-auto" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center px-8" aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center h-14 text-[22px] font-semibold text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="px-8 pb-10 flex flex-col gap-3">
              <Link
                href="/demo"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors"
              >
                Book a Demo
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg border border-white/20 text-white font-medium text-[15px] hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
