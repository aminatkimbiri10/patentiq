"use client";

import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";

export function LandingWorkflow() {
  const { workflow } = landingConfig;

  return (
    <section id="parcours" className="section-padding scroll-mt-20 border-b border-border/40">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Parcours"
            title="De l'idée au dossier suivi en quatre étapes"
            subtitle="Un workflow clair, aligné sur les pratiques OMPIC et l'accompagnement cabinet I2PA."
          />
        </FadeIn>

        {/* Desktop timeline */}
        <div className="relative mt-14 hidden lg:block">
          <div
            className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-border to-transparent"
            aria-hidden
          />
          <div className="grid grid-cols-4 gap-6">
            {workflow.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="relative pt-4 text-center">
                  <span className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-500/40 bg-background text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    {step.step}
                  </span>
                  <h3 className="mt-5 font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="mt-10 space-y-4 lg:hidden">
          {workflow.map((step, i) => (
            <FadeIn key={step.step} delay={i * 0.08}>
              <div className="flex gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
