"use client";
import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { KbdHint } from "./KbdHint";
import { cn } from "../utils";

// ── Public types ─────────────────────────────────────────────────────────────

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ElementType;
  onSelect: () => void;
  keywords?: string[];
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  groups: CommandGroup[];
  placeholder?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CommandPalette({
  groups,
  placeholder = "Search actions, employees, pages…",
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <RadixDialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-[20%] -translate-x-1/2",
            "w-full max-w-[560px]",
            "rounded-2xl border border-[#E5E7EB] bg-surface shadow-2xl",
            "p-0 overflow-hidden",
            "focus:outline-none"
          )}
          aria-describedby={undefined}
        >
          {/* Visually hidden title for accessibility */}
          <RadixDialog.Title className="sr-only">
            Command palette
          </RadixDialog.Title>

          <Command className="flex flex-col" loop>
            {/* Search row */}
            <div className="flex items-center gap-2 px-4 border-b border-[#E5E7EB] h-12">
              <Search size={16} className="text-[#9CA3AF] flex-shrink-0" />
              <Command.Input
                placeholder={placeholder}
                className="flex-1 bg-transparent text-[14px] text-near-black placeholder:text-[#9CA3AF] outline-none"
              />
              <KbdHint>Esc</KbdHint>
            </div>

            {/* Results */}
            <Command.List className="overflow-y-auto max-h-[360px] py-2">
              <Command.Empty className="py-8 text-center text-[13px] text-[#9CA3AF]">
                No results found.
              </Command.Empty>

              {groups.map((group) => (
                <Command.Group
                  key={group.label}
                  heading={
                    <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] px-4 py-1.5 block">
                      {group.label}
                    </span>
                  }
                >
                  {group.items.map((item) => (
                    <CommandPaletteItem
                      key={item.id}
                      item={item}
                      onSelect={() => {
                        setOpen(false);
                        item.onSelect();
                      }}
                    />
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

// ── Internal item renderer ────────────────────────────────────────────────────

interface CommandPaletteItemProps {
  item: CommandItem;
  onSelect: () => void;
}

function CommandPaletteItem({ item, onSelect }: CommandPaletteItemProps): ReactNode {
  const Icon = item.icon;
  return (
    <Command.Item
      value={item.id}
      keywords={item.keywords}
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-[#374151]",
        "rounded-lg mx-1 cursor-pointer select-none",
        "data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-900",
        "outline-none"
      )}
    >
      {Icon && <Icon size={15} className="flex-shrink-0 text-[#6B7280]" />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.description && (
        <span className="text-[12px] text-[#9CA3AF] truncate max-w-[160px]">
          {item.description}
        </span>
      )}
    </Command.Item>
  );
}
