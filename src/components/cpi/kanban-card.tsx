"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import {
  updateProjectStatus,
  type ProjectStatusActionState,
} from "@/lib/actions/projects";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import { getGuidedCpiStatusOptions } from "@/lib/workflow/status-transitions";
import type { Project, ProjectStatus } from "@/types/database";

export function KanbanCard({
  project,
  stale,
}: {
  project: Project;
  stale?: boolean;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateProjectStatus, {} as ProjectStatusActionState);
  const moveOptions = getGuidedCpiStatusOptions(project.status).filter(
    (s) => s !== project.status
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Statut mis à jour");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <article className="rounded-lg border border-border/80 bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {project.reference_code ?? project.id.slice(0, 8)}
          </p>
          <Link
            href={`/cpi/cases/${project.id}`}
            className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
          >
            {project.title}
          </Link>
        </div>
        <Link
          href={`/cpi/cases/${project.id}`}
          className="shrink-0 text-muted-foreground hover:text-primary"
          aria-label="Ouvrir le dossier"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        {new Date(project.last_activity_at).toLocaleDateString("fr-FR")}
        {stale && (
          <span className="ml-2 inline-flex items-center gap-0.5 text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            &gt;7j
          </span>
        )}
      </p>

      {moveOptions.length > 0 && (
        <form action={formAction} className="mt-3 flex gap-1.5">
          <input type="hidden" name="project_id" value={project.id} />
          <input type="hidden" name="status_mode" value="cpi" />
          <select
            name="status"
            defaultValue=""
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
            onChange={(e) => {
              if (e.target.value) e.currentTarget.form?.requestSubmit();
            }}
          >
            <option value="" disabled>
              Déplacer…
            </option>
            {moveOptions.map((s: ProjectStatus) => (
              <option key={s} value={s}>
                → {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </form>
      )}
    </article>
  );
}
