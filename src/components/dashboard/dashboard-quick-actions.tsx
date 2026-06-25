"use client";

import { QuickActionGrid } from "@/components/dashboard/quick-action-grid";
import { FolderKanban, Eye, Plus, BookOpen } from "lucide-react";

const ACTIONS = [
  {
    href: "/dashboard/projects",
    icon: FolderKanban,
    title: "Mes projets",
    description: "Documents, checklist, parcours PI et IA — tout est ici.",
    primary: true,
  },
  {
    href: "/dashboard/projects/new",
    icon: Plus,
    title: "Nouveau projet",
    description: "Démarrer un brevet, une marque ou un dessin.",
    primary: false,
  },
  {
    href: "/dashboard/surveillance",
    icon: Eye,
    title: "Surveillance",
    description: "Alertes après enregistrement (similarités OMPIC).",
    primary: false,
  },
  {
    href: "/dashboard/guide",
    icon: BookOpen,
    title: "Guide",
    description: "3 étapes pour ne plus vous perdre.",
    primary: false,
  },
] as const;

export function DashboardQuickActions() {
  return <QuickActionGrid title="Actions rapides" actions={ACTIONS} />;
}
