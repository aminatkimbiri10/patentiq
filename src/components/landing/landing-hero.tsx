"use client";

import {
  Brain,
  CheckCircle2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Shield,
  Sparkles,
} from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { LandingPrimaryCta, LandingSecondaryCta } from "@/components/landing/landing-cta";
import { landingConfig } from "@/config/landing";

export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-primary/10 to-cyan-500/10 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">{landingConfig.productName}</span>
        </div>
        <div className="grid gap-0 lg:grid-cols-[200px_1fr]">
          <aside className="hidden border-r border-border/60 bg-[hsl(213,52%,12%)] p-4 lg:block">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-white/90">
              <LayoutDashboard className="h-4 w-4 text-cyan-400" />
              I2PA
            </div>
            <nav className="space-y-1 text-xs text-white/60">
              {["Tableau de bord", "Mes projets", "Surveillance", "Documents"].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 ${i === 1 ? "bg-white/10 text-white" : ""}`}
                >
                  {item}
                </div>
              ))}
            </nav>
          </aside>
          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Dossier · Brevet</p>
                <p className="font-semibold text-foreground">Système de filtration innovant</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Complétude 78 %
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: FolderKanban, label: "Statut", value: "En revue CPI" },
                { icon: FileText, label: "Documents", value: "12 fichiers" },
                { icon: Sparkles, label: "Analyses IA", value: "3 terminées" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-border/60 bg-muted/30 p-3"
                >
                  <kpi.icon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="text-sm font-medium">{kpi.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-start gap-3">
                <Brain className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Prochaine étape recommandée</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Finaliser les revendications indépendantes avant export dossier CPI.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Dossier isolé · 2FA · Collaboration CPI sécurisée
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const { hero } = landingConfig;

  return (
    <section
      id="produit"
      className="relative overflow-hidden border-b border-border/40 scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(193,90%,50%,0.12),transparent_60%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,hsl(213,52%,25%,0.08),transparent_50%)] dark:opacity-60" />

      <div className="container section-padding relative pb-16 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
              {hero.eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              {hero.headline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LandingPrimaryCta size="lg" className="w-full sm:w-auto" />
              <LandingSecondaryCta size="lg" className="w-full sm:w-auto" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{hero.trustLine}</p>
            <ul className="mt-8 space-y-3">
              {hero.benefits.map((b, i) => (
                <FadeIn key={b.title} delay={0.1 + i * 0.05} direction="none">
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    <span>
                      <strong className="font-medium text-foreground">{b.title}</strong>
                      <span className="text-muted-foreground"> — {b.desc}</span>
                    </span>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.15}>
            <DashboardMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
