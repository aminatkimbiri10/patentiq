"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ClipboardCheck, ListPlus, Sparkles, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toggleChecklistItem, type ChecklistActionState } from "@/lib/actions/checklist";
import { createTaskFromChecklist, type TaskActionState } from "@/lib/actions/tasks";
import { checklistProgress, type ProjectChecklistState } from "@/lib/checklists/parse";
import {
  getPriorArtDocumentationStatus,
  isAiSearchChecklistItem,
  priorArtProjectUrl,
} from "@/lib/checklists/prior-art";
import {
  getDraftingDocumentationStatus,
  getPiSectionForChecklistItem,
  isDraftingChecklistItem,
  projectPiParcoursUrl,
} from "@/lib/checklists/patent-drafting";
import { isAutoCheckedOnly } from "@/lib/checklists/auto-sync";
import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import type { ChecklistTemplate } from "@/lib/checklists/templates";
import type { ProjectViewerRole } from "@/lib/project-routes";
import type { AiSearch } from "@/types/database";

function DraftingActions({
  projectId,
  itemId,
  documented,
  latestAt,
  viewerRole = "holder",
}: {
  projectId: string;
  itemId: string;
  documented: boolean;
  latestAt: string | null;
  viewerRole?: ProjectViewerRole;
}) {
  const piSection = getPiSectionForChecklistItem(itemId);
  if (!piSection) return null;

  const label = itemId === "revendications" ? "Revendications" : "Rédaction";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {documented ? (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <FileCheck className="h-3 w-3" />
          Renseigné
          {latestAt && (
            <span className="font-normal opacity-80">
              · {formatDistanceToNow(new Date(latestAt), { addSuffix: true, locale: fr })}
            </span>
          )}
        </Badge>
      ) : null}
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
        <Link href={projectPiParcoursUrl(projectId, piSection, viewerRole)}>
          <Sparkles className="h-3.5 w-3.5" />
          {documented ? `Voir ${label}` : `Ouvrir ${label}`}
        </Link>
      </Button>
    </div>
  );
}

function PriorArtActions({
  projectId,
  itemId,
  documented,
  latestAt,
  viewerRole = "holder",
}: {
  projectId: string;
  itemId: string;
  documented: boolean;
  latestAt: string | null;
  viewerRole?: ProjectViewerRole;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {documented ? (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <FileCheck className="h-3 w-3" />
          Documentée
          {latestAt && (
            <span className="font-normal opacity-80">
              · {formatDistanceToNow(new Date(latestAt), { addSuffix: true, locale: fr })}
            </span>
          )}
        </Badge>
      ) : null}
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
        <Link href={priorArtProjectUrl(projectId, itemId, viewerRole)}>
          <Sparkles className="h-3.5 w-3.5" />
          {documented ? "Voir analyses IA" : "Lancer analyse IA"}
        </Link>
      </Button>
    </div>
  );
}

