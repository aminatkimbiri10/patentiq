"use client";

import { Building2, FlaskConical, Rocket, Scale } from "lucide-react";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { landingConfig } from "@/config/landing";

const roleIcons = [Rocket, Building2, FlaskConical, Scale];

export function LandingRoles() {
  const { roles } = landingConfig;

  return (
    <section className="section-padding border-b border-border/40 bg-muted/15">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Solutions"
            title="Conçu pour chaque acteur de l'innovation"
            subtitle="Porteurs, incubateurs, équipes R&D et professionnels PI — un espace adapté à chaque rôle."
          />
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {roles.map((role, i) => {
            const Icon = roleIcons[i] ?? Rocket;
            return (
              <FadeIn key={role.title} delay={i * 0.08}>
                <div className="flex h-full gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{role.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {role.desc}
                    </p>
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
