"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListChecks } from "lucide-react";
import {
  createTask,
  updateTaskStatus,
  type TaskActionState,
} from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/empty-state";

export type ProjectTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  project_id: string;
};

const statusLabel: Record<string, string> = {
  pending: "À faire",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

export function TaskList({
  projectId,
  tasks,
  readOnly = false,
}: {
  projectId: string;
  tasks: ProjectTask[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(createTask, {} as TaskActionState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Tâche ajoutée");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <div className="space-y-6">
      {!readOnly && (
        <form
          action={formAction}
          className="card-elevated flex flex-col gap-4 p-5 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="project_id" value={projectId} />
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor={`task-title-${projectId}`}>Nouvelle tâche</Label>
            <Input
              id={`task-title-${projectId}`}
              name="title"
              required
              placeholder="Ex. Compléter le descriptif technique"
            />
          </div>
          <Button type="submit" className="shrink-0">
            Ajouter
          </Button>
        </form>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Aucune tâche"
          description="Créez des actions pour structurer l'avancement du dossier."
          className="py-12"
        />
      ) : (
        <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/20"
            >
              {readOnly ? (
                <span
                  className={`h-4 w-4 shrink-0 rounded-sm border ${
                    task.status === "completed"
                      ? "border-primary bg-primary"
                      : "border-input"
                  }`}
                />
              ) : (
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={(checked) => {
                    updateTaskStatus(task.id, projectId, checked ? "completed" : "pending")
                      .then(() => {
                        toast.success("Tâche mise à jour");
                        router.refresh();
                      })
                      .catch((e) =>
                        toast.error(e instanceof Error ? e.message : "Erreur")
                      );
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    task.status === "completed"
                      ? "line-through text-muted-foreground"
                      : "font-medium"
                  }
                >
                  {task.title}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {statusLabel[task.status] ?? task.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
