"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FolderKanban, Eye, Sparkles, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppRole } from "@/types/roles";

const HOLDER_STEPS = [
  {
    icon: FolderKanban,
    title: "1. Ouvrir un projet",
    text: "Tout se passe dans Mes projets : documents, checklist, parcours PI et IA.",
    href: "/dashboard/projects",
    cta: "Mes projets",
  },
  {
    icon: Sparkles,
    title: "2. Préparer le dossier",
    text: "Onglet Dossier → documents + checklist + Parcours PI. Export ZIP pour le CPI.",
    href: "/dashboard/projects",
    cta: "Commencer",
  },
  {
    icon: FileText,
    title: "3. Avant directompic.ma",
    text: "Checklists marque/brevet et lien portail OMPIC officiel.",
    href: "/dashboard/preparer-depot-ompic",
    cta: "Préparer dépôt",
  },
  {
    icon: Eye,
    title: "4. Surveiller (après dépôt)",
    text: "Page Surveillance : alertes marques/brevets similaires (OMPIC live ou hybrid).",
    href: "/dashboard/surveillance",
    cta: "Surveillance",
  },
];

const CPI_STEPS = [
  {
    icon: FolderKanban,
    title: "1. Dossiers clients",
    text: "Liste des dossiers assignés — revue, statuts, checklist porteur.",
    href: "/cpi/cases",
    cta: "Dossiers",
  },
  {
    icon: Eye,
    title: "2. Surveillance OMPIC",
    text: "Watchlist + scan similarités + veille technologique hebdo.",
    href: "/cpi/surveillance",
    cta: "Surveillance",
  },
  {
    icon: FileText,
    title: "3. Préparer dépôt OMPIC",
    text: "Checklists client + lien directompic.ma avant le dépôt officiel.",
    href: "/cpi/preparer-depot-ompic",
    cta: "Préparer dépôt",
  },
  {
    icon: Users,
    title: "4. Parcours PI dans le dossier",
    text: "Cycle marque/brevet, rédaction, revendications et export ZIP.",
    href: "/cpi/cases",
    cta: "Ouvrir un dossier",
  },
];

export function PlatformGuide({ role }: { role?: AppRole | null }) {
  const isCpi = role === "cpi_advisor";
  const steps = isCpi ? CPI_STEPS : HOLDER_STEPS;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Guide</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isCpi ? "Comment utiliser PatentIQ (CPI)" : "Comment utiliser PatentIQ"}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {isCpi
            ? "Trois zones suffisent : Accueil, Dossiers et Surveillance. Le reste est dans chaque dossier."
            : "Ne vous perdez pas dans les menus : un projet = un dossier. Le menu latéral est volontairement court."}
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-medium">Règle simple</p>
        <p className="mt-1 text-muted-foreground">
          <strong>90 % du travail</strong> se fait dans{" "}
          <strong>{isCpi ? "un dossier client" : "Mes projets → votre dossier"}</strong>, via 3
          onglets : <strong>Dossier</strong>, <strong>Échanges</strong>, <strong>IA</strong>.
        </p>
      </div>

      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.title}>
            <Card className="card-elevated border-0">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
                  <Link href={step.href}>
                    {step.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      {!isCpi && (
        <Card className="border-dashed">
          <CardContent className="p-5 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Où trouver quoi ?</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Parcours PI</strong> (dans le dossier) : cycle marque/brevet, rédaction,
                revendications
              </li>
              <li>
                <strong>Messages</strong> : fil avec votre CPI (pas besoin d&apos;une page par
                projet)
              </li>
              <li>
                <strong>Préparer dépôt OMPIC</strong> — checklists + lien directompic.ma
              </li>
              <li>
                <strong>Export ZIP</strong> — livrable CPI (Parcours PI brevet/marque)
              </li>
              <li>
                <strong>Notifications</strong> : cloche en haut à droite
              </li>
              <li>
                <strong>Sécurité 2FA</strong> : Profil → Paramètres sécurité
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
