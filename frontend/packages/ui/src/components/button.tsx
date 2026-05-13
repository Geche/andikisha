"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils";

export type ButtonVariant = "primary" | "cta" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   "bg-brand-900 text-white hover:bg-brand-800",
  cta:       "bg-amber text-near-black hover:bg-amber-dark",
  secondary: "bg-surface border border-neutral-200 text-neutral-700 hover:bg-neutral-100",
  ghost:     "text-neutral-700 hover:bg-neutral-100",
  danger:    "bg-error text-white hover:bg-red-600",
  outline:   "border border-brand-900 text-brand-900 hover:bg-brand-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5 text-[13.5px]",
  lg: "h-11 px-5 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
