"use client";

import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";

export function LandingTrust() {
  const { trust } = landingConfig;

  return (
    <section className="border-b border-border/40 bg-muted/20 py-14 sm:py-16">
      <div className="container">
        <FadeIn>
          <SectionHeader title={trust.title} subtitle={trust.subtitle} />
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {trust.partners.map((name) => (
              <span
                key={name}
                className="text-sm font-medium tracking-wide text-muted-foreground/80 transition-colors hover:text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {trust.metrics.map((m, i) => (
            <FadeIn key={m.label} delay={0.15 + i * 0.08}>
              <div className="rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
                <p className="text-2xl font-semibold tracking-tight text-cyan-600 dark:text-cyan-400 sm:text-3xl">
                  {m.value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
