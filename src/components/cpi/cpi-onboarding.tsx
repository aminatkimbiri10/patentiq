"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Eye, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "i2pa_cpi_onboarding_dismissed";

const STEPS = [
  {
    icon: Briefcase,
    title: "Ouvrir un dossier client",
    description: "Checklist, documents, parcours PI et analyses IA.",
    href: "/cpi/cases",
    cta: "Dossiers",
  },
  {
    icon: Eye,
    title: "Surveiller le portefeuille",
    description: "Scans OMPIC, alertes de similarité et veille techno.",
    href: "/cpi/surveillance",
    cta: "Surveillance",
  },
  {
    icon: FileText,
    title: "Valider & décider",
    description: "Statuts, commentaires juridiques, tâches porteur.",
    href: "/cpi/review",
    cta: "File de revue",
  },
] as const;

export function CpiOnboarding({
  activeCaseCount,
  className,
}: {
  activeCaseCount: number;
  className?: string;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (activeCaseCount > 2 || dismissed) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <section className={cn("enterprise-panel overflow-hidden", className)}>
      <div className="enterprise-panel-header bg-muted/30">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Espace CPI
          </p>
          <h2 className="text-sm font-semibold">Parcours en 3 étapes</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          onClick={dismiss}
          aria-label="Masquer le guide"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ol className="divide-y divide-border">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-4 px-5 py-3.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <step.icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{step.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" asChild>
                <Link href={step.href}>{step.cta} →</Link>
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
