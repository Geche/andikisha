"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../utils";
import type { ReactNode } from "react";

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

interface DialogContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function DialogContent({
  title,
  description,
  children,
  className,
  maxWidth = "max-w-lg",
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-full bg-surface rounded-2xl shadow-2xl border border-neutral-200",
          "p-6",
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <RadixDialog.Title className="text-[18px] font-bold text-near-black leading-tight">
              {title}
            </RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-[13px] text-neutral-500 mt-1">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close className="rounded-md p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber">
            <X size={16} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
