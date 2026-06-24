import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { CpiStats } from "@/lib/cpi/queries";
import type { Project, ProjectStatus } from "@/types/database";

export type CpiExportProject = Project & {
  owner?: { full_name: string | null; email: string } | null;
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCpiReportCsv(
  projects: CpiExportProject[],
  stats: CpiStats,
  generatedAt: string
): string {
  const header = [
    "reference_code",
    "title",
    "status",
    "status_label",
    "owner_name",
    "owner_email",
    "last_activity_at",
    "created_at",
  ];

  const rows = projects.map((p) =>
    [
      p.reference_code ?? "",
      p.title,
      p.status,
      PROJECT_STATUS_LABELS[p.status],
      p.owner?.full_name ?? "",
      p.owner?.email ?? "",
      p.last_activity_at,
      p.created_at,
    ]
      .map((v) => escapeCsv(String(v)))
      .join(",")
  );

  const summary = [
    "",
    "# Synthèse",
    `generated_at,${escapeCsv(generatedAt)}`,
    `active_count,${stats.activeCount}`,
    `decided_count,${stats.decidedCount}`,
    `stale_count,${stats.staleCount}`,
    ...Object.entries(stats.byStatus).map(
      ([status, count]) => `status_${status},${count}`
    ),
  ];

  return [header.join(","), ...rows, ...summary].join("\n");
}

export function buildCpiReportHtml(
  projects: CpiExportProject[],
  stats: CpiStats,
  cpiName: string,
  generatedAt: string
): string {
  const statusRows = Object.entries(stats.byStatus)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([status, count]) =>
        `<tr><td>${escapeHtml(PROJECT_STATUS_LABELS[status as ProjectStatus] ?? status)}</td><td class="num">${count}</td></tr>`
    )
    .join("");

  const projectRows = projects
    .map(
      (p) => `
      <tr>
        <td><code>${escapeHtml(p.reference_code ?? "—")}</code></td>
        <td>${escapeHtml(p.title)}</td>
        <td>${escapeHtml(PROJECT_STATUS_LABELS[p.status])}</td>
        <td>${escapeHtml(p.owner?.full_name ?? p.owner?.email ?? "—")}</td>
        <td>${escapeHtml(new Date(p.last_activity_at).toLocaleString("fr-FR"))}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport CPI — ${escapeHtml(cpiName)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 32px; color: #111; line-height: 1.45; }
    h1 { font-size: 1.4rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .kpis { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.25rem; min-width: 140px; }
    .kpi strong { display: block; font-size: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.6rem; text-align: left; }
    th { background: #f1f5f9; }
    td.num { text-align: right; font-weight: 600; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #666; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Rapport d'activité CPI</h1>
  <p class="meta">
    Conseiller : <strong>${escapeHtml(cpiName)}</strong><br />
    Généré le ${escapeHtml(new Date(generatedAt).toLocaleString("fr-FR"))} · ${projects.length} dossier(s)
  </p>
  <div class="kpis">
    <div class="kpi"><span>Actifs</span><strong>${stats.activeCount}</strong></div>
    <div class="kpi"><span>Décisions</span><strong>${stats.decidedCount}</strong></div>
    <div class="kpi"><span>En retard (&gt;7j)</span><strong>${stats.staleCount}</strong></div>
  </div>
  <h2>Répartition par statut</h2>
  <table><thead><tr><th>Statut</th><th>Nombre</th></tr></thead><tbody>${statusRows}</tbody></table>
  <h2>Liste des dossiers</h2>
  <table>
    <thead>
      <tr><th>Réf.</th><th>Titre</th><th>Statut</th><th>Porteur</th><th>Dernière activité</th></tr>
    </thead>
    <tbody>${projectRows}</tbody>
  </table>
  <p class="footer">PatentIQ — export automatique. Imprimez (Ctrl+P) pour obtenir un PDF.</p>
</body>
</html>`;
}