function SurveillanceActions({
  projectId,
  documented,
  viewerRole = "holder",
}: {
  projectId: string;
  documented: boolean;
  viewerRole?: ProjectViewerRole;
}) {
  const href =
    viewerRole === "cpi"
      ? `/cpi/surveillance?project=${projectId}`
      : `/dashboard/surveillance?project=${projectId}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {documented ? (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <FileCheck className="h-3 w-3" />
          Portefeuille actif
        </Badge>
      ) : null}
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
        <Link href={href}>
          {documented ? "Voir surveillance" : "Activer surveillance"}
        </Link>
      </Button>
    </div>
  );
}

export function ProjectChecklistPanel({
  projectId,
  template,
  state,
  readOnly = false,
  canAssignTasks = false,
  holderId,
  aiSearches = [],
  patentDraft = null,
  patentClaims = null,
  autoChecked = {},
  manualChecked = {},
  viewerRole = "holder",
}: {
  projectId: string;
  template: ChecklistTemplate;
  state: ProjectChecklistState;
  readOnly?: boolean;
  canAssignTasks?: boolean;
  holderId?: string;
  aiSearches?: Pick<AiSearch, "search_type" | "status" | "created_at">[];
  patentDraft?: PatentDraft | null;
  patentClaims?: PatentClaimsDraft | null;
  autoChecked?: Record<string, boolean>;
  manualChecked?: Record<string, boolean>;
  viewerRole?: ProjectViewerRole;
}) {
  const router = useRouter();
  const [, formAction] = useFormState(toggleChecklistItem, {} as ChecklistActionState);
  const [taskState, taskFormAction] = useFormState(createTaskFromChecklist, {} as TaskActionState);
  const itemIds = template.items.map((i) => i.id);
  const progress = checklistProgress(itemIds, state);

  useEffect(() => {
    if (taskState?.success) {
      toast.success(taskState.message ?? "Tâche assignée au porteur");
      router.refresh();
    }
    if (taskState?.error) toast.error(taskState.error);
  }, [taskState, router]);

  return (
    <div className="space-y-6">
      <div className="card-elevated space-y-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">{template.title}</h3>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">
              {progress.done}/{progress.total} ({progress.percent}%)
            </span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </div>
      </div>

      <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
        {template.items.map((item) => {
          const isChecked = !!state.checked[item.id];
          const autoOnly = isAutoCheckedOnly(item.id, manualChecked, autoChecked);
          const isPriorArt = isAiSearchChecklistItem(item.id);
          const isDrafting = isDraftingChecklistItem(item.id);
          const isSurveillance = item.id === "surveillance-portefeuille";
          const priorArt = isPriorArt
            ? getPriorArtDocumentationStatus(aiSearches, item.id)
            : null;
          const drafting = isDrafting
            ? getDraftingDocumentationStatus(item.id, patentDraft, patentClaims)
            : null;

          return (
            <li key={item.id} className="px-4 py-4">
              {readOnly ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isChecked} disabled className="mt-0.5" />
                    <div>
                      <p
                        className={`text-sm font-medium ${isChecked ? "text-muted-foreground line-through" : ""}`}
                      >
                        {item.label}
                        {autoOnly && (
                          <Badge variant="outline" className="ml-2 text-[10px] font-normal">
                            Auto
                          </Badge>
                        )}
                      </p>
                      {item.hint && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
                      )}
                    </div>
                  </div>
                  {isPriorArt && priorArt && (
                    <PriorArtActions
                      projectId={projectId}
                      itemId={item.id}
                      documented={priorArt.documented}
                      latestAt={priorArt.latestAt}
                      viewerRole={viewerRole}
                    />
                  )}
                  {isDrafting && drafting && (
                    <DraftingActions
                      projectId={projectId}
                      itemId={item.id}
                      documented={drafting.documented}
                      latestAt={drafting.latestAt}
                      viewerRole={viewerRole}
                    />
                  )}
                  {isSurveillance && (
                    <SurveillanceActions
                      projectId={projectId}
                      documented={isChecked}
                      viewerRole={viewerRole}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <form action={formAction} className="flex min-w-0 flex-1 items-start gap-3">
                      <input type="hidden" name="project_id" value={projectId} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <input type="hidden" name="checked" value={isChecked ? "false" : "true"} />
                      <button
                        type="submit"
                        className="mt-0.5 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={isChecked ? `Décocher ${item.label}` : `Cocher ${item.label}`}
                      >
                        <Checkbox checked={isChecked} className="pointer-events-none" tabIndex={-1} />
                      </button>
                      <Label className="cursor-pointer text-sm font-medium leading-snug">
                        <button type="submit" className="text-left">
                          <span className={isChecked ? "text-muted-foreground line-through" : ""}>
                            {item.label}
                          </span>
                          {autoOnly && (
                            <Badge variant="outline" className="ml-2 inline text-[10px] font-normal">
                              Auto
                            </Badge>
                          )}
                          {item.hint && (
                            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                              {item.hint}
                            </span>
                          )}
                        </button>
                      </Label>
                    </form>
                    {canAssignTasks && holderId && !isChecked && (
                      <form action={taskFormAction} className="shrink-0">
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="assigned_to" value={holderId} />
                        <input type="hidden" name="title" value={item.label} />
                        {item.hint && (
                          <input type="hidden" name="description" value={item.hint} />
                        )}
                        <Button type="submit" variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                          <ListPlus className="h-3.5 w-3.5" />
                          Tâche porteur
                        </Button>
                      </form>
                    )}
                  </div>
                  {isPriorArt && priorArt && (
                    <PriorArtActions
                      projectId={projectId}
                      itemId={item.id}
                      documented={priorArt.documented}
                      latestAt={priorArt.latestAt}
                      viewerRole={viewerRole}
                    />
                  )}
                  {isDrafting && drafting && (
                    <DraftingActions
                      projectId={projectId}
                      itemId={item.id}
                      documented={drafting.documented}
                      latestAt={drafting.latestAt}
                      viewerRole={viewerRole}
                    />
                  )}
                  {isSurveillance && (
                    <SurveillanceActions
                      projectId={projectId}
                      documented={isChecked}
                      viewerRole={viewerRole}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
