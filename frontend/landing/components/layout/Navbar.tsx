"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          "bg-white/95 backdrop-blur-md",
          scrolled
            ? "border-b border-neutral-200 shadow-[0_2px_20px_rgba(11,61,46,0.08)]"
            : "border-b border-transparent"
        )}
        style={{ top: "3px" }}
      >
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-brand-900 rounded-[8px] flex items-center justify-center font-display font-extrabold text-[18px] text-amber">
                A
              </div>
              <span className="font-display font-bold text-[20px] text-brand-900 tracking-tight">
                Andikisha<span className="text-amber">HR</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[15px] font-medium transition-colors duration-200",
                      pathname === link.href
                        ? "text-brand-900 font-semibold"
                        : "text-neutral-600 hover:text-brand-900"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="#"
                className="text-[15px] font-medium text-neutral-600 hover:text-brand-900 transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link href="/demo" className="btn-outline-dark text-[14px] px-4 py-2">
                Request Demo
              </Link>
              <Link href="/pricing" className="btn-primary text-[14px] px-4 py-2">
                Start Free
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-neutral-700 hover:text-brand-900 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transition-transform duration-300 flex flex-col",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center font-display font-extrabold text-base text-amber">
                A
              </div>
              <span className="font-display font-bold text-[18px] text-brand-900">
                Andikisha<span className="text-amber">HR</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center h-11 px-4 rounded-lg text-[15px] font-medium transition-colors",
                      pathname === link.href
                        ? "bg-brand-50 text-brand-900 font-semibold"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-brand-900"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6 border-t border-neutral-100 flex flex-col gap-3">
            <Link
              href="/demo"
              className="btn-primary justify-center text-center"
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="/demo"
              className="btn-outline-dark justify-center text-center"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[75px]" />
    </>
  );
}
