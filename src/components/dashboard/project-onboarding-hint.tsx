"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, Sparkles, ClipboardCheck, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function storageKey(projectId: string) {
  return `patentiq_project_hint_${projectId}`;
}

export function ProjectOnboardingHint({
  projectId,
  documentCount,
  checklistPercent,
  className,
}: {
  projectId: string;
  documentCount: number;
  checklistPercent: number;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey(projectId)) === "1");
  }, [projectId]);

  const showGuide =
    documentCount === 0 || (documentCount > 0 && checklistPercent < 30);

  if (!showGuide || dismissed) return null;

  const steps = [
    {
      icon: Upload,
      label: "Déposer vos documents",
      hint: "Descriptif, dessins, notes — onglet Dossier.",
      href: `?tab=dossier&section=documents`,
    },
    {
      icon: ClipboardCheck,
      label: "Compléter la checklist",
      hint: "Suivez les étapes PI adaptées à votre catégorie.",
      href: `?tab=dossier&section=checklist`,
    },
    {
      icon: Sparkles,
      label: "Lancer une analyse IA",
      hint: "Antériorité ou nouveauté — onglet IA.",
      href: `?tab=ia&section=nouvelle`,
    },
  ];

  function dismiss() {
    localStorage.setItem(storageKey(projectId), "1");
    setDismissed(true);
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Prochaines actions
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {documentCount === 0
              ? "Commencez par déposer au moins un document dans ce dossier."
              : "Poursuivez la checklist et l'analyse d'antériorité."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={dismiss}
          aria-label="Masquer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={`/dashboard/projects/${projectId}${s.href}`}
              className="flex h-full flex-col rounded-lg border border-border/60 bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <s.icon className="h-4 w-4 text-primary" />
              <span className="mt-2 text-sm font-medium">{s.label}</span>
              <span className="mt-1 flex-1 text-xs text-muted-foreground">{s.hint}</span>
              <span className="mt-2 inline-flex items-center text-xs text-primary">
                Ouvrir
                <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
