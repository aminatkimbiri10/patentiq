import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";

export type PatentDossierExportInput = {
  projectTitle: string;
  referenceCode?: string | null;
  categoryName?: string | null;
  draft: PatentDraft | null;
  claims: PatentClaimsDraft | null;
  generatedAt: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionBlock(title: string, body: string | null | undefined): string {
  if (!body?.trim()) return "";
  return `
    <section class="block">
      <h2>${escapeHtml(title)}</h2>
      <div class="content">${escapeHtml(body.trim()).replace(/\n/g, "<br/>")}</div>
    </section>`;
}

export function buildPatentDossierHtml(input: PatentDossierExportInput): string {
  const draft = input.draft;
  const claims = input.claims;
  const deps = claims?.dependent_claims ?? [];

  const claimsHtml =
    claims?.independent_claim?.trim() || deps.length > 0
      ? `
    <section class="block claims">
      <h2>Revendications</h2>
      ${
        claims?.independent_claim?.trim()
          ? `<h3>Revendication indépendante</h3>
      <div class="content mono">${escapeHtml(claims.independent_claim.trim()).replace(/\n/g, "<br/>")}</div>`
          : ""
      }
      ${
        deps.length > 0
          ? `<h3>Revendications dépendantes</h3>
      <ol class="deps">${deps.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ol>`
          : ""
      }
    </section>`
      : "";

  const hasContent =
    draft?.title ||
    draft?.technical_field ||
    draft?.background ||
    draft?.description ||
    draft?.abstract ||
    claimsHtml;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Dossier brevet — ${escapeHtml(input.projectTitle)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; color: #111; line-height: 1.55; }
    header { border-bottom: 2px solid #333; padding-bottom: 1rem; margin-bottom: 2rem; }
    h1 { font-size: 1.35rem; margin: 0 0 0.5rem; }
    .meta { font-size: 0.85rem; color: #555; }
    h2 { font-size: 1.1rem; margin: 1.5rem 0 0.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
    h3 { font-size: 0.95rem; margin: 1rem 0 0.35rem; }
    .content { text-align: justify; font-size: 0.95rem; }
    .mono { font-family: "Courier New", monospace; font-size: 0.88rem; }
    .deps { padding-left: 1.25rem; }
    .deps li { margin-bottom: 0.75rem; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.75rem; color: #666; }
    .confidential { background: #fff8e6; border: 1px solid #e6c200; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; }
    @page { size: A4; margin: 2cm; }
    @media print {
      body { margin: 0; max-width: none; }
      .confidential { break-inside: avoid; }
      section.block { break-inside: avoid-page; }
    }
  </style>
</head>
<body>
  <div class="confidential">
    <strong>CONFIDENTIEL</strong> — Brouillon I2PA. À valider par un CPI avant dépôt OMPIC (directompic.ma).
    Ne constitue pas un avis juridique.
  </div>
  <header>
    <h1>${escapeHtml(draft?.title?.trim() || input.projectTitle)}</h1>
    <p class="meta">
      ${input.referenceCode ? `Réf. ${escapeHtml(input.referenceCode)} · ` : ""}
      ${input.categoryName ? escapeHtml(input.categoryName) + " · " : ""}
      Généré le ${escapeHtml(new Date(input.generatedAt).toLocaleString("fr-FR"))}
    </p>
  </header>
  ${
    hasContent
      ? `
  ${sectionBlock("Domaine technique", draft?.technical_field)}
  ${sectionBlock("État de la technique", draft?.background)}
  ${sectionBlock("Description détaillée", draft?.description)}
  ${sectionBlock("Abrégé", draft?.abstract)}
  ${claimsHtml}`
      : `<p>Aucun contenu de rédaction ou revendications enregistré.</p>`
  }
  <div class="footer">
    I2PA — préparation dossier brevet Maroc (OMPIC) · Structure indicative : titre, description, revendications, abrégé.
  </div>
</body>
</html>`;
}

export function dossierHasExportableContent(
  draft: PatentDraft | null,
  claims: PatentClaimsDraft | null
): boolean {
  return !!(
    draft?.title?.trim() ||
    draft?.description?.trim() ||
    draft?.technical_field?.trim() ||
    claims?.independent_claim?.trim() ||
    (claims?.dependent_claims?.length ?? 0) > 0
  );
}
