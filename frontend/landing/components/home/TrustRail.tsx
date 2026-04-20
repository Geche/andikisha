"use client";

import { useEffect, useRef } from "react";

const STATS = [
  { value: 500, suffix: "+", label: "companies onboarded", animated: true },
  { raw: "KES 2.1B+", label: "payroll processed", animated: false },
  { raw: "99.8%", label: "platform uptime", animated: false },
  { raw: "28hrs", label: "saved per payroll cycle", animated: false },
];

function CountUp({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            let current = 0;
            const step = Math.ceil(target / 60);
            const timer = setInterval(() => {
              current = Math.min(current + step, target);
              if (el) el.textContent = current + suffix;
              if (current >= target) clearInterval(timer);
            }, 20);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  return (
    <span ref={ref} className="font-mono text-[28px] font-medium text-brand-900 block">
      0{suffix}
    </span>
  );
}

export default function TrustRail() {
  return (
    <div className="bg-surface-alt border-y border-neutral-200 py-7">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        <div className="flex flex-wrap justify-around gap-y-6 gap-x-4">
          {STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="text-center">
                {stat.animated && stat.value !== undefined ? (
                  <CountUp target={stat.value} suffix={stat.suffix!} />
                ) : (
                  <span className="font-mono text-[28px] font-medium text-brand-900 block">
                    {stat.raw}
                  </span>
                )}
                <span className="text-[13px] text-neutral-600 font-medium font-body">
                  {stat.label}
                </span>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden sm:block w-px h-12 bg-neutral-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
