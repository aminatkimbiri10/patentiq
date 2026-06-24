"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brain, FolderOpen, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectChecklistPanel } from "@/components/dashboard/project-checklist-panel";
import { ProjectCompletenessPanel } from "@/components/dashboard/project-completeness-panel";
import { ProjectPiParcoursPanel } from "@/components/surveillance/project-pi-parcours-panel";
import { ProjectSectionNav } from "@/components/project/project-section-nav";
import { ProjectSummaryPanel } from "@/components/project/project-summary-panel";
import {
  ProjectWorkspace,
  projectMainTabTriggerClass,
  projectMainTabsListClass,
} from "@/components/project/project-workspace";
import { DocumentList } from "@/components/documents/document-list";
import { TaskList, type ProjectTask } from "@/components/dashboard/task-list";
import { ProjectTimeline, type ProjectUpdate } from "@/components/dashboard/project-timeline";
import { AiSearchPanel } from "@/components/dashboard/ai-search-panel";
import { ProjectMessageThread } from "@/components/messages/project-message-thread";
import { CommentThread, type CommentWithAuthor } from "@/components/dashboard/comment-thread";
import { CpiTaskForm } from "@/components/cpi/cpi-task-form";
import {
  ExpertRecommendationsPanel,
  type ExpertRecommendationRow,
} from "@/components/cpi/expert-recommendations-panel";
import {
  isBrevetCategory,
  isMarqueCategory,
  isDesignCategory,
  type MarqueLifecycleState,
} from "@/lib/workflow/marque-lifecycle";
import type { BrevetLifecycleState } from "@/lib/workflow/brevet-lifecycle";
import type { DesignLifecycleState } from "@/lib/workflow/design-lifecycle";
import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import type { PatentDraftVersionRow } from "@/lib/actions/patent-draft-history";
import { PROJECT_AI_SEARCH_TYPES } from "@/lib/ai/search-types";
import { resolveCpiCaseTab, type CpiCaseTab, type CpiIaSection } from "@/lib/cpi-case-tabs";
import type { ProjectMessage } from "@/lib/actions/messages";
import type { Document, AiSearch, AiResult, AiSearchType } from "@/types/database";
import type { ChecklistTemplate } from "@/lib/checklists/templates";
import type { ProjectChecklistState } from "@/lib/checklists/parse";
import { checklistProgress } from "@/lib/checklists/parse";
import { cn } from "@/lib/utils/cn";

type CpiDossierSection = "documents" | "checklist" | "parcours-pi" | "tasks" | "activity";
type CpiEchangesSection = "messages" | "comments";

