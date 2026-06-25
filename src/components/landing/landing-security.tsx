"use client";

import { Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/landing/fade-in";
import { SectionHeader } from "@/components/landing/section-header";
import { LandingSecondaryCta } from "@/components/landing/landing-cta";
import { Button } from "@/components/ui/button";
import { landingConfig } from "@/config/landing";
import { mailtoHref } from "@/lib/utils/mailto";

export function LandingSecurity() {
  const { security, contact } = landingConfig;

  return (
    <section id="securite" className="section-padding scroll-mt-20 border-b border-border/40 bg-muted/15">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <SectionHeader
              eyebrow="Confiance"
              title={security.title}
              subtitle={security.subtitle}
              centered={false}
            />
            <ul className="mt-8 space-y-3">
              {security.items.map((item, i) => (
                <FadeIn key={item} delay={i * 0.05} direction="none">
                  <li className="flex items-start gap-3 text-sm">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                </FadeIn>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  <Lock className="mr-2 h-4 w-4" />
                  Connexion sécurisée
                </Link>
              </Button>
              <LandingSecondaryCta />
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
              <p className="text-sm font-semibold text-foreground">Cabinet I2PA</p>
              <p className="mt-1 text-xs text-muted-foreground">Cabinet I2PA · Mohammedia</p>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Téléphone
                  </dt>
                  <dd className="mt-1 font-medium">
                    <a href={`tel:${contact.phoneTel}`} className="hover:text-primary">
                      {contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="mt-1 font-medium">
                    <a
                      href={mailtoHref(contact.email, {
                        subject: "Demande consultation PI — I2PA",
                      })}
                      className="hover:text-primary underline-offset-4 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Adresse</dt>
                  <dd className="mt-1 font-medium">{contact.address}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Horaires</dt>
                  <dd className="mt-1 font-medium">{contact.hours}</dd>
                </div>
              </dl>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
