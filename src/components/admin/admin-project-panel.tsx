"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  assignProjectMembers,
  type AdminAssignState,
} from "@/lib/actions/admin-projects";
import { ProjectStatusForm } from "@/components/dashboard/project-status-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProjectStatus } from "@/types/database";
import type { StatusChangeMode } from "@/lib/workflow/status-permissions";

type Assignee = { id: string; label: string };

export function AdminProjectPanel({
  projectId,
  currentStatus,
  statusOptions,
  cpiOptions,
  expertOptions,
  currentCpiId,
  currentExpertId,
}: {
  projectId: string;
  currentStatus: ProjectStatus;
  statusOptions: ProjectStatus[];
  cpiOptions: Assignee[];
  expertOptions: Assignee[];
  currentCpiId: string | null;
  currentExpertId: string | null;
}) {
  const router = useRouter();
  const [assignState, assignAction] = useFormState(assignProjectMembers, {} as AdminAssignState);

  useEffect(() => {
    if (assignState?.success) {
      toast.success(assignState.message ?? "Assignations mises à jour");
      router.refresh();
    }
    if (assignState?.error) toast.error(assignState.error);
  }, [assignState, router]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="card-elevated border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Statut</CardTitle>
          <CardDescription>Supervision — tous les statuts disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectStatusForm
            projectId={projectId}
            currentStatus={currentStatus}
            allowedStatuses={statusOptions}
            mode={"admin" as StatusChangeMode}
          />
        </CardContent>
      </Card>

      <Card className="card-elevated border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Assignations</CardTitle>
          <CardDescription>Conseiller PI et expert métier</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={assignAction} className="space-y-4">
            <input type="hidden" name="project_id" value={projectId} />
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Conseiller PI</Label>
              <select
                id="assigned_to"
                name="assigned_to"
                defaultValue={currentCpiId ?? ""}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Non assigné —</option>
                {cpiOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expert_id">Expert métier</Label>
              <select
                id="expert_id"
                name="expert_id"
                defaultValue={currentExpertId ?? ""}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Non assigné —</option>
                {expertOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Enregistrer les assignations</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
