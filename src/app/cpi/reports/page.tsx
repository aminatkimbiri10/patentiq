import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiStats, getCpiProjects } from "@/lib/cpi/queries";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { ProjectStatus } from "@/types/database";
import { ProjectStatusBadge } from "@/components/shared/status-badge";

export const metadata = { title: "Rapports" };

export default async function CpiReportsPage() {
  const ctx = await requireUser();
  const [stats, decided] = await Promise.all([
    getCpiStats(ctx.user.id),
    getCpiProjects(ctx.user.id, ["approved", "rejected", "closed"]),
  ]);

  const statusRows = Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports"
        description="Synthèse de votre activité CPI et décisions rendues."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-elevated p-5">
          <p className="text-sm text-muted-foreground">Dossiers actifs</p>
          <p className="mt-1 text-3xl font-bold">{stats.activeCount}</p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-sm text-muted-foreground">Décisions rendues</p>
          <p className="mt-1 text-3xl font-bold">{stats.decidedCount}</p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-sm text-muted-foreground">Dossiers en retard (&gt;7j)</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{stats.staleCount}</p>
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="border-b border-border/60 px-5 py-3">
          <h2 className="font-semibold">Répartition par statut</h2>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border/60">
            {statusRows.length === 0 ? (
              <tr>
                <td className="px-5 py-4 text-muted-foreground">Aucun dossier assigné</td>
              </tr>
            ) : (
              statusRows.map(([status, count]) => (
                <tr key={status} className="hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <ProjectStatusBadge status={status as ProjectStatus} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {decided.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <div className="border-b border-border/60 px-5 py-3">
            <h2 className="font-semibold">Dernières décisions</h2>
          </div>
          <ul className="divide-y divide-border/60">
            {decided.slice(0, 10).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/cpi/cases/${p.id}`}
                  className="min-w-0 font-medium hover:text-primary"
                >
                  <span className="block truncate">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.reference_code}</span>
                </Link>
                <ProjectStatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
