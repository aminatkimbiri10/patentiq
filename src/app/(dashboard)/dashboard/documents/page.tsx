import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DocumentList } from "@/components/documents/document-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, FolderPlus, FolderKanban } from "lucide-react";
import type { Document } from "@/types/database";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, reference_code")
    .eq("owner_id", ctx.user.id);

  const projectMap = new Map(
    (projects ?? []).map((p) => [p.id, { title: p.title, ref: p.reference_code }])
  );
  const projectIds = Array.from(projectMap.keys());

  let documents: Document[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .in("project_id", projectIds)
      .neq("status", "deleted")
      .eq("is_latest", true)
      .order("updated_at", { ascending: false })
      .limit(50);
    documents = (data ?? []) as Document[];
  }

  const byProject = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    if (!acc[doc.project_id]) acc[doc.project_id] = [];
    acc[doc.project_id].push(doc);
    return acc;
  }, {});

  return (
    <DashboardPageFrame>
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={FileText}
        eyebrow="Bibliothèque"
        title="Documents"
        description={
          documents.length > 0
            ? `${documents.length} fichier${documents.length !== 1 ? "s" : ""} — stockage privé sécurisé.`
            : "Tous les fichiers de vos projets — stockage privé sécurisé."
        }
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Ouvrez un projet → onglet Documents → déposez vos fichiers (PDF, TXT, images)."
          className="enterprise-panel"
          action={
            projectIds.length > 0 ? (
              <Button asChild>
                <Link href={`/dashboard/projects/${projectIds[0]}`}>
                  Ouvrir {projectMap.get(projectIds[0])?.title ?? "mon projet"}
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Créer un projet
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(byProject).map(([projectId, docs]) => {
            const proj = projectMap.get(projectId);
            const label = proj?.ref ? `${proj.title} · ${proj.ref}` : (proj?.title ?? "Projet");
            return (
              <DashboardSection
                key={projectId}
                title={label}
                description={`${docs.length} document${docs.length !== 1 ? "s" : ""}`}
                icon={FolderKanban}
                actionHref={`/dashboard/projects/${projectId}`}
                actionLabel="Ouvrir le dossier"
              >
                <div className="p-5 pt-0">
                  <DocumentList documents={docs} projectId={projectId} />
                </div>
              </DashboardSection>
            );
          })}
        </div>
      )}
    </DashboardPageFrame>
  );
}
