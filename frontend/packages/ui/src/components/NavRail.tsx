"use client";
import Link from "next/link";
import { cn } from "../utils";
import type { ElementType, ReactNode } from "react";

// ─── NavRailItem ──────────────────────────────────────────────────────────────

interface NavRailItemProps {
  label: string;
  href?: string;
  icon: ElementType;
  active?: boolean;
  badge?: string | number;
  locked?: boolean;
  /** "dark" = white-on-dark-green rail; "light" = dark-on-white rail */
  theme?: "dark" | "light";
  onClick?: () => void;
}

export function NavRailItem({
  label,
  href,
  icon: Icon,
  active,
  badge,
  locked,
  theme = "light",
  onClick,
}: NavRailItemProps) {
  const dark = theme === "dark";

  const inner = (
    <span
      className={cn(
        "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
        locked && "opacity-40 cursor-default",
        !locked && dark && !active && "text-brand-100 hover:bg-brand-900/50 cursor-pointer",
        !locked && dark &&  active && "bg-brand-900 text-white font-semibold border-l-2 border-amber",
        !locked && !dark && !active && "text-neutral-700 hover:bg-neutral-100 cursor-pointer",
        !locked && !dark &&  active && "bg-brand-50 text-brand-900 font-semibold border-l-2 border-brand-500",
      )}
    >
      <Icon
        size={16}
        strokeWidth={active ? 2.25 : 2}
        className={cn(
          dark  && !active && "text-brand-100/70",
          dark  &&  active && "text-amber",
          !dark && !active && "text-neutral-500",
          !dark &&  active && "text-brand-700",
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {locked && (
        <span className={cn("text-[10px] font-semibold tracking-wide", dark ? "text-brand-100/50" : "text-neutral-400")}>
          Soon
        </span>
      )}
      {badge !== undefined && !locked && (
        <span className={cn(
          "text-[11px] font-semibold min-w-[20px] text-center px-1.5 py-0.5 rounded-full",
          dark ? "bg-brand-800 text-brand-100" : "bg-neutral-100 text-neutral-600"
        )}>
          {badge}
        </span>
      )}
    </span>
  );

  if (locked || !href) {
    return <div onClick={onClick}>{inner}</div>;
  }
  // The link carried no focus styling, so the browser painted its own blue outline —
  // off-brand (no blue) and inconsistent with every other control. Use the shared
  // green focus halo (--shadow-focus), matching Button; rounded to the item's own shape.
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg focus:outline-none focus-visible:shadow-focus"
    >
      {inner}
    </Link>
  );
}

// ─── NavRailGroup ─────────────────────────────────────────────────────────────

interface NavRailGroupProps {
  label?: string;
  children: ReactNode;
  theme?: "dark" | "light";
  /** Extra top space before this group */
  spacer?: boolean;
}

export function NavRailGroup({ label, children, theme = "light", spacer }: NavRailGroupProps) {
  return (
    <div className={cn(spacer && "mt-5")}>
      {label && (
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 pb-1 pt-1",
            theme === "dark" ? "text-brand-100/50" : "text-neutral-400"
          )}
        >
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ─── NavRail container ────────────────────────────────────────────────────────

interface NavRailProps {
  children: ReactNode;
  theme?: "dark" | "light";
  footer?: ReactNode;
  width?: string;
  className?: string;
}

export function NavRail({
  children,
  theme = "light",
  footer,
  width = "w-[240px]",
  className,
}: NavRailProps) {
  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col h-full border-r",
        theme === "dark"
          ? "bg-brand-950 border-brand-900"
          : "bg-surface border-neutral-200",
        width,
        className
      )}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {children}
      </nav>
      {footer && (
        <div
          className={cn(
            "flex-shrink-0 border-t px-3 py-3 space-y-0.5",
            theme === "dark" ? "border-brand-900" : "border-neutral-200"
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
