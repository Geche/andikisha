"use client";

import { useState, useRef, useEffect, type ReactNode, type ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "../utils";
import { LogoFull } from "./LogoFull";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HorizontalNavItem {
  label: string;
  href?: string;
  icon?: ElementType;
  badge?: string | number;
  /** Dropdown children rendered when the item is hovered / clicked */
  children?: HorizontalNavItem[];
}

interface HorizontalShellProps {
  navItems: HorizontalNavItem[];
  /** Slot for profile menu, notifications, settings — rendered on the right of the top bar */
  rightSlot?: ReactNode;
  /** Amber strip shown when a Andikisha operator is impersonating a tenant */
  impersonationBanner?: ReactNode;
  children: ReactNode;
  className?: string;
}

// ─── Dropdown item ────────────────────────────────────────────────────────────

function DropdownNavItem({ item }: { item: HorizontalNavItem }) {
  const Icon = item.icon;
  const inner = (
    <span className="flex items-center gap-2 w-full px-3 py-2 text-[13px] rounded-md hover:bg-neutral-100 transition-colors text-neutral-700 hover:text-neutral-900">
      {Icon && <Icon size={14} className="text-neutral-500 flex-shrink-0" />}
      {item.label}
    </span>
  );
  if (!item.href) return <div>{inner}</div>;
  return <Link href={item.href}>{inner}</Link>;
}

// ─── Top-level nav item with optional dropdown ────────────────────────────────

function TopNavItem({
  item,
  active,
}: {
  item: HorizontalNavItem;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trigger = (
    <button
      onClick={() => hasChildren && setOpen((p) => !p)}
      className={cn(
        "flex items-center gap-1.5 h-[56px] px-3 text-[13.5px] font-semibold transition-colors relative",
        "border-b-2 -mb-px",
        active
          ? "border-b-brand-900 text-neutral-900"
          : "border-b-transparent text-neutral-600 hover:text-neutral-900 hover:border-b-neutral-300"
      )}
    >
      {item.label}
      {item.badge != null && (
        <span className="text-[10px] font-bold min-w-[18px] px-1 py-px bg-brand-900 text-white rounded-full">
          {item.badge}
        </span>
      )}
      {hasChildren && (
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={cn("transition-transform", open && "rotate-180")}
        />
      )}
    </button>
  );

  return (
    <div ref={ref} className="relative flex items-stretch">
      {item.href && !hasChildren ? (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-1.5 h-[56px] px-3 text-[13.5px] font-semibold transition-colors border-b-2 -mb-px",
            active
              ? "border-b-brand-900 text-neutral-900"
              : "border-b-transparent text-neutral-600 hover:text-neutral-900 hover:border-b-neutral-300"
          )}
        >
          {item.label}
          {item.badge != null && (
            <span className="text-[10px] font-bold min-w-[18px] px-1 py-px bg-brand-900 text-white rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ) : (
        trigger
      )}

      {hasChildren && open && (
        <div
          className={cn(
            "absolute top-full left-0 mt-1 z-50",
            "bg-white border border-neutral-200 rounded-xl shadow-lg",
            "min-w-[200px] py-1.5 px-1.5"
          )}
        >
          {item.children!.map((child) => (
            <DropdownNavItem key={child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mobile drawer nav ────────────────────────────────────────────────────────

function MobileNav({
  items,
  open,
  onClose,
}: {
  items: HorizontalNavItem[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[280px] bg-white h-full flex flex-col shadow-xl z-50">
        <div className="flex items-center justify-between h-[56px] px-4 border-b border-neutral-200">
          <LogoFull className="h-[22px] w-auto" />
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13.5px] font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    {Icon && <Icon size={16} strokeWidth={1.75} />}
                    {item.label}
                    {item.badge != null && (
                      <span className="ml-auto text-[10px] font-bold min-w-[18px] px-1 py-px bg-brand-900 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mt-3 first:mt-0">
                    {item.label}
                  </div>
                )}
                {item.children?.map((child) => {
                  const ChildIcon = child.icon;
                  return child.href ? (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={onClose}
                      className="flex items-center gap-2.5 h-9 px-5 rounded-lg text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                      {ChildIcon && <ChildIcon size={14} strokeWidth={1.75} />}
                      {child.label}
                    </Link>
                  ) : null;
                })}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ─── HorizontalShell ──────────────────────────────────────────────────────────

/**
 * Application shell with horizontal navigation — for platform-portal (SUPER_ADMIN surface).
 * Reference: template/smarthr-html/layout-horizontal.html.
 *
 * Layout: fixed 56px top bar (logo | nav items | right slot) + full-width content area below.
 * Mobile: hamburger opens a slide-in drawer with the same nav items.
 *
 * Uses the same HorizontalNavItem prop shape as SidebarShell's NavItem for
 * consistent navigation config across both portal types.
 */
export function HorizontalShell({
  navItems,
  rightSlot,
  impersonationBanner,
  children,
  className,
}: HorizontalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-screen overflow-hidden bg-neutral-50", className)}>
      {/* ── Top bar ── */}
      <header
        className={cn(
          "flex-shrink-0 bg-white border-b border-neutral-200 z-30",
          impersonationBanner ? "" : ""
        )}
      >
        {impersonationBanner && (
          <div className="bg-amber-light border-b border-amber px-5 py-1.5 text-[12px] font-semibold text-amber-text">
            {impersonationBanner}
          </div>
        )}

        <div className="flex items-stretch h-[56px] px-5">
          {/* Logo */}
          <div className="flex items-center pr-6 flex-shrink-0 border-r border-neutral-200 mr-4">
            <LogoFull className="h-[22px] w-auto" />
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex items-center lg:hidden mr-3 text-neutral-500 hover:text-neutral-900"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          {/* Horizontal nav — desktop only */}
          <nav className="hidden lg:flex items-stretch flex-1 gap-0.5">
            {navItems.map((item) => (
              <TopNavItem
                key={item.label}
                item={item}
                active={pathname === item.href || pathname.startsWith((item.href ?? "") + "/")}
              />
            ))}
          </nav>

          {/* Right slot */}
          {rightSlot && (
            <div className="flex items-center gap-2 flex-shrink-0 pl-4">
              {rightSlot}
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileNav
        items={navItems}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Page content ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
