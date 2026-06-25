"use client";

import { ArrowRight, X, Check } from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";

export function LandingProblemSolution() {
  const { problemSolution } = landingConfig;

  return (
    <section id="solutions" className="section-padding scroll-mt-20 border-b border-border/40">
      <div className="container">
        <FadeIn>
          <SectionHeader title={problemSolution.title} subtitle={problemSolution.subtitle} />
        </FadeIn>

        <div className="mx-auto mt-14 max-w-4xl space-y-4">
          {problemSolution.pains.map((item, i) => (
            <FadeIn key={item.pain} delay={i * 0.08}>
              <div className="grid overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm md:grid-cols-2">
                <div className="flex items-start gap-3 border-b border-border/60 bg-destructive/5 p-5 md:border-b-0 md:border-r">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-destructive/70" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Problème
                    </p>
                    <p className="mt-1 font-medium text-foreground">{item.pain}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Avec {landingConfig.productName}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-10 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400">
            Une approche proactive, rigoureuse et adaptée — comme sur{" "}
            <a
              href={landingConfig.websiteUrl}
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              i2pa.com
            </a>
            <ArrowRight className="h-4 w-4" />
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
