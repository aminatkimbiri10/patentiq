import Link from "next/link";
import { FolderKanban, FileText, Search, ListChecks, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { getHolderStats } from "@/lib/dashboard/stats";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import type { Project } from "@/types/database";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const ctx = await requireUser();
  const supabase = await createClient();
  const stats = await getHolderStats(ctx.user.id);

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, reference_code, updated_at")
    .eq("owner_id", ctx.user.id)
    .order("last_activity_at", { ascending: false })
    .limit(5);

  const firstName = ctx.profile?.full_name?.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tableau de bord"
        title={firstName ? `Bonjour, ${firstName}` : "Bonjour"}
        description="Vue d'ensemble de vos projets, documents et activités."
      >
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </PageHeader>

      <KpiCards
        items={[
          {
            title: "Projets actifs",
            value: stats.activeProjectCount,
            icon: FolderKanban,
            hint: `${stats.projectCount} au total`,
          },
          {
            title: "Documents",
            value: stats.documentCount,
            icon: FileText,
            hint: "Tous vos dossiers",
          },
          {
            title: "Recherches IA",
            value: stats.aiSearchCount,
            icon: Search,
          },
          {
            title: "Tâches ouvertes",
            value: stats.openTaskCount,
            icon: ListChecks,
          },
        ]}
      />

      <Card className="card-elevated border-0 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projets récents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">Voir tout</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!projects?.length ? (
            <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center">
              <p className="text-sm text-muted-foreground">Aucun projet pour le moment.</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/dashboard/projects/new">Créer votre premier projet</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {(projects as Pick<Project, "id" | "title" | "status" | "reference_code">[]).map(
                (p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/dashboard/projects/${p.id}`}
                      className="min-w-0 font-medium transition-colors hover:text-primary"
                    >
                      <span className="block truncate">{p.title}</span>
                      <span className="text-xs text-muted-foreground">{p.reference_code}</span>
                    </Link>
                    <ProjectStatusBadge status={p.status} />
                  </li>
                )
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
