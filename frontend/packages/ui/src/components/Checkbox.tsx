"use client";
import { cn } from "../utils";

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ id, checked, onCheckedChange, disabled, className }: CheckboxProps) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className={cn(
        "w-4 h-4 rounded border border-[#D0D5DD] bg-surface cursor-pointer",
        "checked:bg-brand-900 checked:border-brand-900",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    />
  );
}
