"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  FileText,
  ListChecks,
  Route,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PiParcoursTab } from "@/components/surveillance/pi-parcours/types";

export const PI_PARCOURS_TAB_META: Record<
  PiParcoursTab,
  { label: string; shortLabel: string; description: string; icon: LucideIcon }
> = {
  cycle: {
    label: "Cycle OMPIC",
    shortLabel: "Cycle",
    description: "Étapes légales, délais et surveillance post-enregistrement.",
    icon: Route,
  },
  redaction: {
    label: "Rédaction",
    shortLabel: "Rédaction",
    description: "Mémoire descriptif, sections OMPIC et relecture assistée.",
    icon: FileText,
  },
  revendications: {
    label: "Revendications",
    shortLabel: "Revend.",
    description: "Ébauche des revendications et table de concordance.",
    icon: ListChecks,
  },
  denomination: {
    label: "Dénomination",
    shortLabel: "Nom",
    description: "Choix du nom de marque et vérifications préalables.",
    icon: Tag,
  },
  irregularite: {
    label: "Irrégularité OMPIC",
    shortLabel: "Irrég.",
    description: "Notifications officielles et réponses au registre.",
    icon: AlertCircle,
  },
};

export function PiParcoursTabNav({
  tabs,
  active,
  onSelect,
}: {
  tabs: PiParcoursTab[];
  active: PiParcoursTab;
  onSelect: (tab: PiParcoursTab) => void;
}) {
  if (tabs.length <= 1) return null;

  return (
    <nav
      className="enterprise-panel w-full overflow-hidden lg:w-52 lg:shrink-0"
      aria-label="Sections du parcours PI"
    >
      <ul className="flex min-w-0 gap-1 overflow-x-auto overscroll-x-contain p-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-2">
        {tabs.map((id) => {
          const meta = PI_PARCOURS_TAB_META[id];
          const Icon = meta.icon;
          const isActive = active === id;
          return (
            <li key={id} className="shrink-0 lg:shrink lg:w-full">
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors lg:w-full lg:items-start lg:gap-3 lg:py-2.5",
                  isActive
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <span className="min-w-0 whitespace-nowrap lg:whitespace-normal">
                  <span className="block text-sm font-medium sm:hidden">{meta.shortLabel}</span>
                  <span className="hidden text-sm font-medium sm:block">{meta.label}</span>
                  <span className="mt-0.5 hidden text-[11px] leading-snug text-muted-foreground lg:block">
                    {meta.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PiParcoursActiveHint({ tab }: { tab: PiParcoursTab }) {
  const meta = PI_PARCOURS_TAB_META[tab];
  return (
    <p className="mb-4 text-sm text-muted-foreground lg:hidden">{meta.description}</p>
  );
}
