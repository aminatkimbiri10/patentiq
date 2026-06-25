"use client";

import { QuickActionGrid, type QuickAction } from "@/components/dashboard/quick-action-grid";
import {
  Plus,
  FolderKanban,
  Eye,
  BookOpen,
  Brain,
  Upload,
  ListChecks,
  Briefcase,
  FileText,
  Columns3,
  Microscope,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";
import type { AppRole } from "@/types/roles";

const ACTIONS_BY_ROLE: Record<AppRole, readonly QuickAction[]> = {
  project_holder: [
    {
      href: "/dashboard/projects/new",
      icon: Plus,
      title: "Nouveau projet",
      description: "Brevet, marque ou dessin & modèle.",
      primary: true,
    },
    {
      href: "/dashboard/projects",
      icon: FolderKanban,
      title: "Mes projets",
      description: "Checklist, parcours PI et échanges.",
    },
    {
      href: "/dashboard/search",
      icon: Brain,
      title: "Recherche & IA",
      description: "Analyses antériorité et synthèses.",
    },
    {
      href: "/dashboard/documents",
      icon: Upload,
      title: "Documents",
      description: "Bibliothèque transversale.",
    },
    {
      href: "/dashboard/tasks",
      icon: ListChecks,
      title: "Tâches",
      description: "Suivi des actions assignées.",
    },
    {
      href: "/dashboard/surveillance",
      icon: Eye,
      title: "Surveillance",
      description: "Veille OMPIC post-dépôt.",
    },
    {
      href: "/dashboard/guide",
      icon: BookOpen,
      title: "Guide",
      description: "Prise en main de l'espace client.",
    },
  ],
  cpi_advisor: [
    {
      href: "/cpi/cases",
      icon: Briefcase,
      title: "Dossiers clients",
      description: "Checklist, parcours PI et échanges.",
      primary: true,
    },
    {
      href: "/cpi/review",
      icon: FileText,
      title: "File de revue",
      description: "Dossiers en attente de décision.",
    },
    {
      href: "/cpi/kanban",
      icon: Columns3,
      title: "Kanban",
      description: "Pipeline des statuts.",
    },
    {
      href: "/cpi/surveillance",
      icon: Eye,
      title: "Surveillance",
      description: "Watchlist OMPIC et veille.",
    },
    {
      href: "/cpi/reports",
      icon: FolderKanban,
      title: "Rapports",
      description: "Portefeuille et exports.",
    },
    {
      href: "/cpi/guide",
      icon: BookOpen,
      title: "Guide CPI",
      description: "Prise en main conseiller.",
    },
  ],
  expert: [
    {
      href: "/expert/analysis",
      icon: Microscope,
      title: "Analyses en attente",
      description: "Dossiers en revue expert.",
      primary: true,
    },
    {
      href: "/expert/assigned-projects",
      icon: FolderKanban,
      title: "Projets assignés",
      description: "Tous vos dossiers en cours.",
    },
    {
      href: "/expert/recommendations",
      icon: ClipboardList,
      title: "Recommandations",
      description: "Avis transmis au CPI.",
    },
    {
      href: "/dashboard/search",
      icon: Brain,
      title: "Recherche IA",
      description: "Analyses antériorité sur dossier.",
    },
    {
      href: "/expert/guide",
      icon: BookOpen,
      title: "Guide expert",
      description: "Bonnes pratiques d'avis.",
    },
  ],
  admin: [
    {
      href: "/admin/users",
      icon: Users,
      title: "Utilisateurs",
      description: "Rôles et comptes.",
      primary: true,
    },
    {
      href: "/admin/projects",
      icon: FolderKanban,
      title: "Projets",
      description: "Supervision et assignations.",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "Paramètres",
      description: "Workflow et assignation auto.",
    },
    {
      href: "/admin/audit-logs",
      icon: ClipboardList,
      title: "Audit",
      description: "Traçabilité complète.",
    },
  ],
};

export function RoleQuickActions({ role }: { role: AppRole }) {
  return <QuickActionGrid actions={ACTIONS_BY_ROLE[role]} />;
}
