"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brain, FolderOpen, Users, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { CommentThread, type CommentWithAuthor } from "@/components/dashboard/comment-thread";
import { TaskList, type ProjectTask } from "@/components/dashboard/task-list";
import { ProjectTimeline, type ProjectUpdate } from "@/components/dashboard/project-timeline";
import { AiAssistantChatFloat } from "@/components/dashboard/ai-assistant-chat-float";
import { AiSearchPanel } from "@/components/dashboard/ai-search-panel";
import { ProjectChecklistPanel } from "@/components/dashboard/project-checklist-panel";
import { ProjectCompletenessPanel } from "@/components/dashboard/project-completeness-panel";
import { ProjectMessageThread } from "@/components/messages/project-message-thread";
import { ProjectPiParcoursPanel } from "@/components/surveillance/project-pi-parcours-panel";
import { ProjectSectionNav } from "@/components/project/project-section-nav";
import { ProjectSummaryPanel } from "@/components/project/project-summary-panel";
import {
  ProjectWorkspace,
  projectMainTabTriggerClass,
  projectMainTabsListClass,
} from "@/components/project/project-workspace";
import {
  isBrevetCategory,
  isMarqueCategory,
  isDesignCategory,
  type MarqueLifecycleState,
  defaultMarqueLifecycle,
} from "@/lib/workflow/marque-lifecycle";
import {
  type BrevetLifecycleState,
  defaultBrevetLifecycle,
} from "@/lib/workflow/brevet-lifecycle";
import {
  type DesignLifecycleState,
  defaultDesignLifecycle,
} from "@/lib/workflow/design-lifecycle";
import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import type { PatentDraftVersionRow } from "@/lib/actions/patent-draft-history";
import {
  resolveProjectTab,
  type DossierSection,
  type EchangesSection,
  type ProjectMainTab,
  type SearchSection,
} from "@/lib/project-tabs";
import type { ProjectMessage } from "@/lib/actions/messages";
import { PROJECT_AI_SEARCH_TYPES } from "@/lib/ai/search-types";
import type { Document, AiSearch, AiResult, AiSearchType } from "@/types/database";
import type { ChecklistTemplate } from "@/lib/checklists/templates";
import type { ProjectChecklistState } from "@/lib/checklists/parse";
import { checklistProgress } from "@/lib/checklists/parse";
import { cn } from "@/lib/utils/cn";

type TabStats = {
  documents: number;
  comments: number;
  tasks: number;
  aiSearches: number;
  messages: number;
  unreadMessages?: number;
  pendingTasks?: number;
  checklistPercent?: number;
};

