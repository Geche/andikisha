"use client";
import { cn } from "../utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function Switch({ checked, onCheckedChange, disabled, size = "md", className, id }: SwitchProps) {
  const trackW = size === "sm" ? "w-8 h-4" : "w-10 h-5";
  const thumbW = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const thumbX = size === "sm"
    ? (checked ? "translate-x-4" : "translate-x-0.5")
    : (checked ? "translate-x-5" : "translate-x-0.5");
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        trackW,
        checked ? "bg-brand-900" : "bg-neutral-300",
        className
      )}
    >
      <span
        className={cn(
          "block bg-white rounded-full shadow-sm transition-transform",
          thumbW,
          thumbX
        )}
      />
    </button>
  );
}
