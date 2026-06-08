"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product",    href: "/product"  },
  { label: "Compliance", href: "/security" },
  { label: "Pricing",    href: "/pricing"  },
  { label: "Resources",  href: "/blog"     },
  { label: "About",      href: "/about"    },
];

const DARK_HERO_PAGES: string[] = [];

export default function Navbar() {
  const pathname = usePathname();
  const hasDarkHero = DARK_HERO_PAGES.includes(pathname);

  const [scrolled, setScrolled]   = useState(!hasDarkHero);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    if (mobileOpen) {
      closeButtonRef.current?.focus();
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const transparent = !scrolled;

  return (
    <>
      <div className="sticky top-0 z-50">
        <header
          className={cn(
            "transition-all duration-300",
            transparent
              ? "bg-transparent border-b border-transparent"
              : "bg-white border-b border-ink-200 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          )}
        >
          <div className="mx-auto max-w-[1320px] px-6 md:px-12">
            <div className="flex items-center justify-between h-[68px]">

              <Link href="/" aria-label="AndikishaHR home" className="shrink-0">
                <LogoFull
                  variant={transparent ? "white-mark" : "default"}
                  className="h-7 w-auto"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "text-[14px] font-medium transition-colors duration-200",
                      transparent
                        ? "text-white/75 hover:text-white"
                        : "text-ink-600 hover:text-ink-900"
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                  className={cn(
                    "text-[14px] font-medium px-3 py-2 transition-colors duration-200",
                    transparent ? "text-white/75 hover:text-white" : "text-ink-600 hover:text-ink-900"
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/demo"
                  className="text-[14px] font-semibold px-5 py-2.5 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 transition-colors duration-200 focus-ring"
                >
                  Schedule a demo
                </Link>
              </div>

              <button
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  transparent ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
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
                ref={closeButtonRef}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8" aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center h-14 text-[22px] font-semibold text-white/70 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="px-8 pb-10 flex flex-col gap-3">
              <Link
                href="/demo"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 font-semibold text-[15px] transition-colors focus-ring"
              >
                Schedule a demo
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg border border-white/20 text-white font-medium text-[15px] hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
