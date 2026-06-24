import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { AdminProjectPanel } from "@/components/admin/admin-project-panel";
import { Button } from "@/components/ui/button";
import { listCpiAdvisors } from "@/lib/workflow/assign-cpi";
import { listExperts } from "@/lib/workflow/assign-expert";
import { ALL_STATUSES } from "@/lib/workflow/status-permissions";
import type { Project } from "@/types/database";

export default async function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const p = data as Project;

  const [cpiCandidates, expertCandidates] = await Promise.all([
    listCpiAdvisors(),
    listExperts(),
  ]);

  const cpiOptions = cpiCandidates.map((c) => ({
    id: c.userId,
    label: c.fullName ?? c.userId.slice(0, 8),
  }));
  const expertOptions = expertCandidates.map((e) => ({
    id: e.userId,
    label: e.fullName ?? e.userId.slice(0, 8),
  }));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link href="/admin/projects">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Projets
        </Link>
      </Button>

      <PageHeader icon={FolderKanban} title={p.title} description={`Admin · ${p.reference_code ?? p.id.slice(0, 8)}`}>
        <ProjectStatusBadge status={p.status} />
      </PageHeader>

      <AdminProjectPanel
        projectId={p.id}
        currentStatus={p.status}
        statusOptions={ALL_STATUSES}
        cpiOptions={cpiOptions}
        expertOptions={expertOptions}
        currentCpiId={p.assigned_to}
        currentExpertId={p.expert_id}
      />
    </div>
  );
}
