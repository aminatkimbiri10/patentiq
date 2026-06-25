"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { Button } from "@/components/ui/button";
import { landingConfig } from "@/config/landing";
import { cn } from "@/lib/utils/cn";

export function LandingPricing() {
  const { pricing, primaryCta } = landingConfig;

  return (
    <section id="tarifs" className="section-padding scroll-mt-20 border-b border-border/40">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Tarifs"
            title="Des formules adaptées à votre maturité PI"
            subtitle="Pas de SaaS générique : chaque accompagnement est cadré avec I2PA. Le pilote permet de tester l'espace client sur un premier dossier."
          />
        </FadeIn>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
          {pricing.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-8",
                  plan.highlighted
                    ? "relative border-cyan-500/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20 lg:-translate-y-2"
                    : "border-border/60"
                )}
              >
                {plan.highlighted && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                    Recommandé
                  </span>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{plan.desc}</p>
                <p className="mt-6 text-2xl font-semibold tracking-tight">{plan.price}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-8 w-full",
                    plan.highlighted &&
                      "bg-[hsl(213,52%,25%)] hover:bg-[hsl(213,52%,20%)] dark:bg-cyan-600 dark:hover:bg-cyan-500"
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
