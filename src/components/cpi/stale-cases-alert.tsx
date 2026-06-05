import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/database";
import { PROJECT_STATUS_LABELS } from "@/config/constants";

export function StaleCasesAlert({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;

  return (
    <div className="card-elevated flex flex-col gap-3 border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            {projects.length} dossier{projects.length > 1 ? "s" : ""} sans activité depuis 7+ jours
          </p>
          <ul className="mt-1 text-sm text-muted-foreground">
            {projects.slice(0, 3).map((p) => (
              <li key={p.id}>
                {p.reference_code ?? p.title.slice(0, 30)} —{" "}
                {PROJECT_STATUS_LABELS[p.status]}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button variant="outline" size="sm" asChild className="shrink-0">
        <Link href="/cpi/cases">Voir les dossiers</Link>
      </Button>
    </div>
  );
}
