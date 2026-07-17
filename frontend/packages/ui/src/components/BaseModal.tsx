"use client";

import { useEffect, useRef } from "react";

interface BaseModalProps {
  labelId: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ labelId, onClose, children }: BaseModalProps) {
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
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="outline-none"
      >
        {children}
      </div>
    </div>
  );
}
