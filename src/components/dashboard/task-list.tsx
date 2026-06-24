"use client";



import { useEffect } from "react";

import { useFormState } from "react-dom";

import { useRouter } from "next/navigation";

import { format, isPast, isToday } from "date-fns";

import { fr } from "date-fns/locale";

import { toast } from "sonner";

import { Calendar, ListChecks } from "lucide-react";

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

import { cn } from "@/lib/utils/cn";



export type ProjectTask = {

  id: string;

  title: string;

  description: string | null;

  status: string;

  priority: string;

  due_at: string | null;

  project_id: string;

  created_by?: string;

  assigned_to?: string | null;

};



const statusLabel: Record<string, string> = {

  pending: "À faire",

  in_progress: "En cours",

  completed: "Terminé",

  cancelled: "Annulé",

};



function formatDueDate(dueAt: string) {

  const date = new Date(dueAt);

  if (isToday(date)) return `Aujourd'hui`;

  return format(date, "d MMM yyyy", { locale: fr });

}



function isCpiAssignedTask(task: ProjectTask) {

  return (

    !!task.created_by &&

    !!task.assigned_to &&

    task.created_by !== task.assigned_to

  );

}



export function TaskList({

  projectId,

  tasks,

  readOnly = false,

  canCreate,

}: {

  projectId: string;

  tasks: ProjectTask[];

  readOnly?: boolean;

  canCreate?: boolean;

}) {

  const showCreateForm = (canCreate ?? !readOnly) && !readOnly;

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

      {showCreateForm && (

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

          description={

            showCreateForm

              ? "Créez des actions pour structurer l'avancement du dossier."

              : "Votre conseiller PI vous assignera les actions à réaliser sur ce dossier."

          }

          className="py-12"

        />

      ) : (

        <ul className="card-elevated divide-y divide-border/60 overflow-hidden">

          {tasks.map((task) => {

            const cpiAssigned = isCpiAssignedTask(task);

            const overdue =

              task.due_at &&

              task.status !== "completed" &&

              isPast(new Date(task.due_at)) &&

              !isToday(new Date(task.due_at));



            return (

              <li

                key={task.id}

                className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-start sm:gap-3"

              >

                <div className="flex min-w-0 flex-1 items-start gap-3">

                {readOnly ? (

                  <span

                    className={cn(

                      "mt-1 h-4 w-4 shrink-0 rounded-sm border",

                      task.status === "completed"

                        ? "border-primary bg-primary"

                        : "border-input"

                    )}

                  />

                ) : (

                  <Checkbox

                    className="mt-1"

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

                <div className="min-w-0 flex-1 space-y-1.5">

                  <div className="flex flex-wrap items-center gap-2">

                    <p

                      className={cn(

                        "text-sm font-medium",

                        task.status === "completed" && "line-through text-muted-foreground"

                      )}

                    >

                      {task.title}

                    </p>

                    {cpiAssigned && (

                      <Badge variant="secondary" className="text-[10px]">

                        Assignée par le CPI

                      </Badge>

                    )}

                    {overdue && (

                      <Badge variant="destructive" className="text-[10px]">

                        En retard

                      </Badge>

                    )}

                  </div>

                  {task.description && (

                    <p className="text-xs leading-relaxed text-muted-foreground">

                      {task.description}

                    </p>

                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

                    {task.due_at && (

                      <span className="inline-flex items-center gap-1">

                        <Calendar className="h-3 w-3" />

                        Échéance : {formatDueDate(task.due_at)}

                      </span>

                    )}

                  </div>

                </div>

                </div>

                <Badge variant="outline" className="w-fit shrink-0 sm:mt-0.5">
                  {statusLabel[task.status] ?? task.status}
                </Badge>
              </li>

            );

          })}

        </ul>

      )}

    </div>

  );

}


