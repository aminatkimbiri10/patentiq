"use client";

import { FolderOpen, Sparkles, Users, Map } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { id: "dossier", icon: FolderOpen, label: "Dossier", hint: "Docs & checklist" },
  { id: "search", icon: Sparkles, label: "IA", hint: "Antériorité" },
  { id: "echanges", icon: Users, label: "Échanges", hint: "CPI & tâches" },
] as const;

export function ProjectJourneyHint({
  activeTab,
  hasPiParcours,
  className,
}: {
  activeTab: string;
  hasPiParcours?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm",
        className
      )}
    >
      <p className="mb-3 flex items-center gap-2 font-medium text-foreground">
        <Map className="h-4 w-4 text-primary" />
        Votre parcours dans ce dossier
      </p>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <span
            key={s.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              activeTab === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground"
            )}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
            <span className="hidden opacity-80 sm:inline">— {s.hint}</span>
          </span>
        ))}
        {hasPiParcours && (
          <span className="inline-flex items-center rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">
            Dossier → <strong className="mx-1">Parcours PI</strong> après checklist
          </span>
        )}
      </div>
    </div>
  );
}
