"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateProjectStatus,
  type ProjectStatusActionState,
} from "@/lib/actions/projects";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import { statusModeLabel, type StatusChangeMode } from "@/lib/workflow/status-permissions";
import type { ProjectStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ProjectStatusForm({
  projectId,
  currentStatus,
  allowedStatuses,
  mode,
}: {
  projectId: string;
  currentStatus: ProjectStatus;
  allowedStatuses: ProjectStatus[];
  mode: StatusChangeMode;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateProjectStatus, {} as ProjectStatusActionState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Statut mis à jour");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  if (!allowedStatuses.length) return null;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="status_mode" value={mode} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="status">Statut du projet</Label>
          <p className="text-xs text-muted-foreground">{statusModeLabel(mode)}</p>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            className="flex h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
          >
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary" className="shrink-0">
          Mettre à jour
        </Button>
      </div>
    </form>
  );
}
