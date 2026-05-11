"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../utils";
import type { ReactNode } from "react";

export const SheetRoot = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;

interface SheetContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  side?: "right" | "left";
  width?: string;
}

export function SheetContent({
  title,
  description,
  children,
  side = "right",
  width = "w-full max-w-md",
}: SheetContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 top-0 bottom-0 bg-surface shadow-2xl flex flex-col",
          side === "right"
            ? "right-0 border-l border-[#E5E7EB]"
            : "left-0 border-r border-[#E5E7EB]",
          width
        )}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5E7EB] flex-shrink-0">
          <div>
            <RadixDialog.Title className="text-[16px] font-bold text-near-black">{title}</RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-[13px] text-[#6B7280] mt-0.5">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close className="rounded-md p-1 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber">
            <X size={16} />
          </RadixDialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
