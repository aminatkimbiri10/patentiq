"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FolderKanban,
  Eye,
  Sparkles,
  Users,
  FileText,
  Shield,
  Settings,
  FlaskConical,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import type { AppRole } from "@/types/roles";

type GuideStep = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  href: string;
  cta: string;
};

const HOLDER_STEPS: GuideStep[] = [
  {
    icon: FolderKanban,
    title: "1. Ouvrir un projet",
    text: "Mes projets regroupe vos dossiers — statut, complétude et prochaine étape en un coup d'œil.",
    href: "/dashboard/projects",
    cta: "Mes projets",
  },
  {
    icon: FileText,
    title: "2. Documents & parcours PI",
    text: "Onglets Documents et Parcours PI : checklist, cycle marque/brevet, rédaction et export ZIP.",
    href: "/dashboard/projects",
    cta: "Ouvrir un dossier",
  },
  {
    icon: Sparkles,
    title: "3. Analyses IA",
    text: "Nouveauté, similarité ou résumé — depuis l'onglet Analyses IA du dossier.",
    href: "/dashboard/projects",
    cta: "Lancer une analyse",
  },
  {
    icon: Eye,
    title: "4. Surveiller après dépôt",
    text: "Alertes OMPIC et veille continue une fois votre marque ou brevet enregistré.",
    href: "/dashboard/surveillance",
    cta: "Surveillance",
  },
];

const CPI_STEPS: GuideStep[] = [
  {
    icon: FolderKanban,
    title: "1. Dossiers clients",
    text: "Liste des dossiers assignés — revue, statuts et complétude porteur.",
    href: "/cpi/cases",
    cta: "Dossiers",
  },
  {
    icon: Eye,
    title: "2. Surveillance OMPIC",
    text: "Watchlist, scan similarités et veille technologique.",
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

const EXPERT_STEPS: GuideStep[] = [
  {
    icon: FolderKanban,
    title: "1. Projets assignés",
    text: "Liste des missions où vous êtes expert technique — ouvrez le dossier pour analyser.",
    href: "/expert/assigned-projects",
    cta: "Missions",
  },
  {
    icon: FlaskConical,
    title: "2. Analyser le dossier",
    text: "Documents, invention, notes techniques et recommandation structurée au CPI.",
    href: "/expert/assigned-projects",
    cta: "Ouvrir une mission",
  },
  {
    icon: Sparkles,
    title: "3. Recommandations",
    text: "Publiez votre avis technique — faisabilité, risques et recommandations.",
    href: "/expert/recommendations",
    cta: "Mes recommandations",
  },
  {
    icon: Eye,
    title: "4. Analyses en cours",
    text: "Suivi des dossiers en attente de votre retour.",
    href: "/expert/analysis",
    cta: "Analyses",
  },
];

const ADMIN_STEPS: GuideStep[] = [
  {
    icon: Users,
    title: "1. Utilisateurs & rôles",
    text: "Gérez les comptes porteurs, CPI, experts et assignations de rôle.",
    href: "/admin/users",
    cta: "Utilisateurs",
  },
  {
    icon: FolderKanban,
    title: "2. Tous les projets",
    text: "Vue globale des dossiers — statuts, propriétaires et activité.",
    href: "/admin/projects",
    cta: "Projets",
  },
  {
    icon: Settings,
    title: "3. Paramètres workflow",
    text: "Assignation CPI automatique et règles de soumission.",
    href: "/admin/settings",
    cta: "Paramètres",
  },
  {
    icon: Shield,
    title: "4. Audit & traçabilité",
    text: "Journal des actions sensibles sur la plateforme.",
    href: "/admin/audit-logs",
    cta: "Journal audit",
  },
];

function getGuideConfig(role?: AppRole | null) {
  switch (role) {
    case "cpi_advisor":
      return {
        title: "Utiliser l'espace CPI",
        description:
          "Trois zones : Accueil, Dossiers clients et Surveillance. Le détail se fait dans chaque dossier.",
        workspace: "un dossier client",
        steps: CPI_STEPS,
        showHolderTips: false,
      };
    case "expert":
      return {
        title: "Utiliser l'espace Expert",
        description:
          "Missions assignées, analyse technique et recommandations structurées au CPI.",
        workspace: "une mission assignée",
        steps: EXPERT_STEPS,
        showHolderTips: false,
      };
    case "admin":
      return {
        title: "Administration I2PA",
        description: "Gestion des utilisateurs, projets, workflow et audit de la plateforme.",
        workspace: "le panneau admin",
        steps: ADMIN_STEPS,
        showHolderTips: false,
      };
    default:
      return {
        title: `Utiliser ${siteConfig.productLabel}`,
        description:
          "Un projet = un dossier. Cinq onglets : Vue d'ensemble, Documents, Parcours PI, Échanges, Analyses IA.",
        workspace: "Mes projets → votre dossier",
        steps: HOLDER_STEPS,
        showHolderTips: true,
      };
  }
}

export function PlatformGuide({ role }: { role?: AppRole | null }) {
  const config = getGuideConfig(role);

  return (
    <div className="dash-page mx-auto w-full min-w-0 max-w-3xl space-y-6">
      <PageHeader
        icon={BookOpen}
        eyebrow="Guide"
        title={config.title}
        description={config.description}
      />

      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 text-sm">
        <p className="font-semibold text-foreground">Règle simple</p>
        <p className="mt-1.5 leading-relaxed text-muted-foreground">
          <strong className="text-foreground">90 % du travail</strong> se fait dans{" "}
          <strong className="text-foreground">{config.workspace}</strong>. Le menu latéral reste
          volontairement court pour éviter la dispersion.
        </p>
      </div>

      <ol className="space-y-3">
        {config.steps.map((step) => (
          <li
            key={step.title}
            className="card-elevated flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
              <Link href={step.href}>
                {step.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </li>
        ))}
      </ol>

      {config.showHolderTips && (
        <div className="pro-surface-muted text-sm">
          <p className="font-semibold text-foreground">Où trouver quoi ?</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Parcours PI</strong> — cycle marque/brevet,
              rédaction, revendications
            </li>
            <li>
              <strong className="text-foreground">Échanges</strong> — messages et tâches avec votre
              conseil CPI
            </li>
            <li>
              <strong className="text-foreground">Préparer dépôt OMPIC</strong> — checklists + lien
              directompic.ma
            </li>
            <li>
              <strong className="text-foreground">Sécurité 2FA</strong> — Paramètres sécurité
              (Google Authenticator)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
