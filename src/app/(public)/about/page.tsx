import {
  Target,
  Users,
  Shield,
  Sparkles,
  Globe,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";

const values = [
  {
    icon: Target,
    title: "Mission claire",
    desc: "Accélérer le parcours PI des innovateurs, du premier croquis au dépôt.",
  },
  {
    icon: Users,
    title: "Collaboration native",
    desc: "Porteurs, conseillers CPI et experts sur un même fil de travail.",
  },
  {
    icon: Shield,
    title: "Confiance & conformité",
    desc: "Données hébergées en UE, RLS Supabase et traçabilité complète.",
  },
  {
    icon: Sparkles,
    title: "IA responsable",
    desc: "Architecture prête pour recherche de nouveauté et analyses documentaires.",
  },
];

const milestones = [
  { year: "2024", label: "Conception produit & architecture Supabase" },
  { year: "2025", label: "MVP plateforme multi-rôles & workflows CPI" },
  { year: "2026", label: "Intégration moteurs IA brevets & expansion EU" },
];

export default function AboutPage() {
  return (
    <div className="bg-mesh">
      <section className="section-padding">
        <div className="container max-w-4xl">
          <PageHeader
            eyebrow="À propos"
            title={`${siteConfig.name}, la PI réinventée`}
            description="Une plateforme SaaS conçue pour les porteurs de projets, cabinets PI et experts métier."
            className="border-0 pb-0 text-center sm:text-left"
          />
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.description} Nous centralisons documents, workflows,
            collaboration et analyses IA dans un environnement sécurisé — pour que
            chaque innovation trouve sa protection au bon moment.
          </p>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background/50 section-padding">
        <div className="container">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Nos <span className="text-gradient">valeurs</span>
          </h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="card-elevated flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Notre vision</h2>
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Devenir la référence européenne de l&apos;assistance PI pour les
            startups et PME — en combinant expertise humaine et intelligence
            artificielle, sans compromis sur la sécurité des données.
          </p>

          <div className="mt-10 space-y-4">
            {milestones.map((m) => (
              <div
                key={m.year}
                className="flex gap-4 rounded-xl border border-border/60 bg-card/60 px-5 py-4"
              >
                <span className="shrink-0 text-sm font-bold text-primary">
                  {m.year}
                </span>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <Award className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Conçu pour l&apos;innovation européenne</p>
              <p className="mt-1 text-sm text-muted-foreground">
                RGPD, hébergement EU et workflows adaptés aux pratiques CPI françaises
                et internationales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
