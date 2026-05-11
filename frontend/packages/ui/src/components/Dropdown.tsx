"use client";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "../utils";
import type { ReactNode } from "react";

export const DropdownRoot = RadixDropdown.Root;
export const DropdownTrigger = RadixDropdown.Trigger;

interface DropdownContentProps {
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export function DropdownContent({ children, align = "end", className }: DropdownContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={6}
        className={cn(
          "z-50 min-w-[180px] rounded-xl border border-[#E5E7EB] bg-surface shadow-lg p-1",
          className
        )}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  className?: string;
  disabled?: boolean;
}

export function DropdownItem({ children, onSelect, danger, disabled, className }: DropdownItemProps) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] cursor-pointer outline-none",
        "focus:bg-[#F3F4F6]",
        danger ? "text-error focus:bg-red-50" : "text-[#374151]",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {children}
    </RadixDropdown.Item>
  );
}

export function DropdownSeparator() {
  return <RadixDropdown.Separator className="h-px bg-[#E5E7EB] my-1 -mx-1" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <RadixDropdown.Label className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
      {children}
    </RadixDropdown.Label>
  );
}
