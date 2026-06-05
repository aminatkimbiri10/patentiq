"use client";

import { useState } from "react";
import {
  FileText,
  MessageSquare,
  ListChecks,
  Sparkles,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { CommentThread, type CommentWithAuthor } from "@/components/dashboard/comment-thread";
import { TaskList, type ProjectTask } from "@/components/dashboard/task-list";
import { ProjectTimeline, type ProjectUpdate } from "@/components/dashboard/project-timeline";
import { AiSearchPanel } from "@/components/dashboard/ai-search-panel";
import type { Document, AiSearch, AiResult } from "@/types/database";

type TabStats = {
  documents: number;
  comments: number;
  tasks: number;
  aiSearches: number;
};

export function ProjectDetailTabs({
  projectId,
  documents,
  comments,
  tasks,
  updates,
  aiSearches,
  resultsBySearch = {},
  canPostLegal = false,
  stats,
  aiProviderLabel,
}: {
  projectId: string;
  documents: Document[];
  comments: CommentWithAuthor[];
  tasks: ProjectTask[];
  updates: ProjectUpdate[];
  aiSearches: AiSearch[];
  resultsBySearch?: Record<string, AiResult[]>;
  canPostLegal?: boolean;
  stats?: TabStats;
  aiProviderLabel?: string;
}) {
  const activeDocs = documents.filter((d) => d.status !== "deleted");
  const s = stats ?? {
    documents: activeDocs.length,
    comments: comments.length,
    tasks: tasks.length,
    aiSearches: aiSearches.length,
  };

  const [activeTab, setActiveTab] = useState("overview");

  const quickLinks = [
    {
      icon: FileText,
      label: "Documents",
      value: s.documents,
      tab: "documents",
      desc: "Uploader et gérer les pièces du dossier",
    },
    {
      icon: MessageSquare,
      label: "Commentaires",
      value: s.comments,
      tab: "comments",
      desc: "Échanges avec CPI et experts",
    },
    {
      icon: ListChecks,
      label: "Tâches",
      value: s.tasks,
      tab: "tasks",
      desc: "Actions et échéances",
    },
    {
      icon: Sparkles,
      label: "Recherche IA",
      value: s.aiSearches,
      tab: "search",
      desc: "Analyses de nouveauté",
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="scrollbar-thin flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1">
        <TabsTrigger value="overview" className="gap-1.5">
          <LayoutDashboard className="hidden h-4 w-4 sm:inline" />
          Vue d&apos;ensemble
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-1.5">
          <FileText className="hidden h-4 w-4 sm:inline" />
          Documents ({s.documents})
        </TabsTrigger>
        <TabsTrigger value="comments" className="gap-1.5">
          <MessageSquare className="hidden h-4 w-4 sm:inline" />
          Commentaires ({s.comments})
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-1.5">
          <ListChecks className="hidden h-4 w-4 sm:inline" />
          Tâches ({s.tasks})
        </TabsTrigger>
        <TabsTrigger value="search" className="gap-1.5">
          <Sparkles className="hidden h-4 w-4 sm:inline" />
          IA
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-1.5">
          <Activity className="hidden h-4 w-4 sm:inline" />
          Activité
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className="card-elevated group flex items-start gap-4 p-5 text-left transition-colors hover:border-primary/30"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{item.label}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {item.value}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-6 space-y-6">
        <UploadZone projectId={projectId} />
        <DocumentList documents={activeDocs} projectId={projectId} />
      </TabsContent>
      <TabsContent value="comments" className="mt-6">
        <CommentThread
          projectId={projectId}
          comments={comments}
          canPostLegal={canPostLegal}
        />
      </TabsContent>
      <TabsContent value="tasks" className="mt-6">
        <TaskList projectId={projectId} tasks={tasks} />
      </TabsContent>
      <TabsContent value="search" className="mt-6">
        <AiSearchPanel
          projectId={projectId}
          searches={aiSearches}
          resultsBySearch={resultsBySearch}
          providerLabel={aiProviderLabel}
        />
      </TabsContent>
      <TabsContent value="activity" className="mt-6">
        <ProjectTimeline updates={updates} />
      </TabsContent>
    </Tabs>
  );
}
