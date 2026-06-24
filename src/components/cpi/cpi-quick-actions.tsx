"use client";

import { QuickActionGrid } from "@/components/dashboard/quick-action-grid";
import { Briefcase, Eye, FolderKanban, BookOpen } from "lucide-react";

const ACTIONS = [
  {
    href: "/cpi/cases",
    icon: Briefcase,
    title: "Dossiers clients",
    description: "Tout le travail CPI : checklist, parcours PI, échanges.",
    primary: true,
  },
  {
    href: "/cpi/surveillance",
    icon: Eye,
    title: "Surveillance",
    description: "Watchlist OMPIC et veille technologique.",
    primary: false,
  },
  {
    href: "/cpi/kanban",
    icon: FolderKanban,
    title: "Kanban",
    description: "Vue pipeline des statuts dossiers.",
    primary: false,
  },
  {
    href: "/cpi/guide",
    icon: BookOpen,
    title: "Guide",
    description: "3 zones à retenir — le reste est dans les dossiers.",
    primary: false,
  },
] as const;

export function CpiQuickActions() {
  return <QuickActionGrid actions={ACTIONS} />;
}
