import { getProjectSummaryLabels } from "@/lib/project-summary-labels";

export function ProjectSummaryPanel({
  inventionSummary,
  needDescription,
  categorySlug,
}: {
  inventionSummary?: string | null;
  needDescription?: string | null;
  categorySlug?: string | null;
}) {
  if (!inventionSummary && !needDescription) return null;

  const { summaryLabel } = getProjectSummaryLabels(categorySlug);

  return (
    <section
      className="mb-6 rounded-md border border-border/60 bg-muted/25"
      aria-labelledby="project-summary-heading"
    >
      <div className="border-b border-border/60 px-4 py-3">
        <h2 id="project-summary-heading" className="text-sm font-semibold text-foreground">
          Informations du dossier
        </h2>
      </div>
      <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-border/60">
        <div className="px-4 py-4 sm:py-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {summaryLabel}
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {inventionSummary?.trim() || "Non renseigné"}
          </p>
        </div>
        <div className="border-t border-border/60 px-4 py-4 sm:border-t-0 sm:py-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Besoin en propriété intellectuelle
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {needDescription?.trim() || "Non renseigné"}
          </p>
        </div>
      </div>
    </section>
  );
}
