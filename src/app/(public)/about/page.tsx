import {
  Award,
  Building2,
  Globe2,
  Scale,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PublicPageHero } from "@/components/layout/public-page-hero";
import { Button } from "@/components/ui/button";
import { i2paBrand, i2paServices } from "@/config/i2pa-brand";
import { siteConfig } from "@/config/site";

const strengths = [
  {
    icon: Scale,
    title: "Expertise OMPIC",
    desc: "Accompagnement brevets, marques et dessins & modèles conforme aux procédures marocaines et internationales.",
  },
  {
    icon: Users,
    title: "Équipe pluridisciplinaire",
    desc: "Conseillers CPI, juristes et ingénieurs au service des porteurs de projets, startups et entreprises.",
  },
  {
    icon: Shield,
    title: "Confidentialité & sécurité",
    desc: "Espace client sécurisé, authentification renforcée (2FA) et traçabilité des échanges sur vos dossiers.",
  },
  {
    icon: Globe2,
    title: "Vision internationale",
    desc: "Stratégie PI adaptée à vos marchés cibles — dépôts nationaux, régionaux et extensions à l'étranger.",
  },
];

const milestones = [
  { year: "Fondation", label: "Cabinet I2PA — Mohammedia, Maroc" },
  { year: "Expertise", label: "Brevets, marques, dessins & modèles, formation PI" },
  { year: "2025", label: "Lancement de l'espace client I2PA pour le suivi des dossiers" },
  { year: "Aujourd'hui", label: "Surveillance OMPIC, parcours PI guidé et rédaction assistée" },
];

export default function AboutPage() {
  return (
    <div>
      <PublicPageHero
        eyebrow="Cabinet I2PA"
        title="International Intellectual Property Assistance"
        description={`${i2paBrand.tagline} — cabinet reconnu pour l'accompagnement des innovateurs au Maroc et à l'international.`}
      />

      <section className="section-padding">
        <div className="container max-w-4xl">
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.organization.legalName} ({i2paBrand.name}) accompagne les porteurs de
            projets, PME et grands comptes dans la protection et la valorisation de leurs actifs
            intellectuels. Notre plateforme {siteConfig.productLabel} centralise documents,
            échéances, surveillance et collaboration avec votre conseil CPI — dans un environnement
            professionnel et sécurisé.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contact">Demander une consultation</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={i2paBrand.websiteUrl} target="_blank" rel="noopener noreferrer">
                Visiter i2pa.com
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background/80 section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Nos expertises</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Un cabinet complet en propriété intellectuelle
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
            {strengths.map((v) => (
              <div key={v.title} className="card-elevated flex gap-4 p-6 sm:p-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight">Domaines d&apos;intervention</h2>
              </div>
              <ul className="mt-6 space-y-3">
                {i2paServices.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pro-surface-muted">
              <p className="text-sm font-medium text-muted-foreground">Notre parcours</p>
              <div className="mt-4 space-y-4">
                {milestones.map((m) => (
                  <div key={m.label} className="flex gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-primary">
                      {m.year}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-6 sm:flex-row sm:items-center sm:p-8">
            <Award className="h-10 w-10 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Mohammedia — au cœur de votre stratégie PI</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {siteConfig.contact.address} · {siteConfig.contact.phone} · {siteConfig.contact.email}
              </p>
            </div>
            <Button variant="outline" asChild className="shrink-0">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
