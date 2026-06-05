import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { Users, FolderKanban, ClipboardList, Settings, ArrowRight } from "lucide-react";
import { getAdminStats } from "@/lib/admin/stats";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { ProjectStatus } from "@/types/database";

export const metadata = { title: "Administration" };

export default async function AdminPage() {
  const stats = await getAdminStats();

  const statusSummary = Object.entries(stats.byStatus)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s, n]) => `${PROJECT_STATUS_LABELS[s as ProjectStatus] ?? s}: ${n}`)
    .join(" · ");

  const quickLinks = [
    { href: "/admin/users", label: "Gérer les utilisateurs", desc: "Rôles et comptes" },
    { href: "/admin/projects", label: "Superviser les projets", desc: "Assignations CPI / expert" },
    { href: "/admin/settings", label: "Paramètres workflow", desc: "Assignation auto, revue" },
    { href: "/admin/audit-logs", label: "Journal d'audit", desc: "Traçabilité" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Administration" description="Supervision globale de la plateforme." />

      <KpiCards
        items={[
          { title: "Utilisateurs", value: stats.usersCount, icon: Users },
          {
            title: "Projets",
            value: stats.projectsCount,
            icon: FolderKanban,
            hint: statusSummary || undefined,
          },
          {
            title: "Dossiers actifs",
            value: stats.projectsInReview,
            icon: FolderKanban,
            hint: "Soumis, en revue, expert, CPI",
          },
          { title: "Logs audit", value: stats.auditLogsCount, icon: ClipboardList },
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card-elevated group flex items-center justify-between p-5 transition-colors hover:border-primary/30"
          >
            <div>
              <p className="font-semibold group-hover:text-primary">{link.label}</p>
              <p className="text-sm text-muted-foreground">{link.desc}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </section>

      <div className="card-elevated flex items-center gap-3 p-4 text-sm text-muted-foreground">
        <Settings className="h-5 w-5 shrink-0 text-primary" />
        <p>
          Workflow : assignation CPI à la soumission, passage en revue, assignation expert sur
          demande CPI — configurable dans{" "}
          <Link href="/admin/settings" className="font-medium text-primary hover:underline">
            Paramètres
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
