"use client";

import { useEffect, useRef } from "react";
import { cn } from "../utils";

interface BaseModalProps {
  labelId: string;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Tailwind max-width for the surface. Mirrors DialogContent's `maxWidth`.
   * Callers needing a fixed width pass it via `className` (e.g. "w-[640px]") —
   * tailwind-merge lets it win over the default `w-full`.
   */
  maxWidth?: string;
  /**
   * Extra classes on the surface. tailwind-merge resolves conflicts, so a caller
   * can opt out of the default padding with `p-0` (scrollable modals that pad
   * their own header/body/footer) or override the width.
   */
  className?: string;
}

export function BaseModal({
  labelId,
  onClose,
  children,
  maxWidth = "max-w-lg",
  className,
}: BaseModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the modal container on mount — ONCE.
  //
  // This deliberately has an empty dependency array and must keep it. Previously the
  // focus call lived in the same effect as the Escape listener, which depends on
  // `onClose`. Callers pass an inline arrow (`onClose={() => setOpen(false)}`), so
  // `onClose` had a new identity on every render: typing one character re-rendered the
  // page, changed the identity, re-ran the effect, and this focus() pulled focus off
  // the input the user was typing into. Every modal form accepted exactly one
  // character (FE-BACKLOG-020). Keep focus-on-mount and the Escape listener in
  // separate effects so a re-binding listener can never steal focus again.
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Escape-to-close. Free to re-bind whenever `onClose` changes — it carries no
  // focus side effect, so re-running it is harmless.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      {/*
        The surface lives here, not in the caller. Every caller used to hand-roll an
        identical `bg-white rounded-xl shadow-xl border border-neutral-200`; forgetting
        it rendered bare content over the backdrop with the page bleeding through — a
        wrong-looking render that passed code review and only failed on a screenshot
        (FE-BACKLOG-007, instantiated twice as FE-BACKLOG-008). Owning it here makes
        that unforgettable. Tokens match DialogContent so the two modal primitives are
        visually identical.
      */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={cn(
          "w-full bg-surface rounded-2xl shadow-2xl border border-neutral-200 p-6",
          "outline-none",
          maxWidth,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
