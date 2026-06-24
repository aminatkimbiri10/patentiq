import { describe, expect, it } from "vitest";
import { getProjectSummaryLabels } from "@/lib/project-summary-labels";

describe("project-summary-labels", () => {
  it("uses marque wording for trademark projects", () => {
    const labels = getProjectSummaryLabels("marque");
    expect(labels.summaryLabel).toBe("Description de la marque");
    expect(labels.summaryLabel).not.toContain("invention");
  });

  it("uses invention wording for patent projects", () => {
    const labels = getProjectSummaryLabels("brevet");
    expect(labels.summaryLabel).toBe("Résumé de l'invention");
  });

  it("uses design wording for dessin-modele projects", () => {
    const labels = getProjectSummaryLabels("dessin-modele");
    expect(labels.summaryLabel).toContain("dessin");
  });
});
