"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="py-24 bg-surface-alt">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection>
            <p className="section-eyebrow">FAQ</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="section-title mx-auto max-w-[480px]">
              Questions we get asked.
            </h2>
          </AnimatedSection>
        </div>

        {/* Accordion */}
        <dl className="max-w-[820px] mx-auto">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={cn(
                "border-b border-neutral-200",
                i === 0 && "border-t"
              )}
            >
              <dt>
                <button
                  className="w-full flex items-center justify-between gap-4 py-5 text-left font-display font-semibold text-[17px] text-neutral-900 hover:text-brand-800 transition-colors duration-200 focus-visible:outline-none focus-visible:text-brand-800"
                  onClick={() => toggle(i)}
                  aria-expanded={open === i}
                >
                  {item.question}
                  <ChevronDown
                    size={22}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 text-neutral-400 transition-transform duration-300",
                      open === i && "rotate-180 text-brand-700"
                    )}
                  />
                </button>
              </dt>
              <dd
                className="overflow-hidden transition-all duration-350 ease-in-out"
                style={{
                  maxHeight: open === i ? "400px" : "0",
                }}
              >
                <p className="text-[16px] text-neutral-600 leading-[1.8] pb-5">
                  {item.answer}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
