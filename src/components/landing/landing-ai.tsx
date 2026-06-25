"use client";

import {
  Brain,
  Globe,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";

const aiIcons = [MessageSquare, Search, Sparkles, TrendingUp, Brain, Globe];

export function LandingAI() {
  const { ai } = landingConfig;

  return (
    <section className="section-padding border-b border-border/40">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <SectionHeader
              eyebrow="Intelligence artificielle"
              title={ai.title}
              subtitle={ai.subtitle}
              centered={false}
            />
            <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-primary/5 p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                L&apos;IA assiste — elle ne remplace pas votre conseil CPI I2PA. Chaque analyse
                reste dans votre dossier, avec traçabilité et contrôle des accès.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-3 sm:grid-cols-2">
            {ai.capabilities.map((cap, i) => {
              const Icon = aiIcons[i] ?? Brain;
              return (
                <FadeIn key={cap.title} delay={i * 0.06}>
                  <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-cyan-500/25">
                    <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h3 className="mt-3 text-sm font-semibold">{cap.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {cap.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
