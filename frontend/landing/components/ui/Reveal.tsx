"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in ms, for siblings revealed together. */
  delay?: number;
  /** Translate-up distance in px before reveal. */
  y?: number;
}

/**
 * Reveals its children on scroll — a small fade + translate-up, once.
 *
 * A client wrapper: it can wrap server-rendered children (they are passed in as
 * `children`, not imported here). Motion honours the design system budget
 * (200ms, `--ease-out`, small translate). Under `prefers-reduced-motion` the
 * global CSS blanket zeroes the transition, so the content simply snaps in.
 * When IntersectionObserver is unavailable, children show immediately.
 */
export default function Reveal({ children, className, delay = 0, y = 12 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity 200ms var(--ease-out) ${delay}ms, transform 200ms var(--ease-out) ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
