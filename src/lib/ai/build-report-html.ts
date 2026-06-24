import { markdownToHtml } from "@/lib/ai/format-markdown-text";
import type { AiResult } from "@/types/database";

export type ReportHtmlInput = {
  projectTitle: string;
  referenceCode?: string | null;
  categoryName?: string | null;
  query?: string | null;
  summary: string;
  results: AiResult[];
  generatedAt: string;
  searchType: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReportHtml(input: ReportHtmlInput): string {
  const resultsRows = input.results
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><code>${escapeHtml(r.source_ref ?? "—")}</code></td>
        <td>${escapeHtml(r.title ?? "—")}</td>
        <td>${r.score != null ? `${Math.round(Number(r.score) * 100)}%` : "—"}</td>
        <td>${escapeHtml((r.summary ?? "").slice(0, 280))}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport IA — ${escapeHtml(input.projectTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 40px; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .summary { background: #f8fafc; border-left: 4px solid #2563eb; padding: 1rem 1.25rem; margin: 1.5rem 0; }
    .summary p { margin: 0.35rem 0; }
    .summary ol, .summary ul { margin: 0.5rem 0 0.5rem 1.25rem; padding: 0; }
    .summary li { margin: 0.25rem 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.6rem; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; }
    code { font-size: 0.8rem; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #666; }
    .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; padding: 0.75rem; background: #f1f5f9; border-radius: 8px; }
    .toolbar button { font-family: system-ui, sans-serif; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; font-size: 0.9rem; }
    .toolbar button.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
    @media (prefers-color-scheme: dark) {
      body { background: #0f172a; color: #e2e8f0; }
      .meta { color: #94a3b8; }
      .summary { background: #1e293b; border-left-color: #3b82f6; }
      th { background: #1e293b; }
      th, td { border-color: #334155; }
      .toolbar { background: #1e293b; }
      .toolbar button { background: #0f172a; color: #e2e8f0; border-color: #475569; }
      .toolbar button.primary { background: #2563eb; border-color: #2563eb; }
      .footer { color: #94a3b8; }
      code { color: #93c5fd; }
    }
    @media print {
      body { margin: 20px; background: #fff !important; color: #111 !important; }
      .meta, .footer { color: #555 !important; }
      .summary { background: #f8fafc !important; }
      th { background: #f1f5f9 !important; }
      th, td { border-color: #ddd !important; }
      .toolbar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button type="button" class="primary" onclick="window.print()">Enregistrer en PDF (Ctrl+P)</button>
    <button type="button" onclick="window.close()">Fermer</button>
  </div>
  <h1>Rapport d'analyse IA</h1>
  <p class="meta">
    <strong>${escapeHtml(input.projectTitle)}</strong><br />
    ${input.referenceCode ? `Réf. ${escapeHtml(input.referenceCode)}<br />` : ""}
    ${input.categoryName ? `Catégorie : ${escapeHtml(input.categoryName)}<br />` : ""}
    Type : ${escapeHtml(input.searchType)} · Généré le ${escapeHtml(new Date(input.generatedAt).toLocaleString("fr-FR"))}
  </p>
  ${input.query ? `<p><strong>Requête :</strong> ${escapeHtml(input.query)}</p>` : ""}
  <h2>Synthèse</h2>
  <div class="summary">${markdownToHtml(input.summary)}</div>
  <h2>Documents identifiés (${input.results.length})</h2>
  ${
    input.results.length
      ? `<table>
    <thead>
      <tr><th>#</th><th>Réf.</th><th>Titre</th><th>Score</th><th>Résumé</th></tr>
    </thead>
    <tbody>${resultsRows}</tbody>
  </table>`
      : "<p>Aucun document enregistré pour cette analyse.</p>"
  }
  <p class="footer">
    PatentIQ — document généré automatiquement. Ne constitue pas un avis juridique.
    Utilisez « Enregistrer en PDF » puis « Enregistrer au format PDF » dans la boîte d'impression.
  </p>
  <script>
    if (new URLSearchParams(location.search).get("print") === "1") {
      window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 400); });
    }
  </script>
</body>
</html>`;
}

/** Version archive ZIP — sans barre d'outils ni script d'impression auto */
export function buildReportHtmlForArchive(input: ReportHtmlInput): string {
  return buildReportHtml(input)
    .replace(/<div class="toolbar">[\s\S]*?<\/div>\s*/i, "")
    .replace(/<script>[\s\S]*?<\/script>\s*/i, "");
}
