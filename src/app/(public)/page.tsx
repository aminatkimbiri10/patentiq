import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  FileText,
  ListChecks,
  Users,
  Briefcase,
  Workflow,
  UserPlus,
  FolderPlus,
  Handshake,
  Search,
  Brain,
  HardDrive,
  Bell,
  Shield,
  Lock,
  KeyRound,
  Database,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const benefits = [
  {
    icon: FolderKanban,
    title: "Gérer ses projets",
    desc: "Centralisez chaque dossier PI avec statuts, références et suivi en temps réel.",
  },
  {
    icon: FileText,
    title: "Centraliser les documents",
    desc: "Tous vos fichiers techniques, descriptifs et annexes au même endroit.",
  },
  {
    icon: ListChecks,
    title: "Suivre les étapes",
    desc: "Visualisez l'avancement de la recherche au dépôt, étape par étape.",
  },
  {
    icon: Users,
    title: "Collaborer avec des experts",
    desc: "Invitez CPI, experts métier et partenaires sur un fil de travail unique.",
  },
  {
    icon: Briefcase,
    title: "Préparer les dossiers",
    desc: "Structurez invention, besoins et pièces avant le dépôt officiel.",
  },
  {
    icon: Workflow,
    title: "Simplifier le workflow",
    desc: "Automatisez tâches, notifications et revues sans perdre le contrôle.",
  },
];

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Créer un compte",
    desc: "Inscription en 30 secondes — email ou connexion Google / GitHub.",
  },
  {
    step: "02",
    icon: FolderPlus,
    title: "Créer un projet",
    desc: "Décrivez votre invention, uploadez vos documents et définissez vos objectifs PI.",
  },
  {
    step: "03",
    icon: Handshake,
    title: "Collaborer et suivre",
    desc: "Échangez avec votre CPI, lancez des analyses et pilotez chaque étape jusqu'au dépôt.",
  },
];

const features = [
  {
    icon: FolderKanban,
    title: "Gestion de projet",
    desc: "Tableaux de bord, statuts, timeline et fiches projet complètes.",
  },
  {
    icon: Brain,
    title: "Recherche & analyse assistée",
    desc: "Module IA prêt pour recherche de nouveauté et synthèses documentaires.",
  },
  {
    icon: HardDrive,
    title: "Stockage sécurisé",
    desc: "Fichiers privés par projet via Supabase Storage, URLs signées.",
  },
  {
    icon: ListChecks,
    title: "Suivi des tâches",
    desc: "Actions, échéances et checklist pour ne rien oublier.",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Alertes en temps réel sur commentaires, documents et changements de statut.",
  },
];

const trustItems = [
  { icon: Shield, title: "Données sécurisées", desc: "PostgreSQL avec Row Level Security (RLS) par projet et par rôle." },
  { icon: KeyRound, title: "Auth Supabase", desc: "Authentification robuste, OAuth Google/GitHub et gestion des sessions." },
  { icon: Lock, title: "Stockage privé", desc: "Buckets dédiés, accès restreint — aucun fichier public par défaut." },
  { icon: Database, title: "Accès par rôle", desc: "Porteur, CPI, expert et admin — chacun voit uniquement ce qui le concerne." },
];

export default function LandingPage() {
  return (
    <div className="bg-mesh">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-glow absolute inset-0" />
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="container relative section-padding pb-20 lg:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-fade-in text-center lg:text-left">
              <p className="section-eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Plateforme PI nouvelle génération
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-[3.5rem]">
                Protégez vos innovations.{" "}
                <span className="text-gradient">Sans complexité.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
                {siteConfig.name} accompagne porteurs de projets, cabinets PI et experts
                — de l&apos;idée au dépôt, avec documents, collaboration et IA intégrés.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" className="h-12 w-full px-8 shadow-glow sm:w-auto" asChild>
                  <Link href="/auth/register">
                    Commencer gratuitement
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-primary/30 bg-background/70 px-8 hover:bg-primary/5 sm:w-auto"
                  asChild
                >
                  <Link href="/contact">Demander une démo</Link>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                {["Gratuit pour démarrer", "Sans carte bancaire", "Hébergement EU"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard preview */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none animate-fade-in">
              <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
              <div className="card-elevated relative overflow-hidden border-primary/10 p-1">
                <div className="rounded-[1.1rem] bg-gradient-to-br from-primary/5 to-transparent p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Projet actif</p>
                        <p className="font-semibold">Système de filtration innovant</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        En revue
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Documents", val: "12" },
                        { label: "Tâches", val: "5" },
                        { label: "Analyses IA", val: "3" },
                      ].map((k) => (
                        <div key={k.label} className="rounded-xl bg-card p-3 text-center shadow-sm">
                          <p className="text-lg font-bold text-primary">{k.val}</p>
                          <p className="text-[10px] text-muted-foreground">{k.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-3/4 rounded-full bg-muted" />
                          <div className="h-2 w-1/2 rounded-full bg-muted/70" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border/60 bg-background/60 section-padding">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Bénéfices</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Tout ce dont vous avez besoin pour{" "}
              <span className="text-gradient">réussir vos dossiers PI</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Une plateforme pensée pour les innovateurs et les professionnels de la propriété intellectuelle.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="card-elevated group p-6">
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="section-padding scroll-mt-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Comment ça marche</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Opérationnel en <span className="text-gradient">3 étapes</span>
            </h2>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute top-10 hidden h-px w-full bg-gradient-to-r from-primary/40 to-transparent md:block md:left-[60%] md:w-[80%]" />
                )}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/30">
                  {s.step}
                </div>
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key features */}
      <section id="fonctionnalites" className="border-t border-border/60 bg-background/60 section-padding scroll-mt-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-eyebrow">Fonctionnalités</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Des outils <span className="text-gradient">clés et puissants</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 sm:col-span-2 lg:col-span-1">
              <div className="text-center">
                <Search className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-sm font-medium">Et bien plus à venir…</p>
                <Button variant="link" className="mt-1" asChild>
                  <Link href="/pricing">Voir les offres</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Security */}
      <section id="securite" className="section-padding scroll-mt-20">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="section-eyebrow">Confiance & sécurité</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Vos données PI méritent une{" "}
                <span className="text-gradient">protection maximale</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Architecture conçue pour les exigences des cabinets et des startups :
                authentification enterprise, isolation des données et traçabilité complète.
              </p>
              <Button className="mt-8" variant="outline" asChild>
                <Link href="/about">En savoir plus</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trustItems.map((t) => (
                <div key={t.title} className="card-elevated p-5">
                  <t.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding pt-0">
        <div className="container">
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-20"
            style={{
              background: `linear-gradient(135deg, ${siteConfig.brand.blue} 0%, hsl(210, 90%, 28%) 100%)`,
            }}
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Prêt à structurer vos dossiers PI ?
              </h2>
              <p className="mt-4 text-primary-foreground/85 text-base sm:text-lg">
                Rejoignez {siteConfig.name} et accélérez votre parcours de l&apos;idée au dépôt.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 w-full bg-white px-8 text-[#0A66C2] hover:bg-white/90 sm:w-auto"
                  asChild
                >
                  <Link href="/auth/register">Commencer gratuitement</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-white/40 bg-transparent px-8 text-white hover:bg-white/10 sm:w-auto"
                  asChild
                >
                  <Link href="/contact">Demander une démo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
