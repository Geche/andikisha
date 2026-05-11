"use client";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const BASE =
  "w-full border rounded-lg px-3.5 py-2.5 text-[14px] text-near-black bg-surface " +
  "placeholder:text-[#9CA3AF] transition-shadow " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 " +
  "focus-visible:outline-amber focus-visible:outline-offset-0 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        BASE,
        error
          ? "border-error focus-visible:outline-error"
          : "border-[#D0D5DD] focus-visible:border-brand-900",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
