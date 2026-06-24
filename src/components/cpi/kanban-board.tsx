"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KanbanCard } from "@/components/cpi/kanban-card";
import { cpiKanbanMove } from "@/lib/actions/kanban";
import { isStaleCase, type KanbanColumn } from "@/lib/cpi/kanban";
import { isCpiStatusTransitionAllowed } from "@/lib/workflow/status-transitions";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import type { Project, ProjectStatus } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const DRAG_TYPE = "application/x-patentiq-project";

export function CpiKanbanBoard({ columns }: { columns: KanbanColumn[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragOverStatus, setDragOverStatus] = useState<ProjectStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const nonEmpty = columns.filter((c) => c.projects.length > 0);
  const display = nonEmpty.length ? nonEmpty : columns;

  function handleDragStart(e: React.DragEvent, project: Project) {
    e.dataTransfer.setData(
      DRAG_TYPE,
      JSON.stringify({ projectId: project.id, status: project.status })
    );
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(project.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverStatus(null);
  }

  function handleDragOver(e: React.DragEvent, targetStatus: ProjectStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(targetStatus);
  }

  function handleDrop(e: React.DragEvent, targetStatus: ProjectStatus) {
    e.preventDefault();
    setDragOverStatus(null);
    setDraggingId(null);

    const raw = e.dataTransfer.getData(DRAG_TYPE);
    if (!raw) return;

    let payload: { projectId: string; status: ProjectStatus };
    try {
      payload = JSON.parse(raw) as { projectId: string; status: ProjectStatus };
    } catch {
      return;
    }

    if (payload.status === targetStatus) return;

    if (!isCpiStatusTransitionAllowed(payload.status, targetStatus)) {
      toast.error(
        `Transition non autorisée : ${PROJECT_STATUS_LABELS[payload.status]} → ${PROJECT_STATUS_LABELS[targetStatus]}`
      );
      return;
    }

    startTransition(async () => {
      const result = await cpiKanbanMove(payload.projectId, targetStatus);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Dossier déplacé");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {isPending && (
        <p className="text-xs text-muted-foreground">Mise à jour du dossier…</p>
      )}
      <div className="flex w-full max-w-full gap-3 overflow-x-auto scrollbar-thin pb-2">
        {display.map((column) => (
          <div
            key={column.status}
            className={cn(
              "flex w-[240px] shrink-0 flex-col rounded-xl border border-border/60 bg-muted/20 transition-colors sm:w-[260px] lg:w-[280px]",
              dragOverStatus === column.status && "border-primary/50 bg-primary/5"
            )}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-3">
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.projects.length}
              </Badge>
            </div>
            <div className="flex min-h-[120px] flex-col gap-2 p-2">
              {column.projects.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  {dragOverStatus === column.status
                    ? "Déposer ici"
                    : "Aucun dossier"}
                </p>
              ) : (
                column.projects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cursor-grab active:cursor-grabbing",
                      draggingId === project.id && "opacity-50"
                    )}
                  >
                    <KanbanCard
                      project={project}
                      stale={isStaleCase(project)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Glissez-déposez une carte vers une autre colonne (transitions CPI guidées).
      </p>
    </div>
  );
}