export function ProjectDetailTabs({
  projectId,
  documents,
  comments,
  messages,
  tasks,
  updates,
  aiSearches,
  resultsBySearch = {},
  canPostLegal = false,
  stats,
  aiProviderLabel,
  currentUserId,
  checklistTemplate,
  checklistState,
  checklistManualChecked = {},
  checklistAutoChecked = {},
  checklistReadOnly = false,
  categorySlug,
  patentClaims = null,
  patentDraft = null,
  draftVersions = [],
  projectTitle,
  inventionSummary,
  needDescription,
  canEditMarqueLifecycle = false,
  marqueLifecycle,
  brevetLifecycle,
  designLifecycle,
}: {
  projectId: string;
  documents: Document[];
  comments: CommentWithAuthor[];
  messages: ProjectMessage[];
  tasks: ProjectTask[];
  updates: ProjectUpdate[];
  aiSearches: AiSearch[];
  resultsBySearch?: Record<string, AiResult[]>;
  canPostLegal?: boolean;
  stats?: TabStats;
  aiProviderLabel?: string;
  currentUserId: string;
  checklistTemplate: ChecklistTemplate;
  checklistState: ProjectChecklistState;
  checklistManualChecked?: Record<string, boolean>;
  checklistAutoChecked?: Record<string, boolean>;
  checklistReadOnly?: boolean;
  categorySlug?: string | null;
  patentClaims?: PatentClaimsDraft | null;
  patentDraft?: PatentDraft | null;
  draftVersions?: PatentDraftVersionRow[];
  projectTitle?: string;
  inventionSummary?: string | null;
  needDescription?: string | null;
  canEditMarqueLifecycle?: boolean;
  marqueLifecycle?: MarqueLifecycleState;
  brevetLifecycle?: BrevetLifecycleState;
  designLifecycle?: DesignLifecycleState;
}) {
  const searchParams = useSearchParams();
  const resolved = resolveProjectTab(
    searchParams.get("tab"),
    searchParams.get("section")
  );

  const activeDocs = documents.filter((d) => d.status !== "deleted");
  const s = stats ?? {
    documents: activeDocs.length,
    comments: comments.length,
    tasks: tasks.length,
    aiSearches: aiSearches.length,
    messages: messages.length,
  };

  const [activeTab, setActiveTab] = useState<ProjectMainTab>(resolved.tab);
  const [dossierSection, setDossierSection] = useState<DossierSection>(resolved.dossierSection);
  const [echangesSection, setEchangesSection] = useState<EchangesSection>(resolved.echangesSection);
  const [searchSection, setSearchSection] = useState<SearchSection>(resolved.searchSection);

  useEffect(() => {
    const r = resolveProjectTab(searchParams.get("tab"), searchParams.get("section"));
    setActiveTab(r.tab);
    setDossierSection(r.dossierSection);
    setEchangesSection(r.echangesSection);
    setSearchSection(r.searchSection);
  }, [searchParams]);

  const pendingAi = aiSearches.filter(
    (x) => x.status === "pending" || x.status === "processing"
  ).length;
  const unreadMessages = s.unreadMessages ?? 0;
  const openTasks =
    s.pendingTasks ??
    tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;

  const typeParam = searchParams.get("type");
  const initialSearchType = PROJECT_AI_SEARCH_TYPES.some((t) => t.value === typeParam)
    ? (typeParam as AiSearchType)
    : undefined;

  const showPiParcours =
    isBrevetCategory(categorySlug) ||
    isMarqueCategory(categorySlug) ||
    isDesignCategory(categorySlug);
  const marqueState = marqueLifecycle ?? defaultMarqueLifecycle();
  const brevetState = brevetLifecycle ?? defaultBrevetLifecycle();
  const designState = designLifecycle ?? defaultDesignLifecycle();

  const checklistStats = checklistProgress(
    checklistTemplate.items.map((i) => i.id),
    checklistState
  );

  const dossierSections: Array<{
    id: DossierSection;
    label: string;
    count?: number | string;
  }> = [
    { id: "documents", label: "Documents", count: s.documents },
    {
      id: "checklist",
      label: "Checklist",
      count: s.checklistPercent != null ? `${s.checklistPercent} %` : undefined,
    },
  ];
  if (showPiParcours) {
    dossierSections.push({ id: "parcours-pi", label: "Parcours PI" });
  }

  return (
    <>
      <ProjectWorkspace>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ProjectMainTab)}
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
                {(unreadMessages > 0 || openTasks > 0) && (
                  <span
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary sm:right-3"
                    title={
                      unreadMessages > 0
                        ? `${unreadMessages} message(s) non lu(s)`
                        : `${openTasks} tâche(s) ouverte(s)`
                    }
                  />
                )}
              </TabsTrigger>
              <TabsTrigger value="search" className={projectMainTabTriggerClass}>
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
                documentCount={s.documents}
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
                <div className="space-y-6">
                  <UploadZone projectId={projectId} />
                  <DocumentList documents={activeDocs} projectId={projectId} />
                </div>
              )}
              {dossierSection === "checklist" && (
                <ProjectChecklistPanel
                  projectId={projectId}
                  template={checklistTemplate}
                  state={checklistState}
                  readOnly={checklistReadOnly}
                  aiSearches={aiSearches}
                  patentDraft={patentDraft}
                  patentClaims={patentClaims}
                  manualChecked={checklistManualChecked}
                  autoChecked={checklistAutoChecked}
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
                  marqueLifecycle={marqueState}
                  brevetLifecycle={brevetState}
                  designLifecycle={designState}
                  canEdit={canEditMarqueLifecycle}
                  readOnly={checklistReadOnly}
                />
              )}

              {updates.length > 0 && (
                <details className="group mt-8 rounded-md border border-border/60 bg-muted/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    <span>Journal d&apos;activité</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border/60 px-4 py-4">
                    <ProjectTimeline updates={updates} limit={5} />
                  </div>
                </details>
              )}
            </TabsContent>

            <TabsContent value="echanges" className="mt-0">
              <ProjectSectionNav
                active={echangesSection}
                onChange={setEchangesSection}
                sections={[
                  { id: "comments", label: "Commentaires", count: s.comments },
                  {
                    id: "messages",
                    label: "Messages",
                    count: unreadMessages > 0 ? unreadMessages : undefined,
                    highlight: unreadMessages > 0,
                  },
                  {
                    id: "tasks",
                    label: "Tâches",
                    count: openTasks > 0 ? openTasks : undefined,
                    highlight: openTasks > 0,
                  },
                ]}
              />
              {echangesSection === "comments" && (
                <CommentThread
                  projectId={projectId}
                  comments={comments}
                  canPostLegal={canPostLegal}
                />
              )}
              {echangesSection === "messages" && (
                <ProjectMessageThread
                  projectId={projectId}
                  messages={messages}
                  currentUserId={currentUserId}
                />
              )}
              {echangesSection === "tasks" && (
                <TaskList projectId={projectId} tasks={tasks} canCreate={false} />
              )}
            </TabsContent>

            <TabsContent value="search" className="mt-0">
              <ProjectSectionNav
                active={searchSection}
                onChange={setSearchSection}
                sections={[
                  { id: "new", label: "Nouvelle analyse" },
                  { id: "history", label: "Historique", count: s.aiSearches },
                ]}
              />
              <AiSearchPanel
                projectId={projectId}
                searches={aiSearches}
                resultsBySearch={resultsBySearch}
                providerLabel={aiProviderLabel}
                documents={documents}
                view={searchSection}
                initialSearchType={initialSearchType}
                categorySlug={categorySlug}
              />
            </TabsContent>
          </div>
        </Tabs>
      </ProjectWorkspace>

      <AiAssistantChatFloat projectId={projectId} providerLabel={aiProviderLabel} />
    </>
  );
}