export function CpiCaseTabs({
  projectId,
  projectTitle,
  referenceCode,
  inventionSummary,
  needDescription,
  ownerName,
  documents,
  checklistTemplate,
  checklistState,
  checklistManualChecked = {},
  checklistAutoChecked = {},
  checklistReadOnly,
  canAssignTasks,
  holderId,
  aiSearches,
  resultsBySearch,
  aiProviderLabel,
  tasks,
  updates,
  messages,
  currentUserId,
  canPostLegal,
  legalComments,
  allComments,
  expertRecommendations,
  showCpiTaskForm,
  statusModeCpi,
  categorySlug,
  patentClaims = null,
  patentDraft = null,
  draftVersions = [],
  marqueLifecycle,
  brevetLifecycle,
  designLifecycle,
  checklistPercent,
  openTasks,
  unreadMessages = 0,
}: {
  projectId: string;
  projectTitle: string;
  referenceCode: string | null;
  inventionSummary: string | null;
  needDescription: string | null;
  ownerName: string;
  documents: Document[];
  checklistTemplate: ChecklistTemplate;
  checklistState: ProjectChecklistState;
  checklistManualChecked?: Record<string, boolean>;
  checklistAutoChecked?: Record<string, boolean>;
  checklistReadOnly: boolean;
  canAssignTasks: boolean;
  holderId: string;
  aiSearches: AiSearch[];
  resultsBySearch: Record<string, AiResult[]>;
  aiProviderLabel?: string;
  tasks: ProjectTask[];
  updates: ProjectUpdate[];
  messages: ProjectMessage[];
  currentUserId: string;
  canPostLegal: boolean;
  legalComments: CommentWithAuthor[];
  allComments: CommentWithAuthor[];
  expertRecommendations: ExpertRecommendationRow[];
  showCpiTaskForm: boolean;
  statusModeCpi: boolean;
  categorySlug?: string | null;
  patentClaims?: PatentClaimsDraft | null;
  patentDraft?: PatentDraft | null;
  draftVersions?: PatentDraftVersionRow[];
  marqueLifecycle?: MarqueLifecycleState;
  brevetLifecycle?: BrevetLifecycleState;
  designLifecycle?: DesignLifecycleState;
  checklistPercent?: number;
  openTasks?: number;
  unreadMessages?: number;
}) {
  const searchParams = useSearchParams();
  const resolved = resolveCpiCaseTab(
    searchParams.get("tab"),
    searchParams.get("section")
  );

  const [activeTab, setActiveTab] = useState<CpiCaseTab>(resolved.tab);
  const [iaSection, setIaSection] = useState<CpiIaSection>(resolved.iaSection);
  const [dossierSection, setDossierSection] = useState<CpiDossierSection>("documents");
  const [echangesSection, setEchangesSection] = useState<CpiEchangesSection>("messages");

  useEffect(() => {
    const r = resolveCpiCaseTab(searchParams.get("tab"), searchParams.get("section"));
    setActiveTab(r.tab);
    setIaSection(r.iaSection);
  }, [searchParams]);

  const typeParam = searchParams.get("type");
  const initialSearchType = PROJECT_AI_SEARCH_TYPES.some((t) => t.value === typeParam)
    ? (typeParam as AiSearchType)
    : undefined;

  const pendingAi = aiSearches.filter(
    (x) => x.status === "pending" || x.status === "processing"
  ).length;

  const pendingTaskCount =
    openTasks ??
    tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;

  const showPiParcours =
    isBrevetCategory(categorySlug) ||
    isMarqueCategory(categorySlug) ||
    isDesignCategory(categorySlug);

  const checklistStats = checklistProgress(
    checklistTemplate.items.map((i) => i.id),
    checklistState
  );

  const dossierSections: Array<{
    id: CpiDossierSection;
    label: string;
    count?: number | string;
    highlight?: boolean;
  }> = [
    { id: "documents", label: "Documents", count: documents.length },
    {
      id: "checklist",
      label: "Checklist",
      count: checklistPercent != null ? `${checklistPercent} %` : undefined,
    },
  ];
  if (showPiParcours) {
    dossierSections.push({ id: "parcours-pi", label: "Parcours PI" });
  }
  dossierSections.push(
    {
      id: "tasks",
      label: "Tâches",
      count: pendingTaskCount > 0 ? pendingTaskCount : undefined,
      highlight: pendingTaskCount > 0,
    },
    { id: "activity", label: "Activité", count: updates.length > 0 ? updates.length : undefined }
  );

  return (
    <div className="space-y-5">
      <ExpertRecommendationsPanel
        projectId={projectId}
        projectTitle={projectTitle}
        referenceCode={referenceCode}
        recommendations={expertRecommendations}
      />

      <ProjectWorkspace>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as CpiCaseTab)}
          className="w-full min-w-0"
        >
          <div className="border-b border-border/60 px-2 sm:px-4">
            <TabsList className={projectMainTabsListClass}>
              <TabsTrigger value="dossier" className={projectMainTabTriggerClass}>
                <FolderOpen className="h-4 w-4 shrink-0 opacity-70" />
                Dossier
              </TabsTrigger>
              <TabsTrigger value="echanges" className={cn(projectMainTabTriggerClass, "relative")}>
                <Users className="h-4 w-4 shrink-0 opacity-70" />
                Échanges
                {(unreadMessages > 0 || pendingTaskCount > 0) && (
                  <span
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary sm:right-3"
                    title={
                      unreadMessages > 0
                        ? `${unreadMessages} message(s) non lu(s)`
                        : `${pendingTaskCount} tâche(s) ouverte(s)`
                    }
                  />
                )}
              </TabsTrigger>
              <TabsTrigger value="ia" className={projectMainTabTriggerClass}>
                <Brain className="h-4 w-4 shrink-0 opacity-70" />
                Analyses IA
                {pendingAi > 0 && (
                  <span
                    className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary"
                    title="Analyse en cours"
                  >
                    {pendingAi}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="dossier" className="mt-0">
              <ProjectCompletenessPanel
                inventionSummary={inventionSummary}
                needDescription={needDescription}
                categorySlug={categorySlug}
                documentCount={documents.length}
                checklistDone={checklistStats.done}
                checklistTotal={checklistStats.total}
              />
              <ProjectSummaryPanel
                inventionSummary={inventionSummary}
                needDescription={needDescription}
                categorySlug={categorySlug}
              />
              <ProjectSectionNav
                active={dossierSection}
                onChange={setDossierSection}
                sections={dossierSections}
              />

              {dossierSection === "documents" && (
                <DocumentList
                  documents={documents}
                  projectId={projectId}
                  canDelete={false}
                  canUploadVersion={statusModeCpi}
                />
              )}

              {dossierSection === "checklist" && (
                <ProjectChecklistPanel
                  projectId={projectId}
                  template={checklistTemplate}
                  state={checklistState}
                  readOnly={checklistReadOnly}
                  canAssignTasks={canAssignTasks}
                  holderId={holderId}
                  aiSearches={aiSearches}
                  patentDraft={patentDraft}
                  patentClaims={patentClaims}
                  manualChecked={checklistManualChecked}
                  autoChecked={checklistAutoChecked}
                  viewerRole="cpi"
                />
              )}

              {dossierSection === "parcours-pi" && showPiParcours && (
                <ProjectPiParcoursPanel
                  projectId={projectId}
                  projectTitle={projectTitle}
                  categorySlug={categorySlug}
                  patentDraft={patentDraft}
                  patentClaims={patentClaims}
                  draftVersions={draftVersions}
                  marqueLifecycle={marqueLifecycle}
                  brevetLifecycle={brevetLifecycle}
                  designLifecycle={designLifecycle}
                  canEdit={statusModeCpi}
                  readOnly={!statusModeCpi}
                />
              )}

              {dossierSection === "tasks" && (
                <div className="space-y-4">
                  {showCpiTaskForm && (
                    <CpiTaskForm
                      projectId={projectId}
                      holderId={holderId}
                      holderName={ownerName}
                    />
                  )}
                  <TaskList projectId={projectId} tasks={tasks} readOnly />
                </div>
              )}

              {dossierSection === "activity" && (
                <>
                  {updates.length > 0 ? (
                    <ProjectTimeline updates={updates} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucune activité enregistrée sur ce dossier.
                    </p>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="echanges" className="mt-0">
              <ProjectSectionNav
                active={echangesSection}
                onChange={setEchangesSection}
                sections={[
                  {
                    id: "messages",
                    label: "Messages",
                    count: unreadMessages > 0 ? unreadMessages : undefined,
                    highlight: unreadMessages > 0,
                  },
                  {
                    id: "comments",
                    label: "Commentaires juridiques",
                    count: (legalComments.length || allComments.length) || undefined,
                  },
                ]}
              />
              {echangesSection === "messages" && (
                <ProjectMessageThread
                  projectId={projectId}
                  messages={messages}
                  currentUserId={currentUserId}
                />
              )}
              {echangesSection === "comments" && (
                <CommentThread
                  projectId={projectId}
                  comments={legalComments.length ? legalComments : allComments}
                  canPostLegal={canPostLegal}
                  legalOnly={legalComments.length > 0}
                />
              )}
            </TabsContent>

            <TabsContent value="ia" className="mt-0">
              <ProjectSectionNav
                active={iaSection}
                onChange={setIaSection}
                sections={[
                  { id: "new", label: "Nouvelle analyse" },
                  { id: "history", label: "Historique", count: aiSearches.length },
                ]}
              />
              <AiSearchPanel
                projectId={projectId}
                searches={aiSearches}
                resultsBySearch={resultsBySearch}
                providerLabel={aiProviderLabel}
                documents={documents}
                view={iaSection}
                initialSearchType={initialSearchType}
                categorySlug={categorySlug}
              />
            </TabsContent>
          </div>
        </Tabs>
      </ProjectWorkspace>
    </div>
  );
}
