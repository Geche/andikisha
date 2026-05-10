"use client";

import { useEffect, useRef } from "react";

interface BaseModalProps {
  labelId: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function BaseModal({ labelId, onClose, children }: BaseModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the modal container on mount
    containerRef.current?.focus();

    // Escape key closes the modal
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
