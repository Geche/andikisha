"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full border rounded-lg px-3.5 py-2.5 text-[14px] text-near-black bg-surface resize-none",
        "placeholder:text-neutral-400 transition-shadow",
        "focus:outline-none focus-visible:outline focus-visible:outline-2",
        "focus-visible:shadow-focus",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        error
          ? "border-error focus-visible:outline-error"
          : "border-neutral-300 focus-visible:border-brand-900",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
