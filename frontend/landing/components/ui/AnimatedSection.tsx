"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 100 | 200 | 300;
  threshold?: number;
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const delayClass = {
    0: "",
    100: "delay-100",
    200: "delay-200",
    300: "delay-300",
  }[delay];

  return (
    <div
      ref={ref}
      className={cn("animate-on-scroll", delayClass, className)}
    >
      {children}
    </div>
  );
}
