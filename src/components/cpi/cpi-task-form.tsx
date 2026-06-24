"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCpiTask, type TaskActionState } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CpiTaskForm({
  projectId,
  holderId,
  holderName,
}: {
  projectId: string;
  holderId: string;
  holderName: string;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(createCpiTask, {} as TaskActionState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Tâche assignée au porteur");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="card-elevated space-y-4 p-5">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="assigned_to" value={holderId} />
      <div>
        <p className="text-sm font-medium">Assigner une tâche au porteur</p>
        <p className="text-xs text-muted-foreground">
          Destinataire : {holderName}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`cpi-task-${projectId}`}>Intitulé *</Label>
        <Input
          id={`cpi-task-${projectId}`}
          name="title"
          required
          placeholder="Ex. Fournir les dessins techniques avant vendredi"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`cpi-task-desc-${projectId}`}>Instructions</Label>
        <Textarea
          id={`cpi-task-desc-${projectId}`}
          name="description"
          rows={2}
          placeholder="Détail des pièces attendues…"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`cpi-task-due-${projectId}`}>Échéance</Label>
        <Input id={`cpi-task-due-${projectId}`} name="due_at" type="date" />
      </div>
      <Button type="submit">Assigner la tâche</Button>
    </form>
  );
}
