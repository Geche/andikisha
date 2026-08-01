"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting and reacts to live changes.
 *
 * Initial value is `false` (assume motion) so SSR and first client render agree,
 * avoiding a hydration mismatch; the effect corrects it on mount. CSS transitions
 * are already neutralised by the global reduced-motion blanket in `globals.css`,
 * so this hook exists mainly for JS-driven animation (e.g. the count-up) that the
 * CSS rule cannot reach.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
