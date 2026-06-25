"use client";

import {
  Bot,
  FileSearch,
  GitBranch,
  Lightbulb,
  Search,
  Users,
} from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";
import { cn } from "@/lib/utils/cn";

const featureIcons = [Bot, FileSearch, Search, GitBranch, Lightbulb, Users];

export function LandingFeatures() {
  const { features, productName } = landingConfig;

  return (
    <section
      id="fonctionnalites"
      className="section-padding scroll-mt-20 border-b border-border/40 bg-muted/15"
    >
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow={productName}
            title="Tout ce qu'il faut pour piloter l'innovation"
            subtitle="Des modules pensés pour la propriété intellectuelle — brevets, marques, dessins & modèles."
          />
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = featureIcons[i] ?? Bot;
            return (
              <FadeIn key={f.title} delay={i * 0.06}>
                <article
                  className={cn(
                    "group h-full rounded-xl border border-border/60 bg-card p-6 shadow-sm",
                    "transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5"
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-primary/10 text-cyan-600 transition-colors group-hover:from-cyan-500/25 dark:text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
