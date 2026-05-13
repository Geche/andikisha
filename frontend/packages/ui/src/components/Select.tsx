"use client";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full border rounded-lg px-3.5 py-2.5 text-[14px] text-near-black bg-surface",
        "focus:outline-none focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-amber focus-visible:outline-offset-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error ? "border-error" : "border-neutral-300",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
