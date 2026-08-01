"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Splits a stat string into an optional non-numeric prefix, a numeric part
 * (with decimal precision), and any trailing text. Handles "240", "1.2", "100",
 * "<20", "<1". Returns null when there is no number to animate (e.g. plain text).
 */
function parseValue(value: string) {
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, rest] = match;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix, target: parseFloat(numStr), decimals, rest };
}

/**
 * Animates a numeric stat from 0 up to its value when it scrolls into view.
 *
 * Renders the exact target by default (SSR-safe, and correct with no JS), then
 * counts up once on first intersection. Non-numeric values and reduced-motion
 * users get the final value with no animation. Meant to render only the number;
 * keep any suffix (e.g. the amber "+") as a sibling element.
 */
export default function CountUp({
  value,
  durationMs = 1200,
}: {
  value: string;
  durationMs?: number;
}) {
  const parsed = parseValue(value);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // null = show the exact target; a number = mid-animation frame.
  const [frame, setFrame] = useState<number | null>(null);

  useEffect(() => {
    if (!parsed || reduced) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let raf = 0;
    let start = 0;
    let fired = false;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || fired) return;
        fired = true;
        io.unobserve(entry.target);

        const tick = (ts: number) => {
          if (!start) start = ts;
          const t = Math.min((ts - start) / durationMs, 1);
          if (t < 1) {
            setFrame(parsed.target * easeOutCubic(t));
            raf = requestAnimationFrame(tick);
          } else {
            setFrame(null); // snap to the exact target
          }
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // parsed is derived from value; value + reduced are the real inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced, durationMs]);

  if (!parsed) return <span ref={ref}>{value}</span>;

  const current = frame === null ? parsed.target : frame;
  const formatted = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals,
  }).format(current);

  return (
    <span ref={ref}>
      {parsed.prefix}
      {formatted}
      {parsed.rest}
    </span>
  );
}
