"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";
import { cn } from "@/lib/utils/cn";

export function LandingFAQ() {
  const { faq } = landingConfig;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding border-b border-border/40 bg-muted/15">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="FAQ"
            title="Questions fréquentes"
            subtitle="Tout ce qu'il faut savoir avant de réserver une démonstration."
          />
        </FadeIn>

        <div className="mx-auto mt-12 max-w-2xl divide-y divide-border/60 rounded-xl border border-border/60 bg-card shadow-sm" id="faq">
          {faq.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeIn key={item.q} delay={i * 0.05}>
                <div>
                  <button
                    type="button"
                    id={`faq-trigger-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/30 sm:px-6 sm:py-5 sm:text-base"
                  >
                    {item.q}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className={cn(
                      "grid transition-all duration-200",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-5">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
