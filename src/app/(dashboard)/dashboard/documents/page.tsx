import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentList } from "@/components/documents/document-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, FolderPlus } from "lucide-react";
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
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Documents"
        description="Tous les fichiers de vos projets — stockage privé sécurisé."
      />
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Ouvrez un projet → onglet Dossier → déposez vos fichiers (PDF, TXT, images)."
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
        <div className="space-y-8">
          {Object.entries(byProject).map(([projectId, docs]) => {
            const proj = projectMap.get(projectId);
            return (
              <section key={projectId}>
                <Link
                  href={`/dashboard/projects/${projectId}`}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {proj?.title ?? "Projet"}
                  {proj?.ref && (
                    <span className="font-normal text-muted-foreground">· {proj.ref}</span>
                  )}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <DocumentList documents={docs} projectId={projectId} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
