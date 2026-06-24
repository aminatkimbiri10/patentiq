import { describe, it, expect } from "vitest";
import {
  buildPatentDossierHtml,
  dossierHasExportableContent,
} from "@/lib/export/build-patent-dossier-html";

describe("patent dossier export", () => {
  it("detects exportable content", () => {
    expect(dossierHasExportableContent(null, null)).toBe(false);
    expect(
      dossierHasExportableContent(
        { description: "Un filtre", title: null, technical_field: null, background: null, abstract: null, id: "1", project_id: "p", updated_by: null, updated_at: "" },
        null
      )
    ).toBe(true);
  });

  it("builds HTML with sections and claims", () => {
    const html = buildPatentDossierHtml({
      projectTitle: "Gourde filtrante",
      referenceCode: "PI-001",
      categoryName: "Brevet",
      draft: {
        id: "d1",
        project_id: "p1",
        title: "Dispositif de filtration",
        technical_field: "Domaine eau potable",
        background: "État de l'art",
        description: "Description longue",
        abstract: "Abrégé court",
        updated_by: null,
        updated_at: "2026-01-01",
      },
      claims: {
        id: "c1",
        project_id: "p1",
        independent_claim: "1. Un dispositif…",
        dependent_claims: ["2. Selon revendication 1…"],
        updated_by: null,
        updated_at: "2026-01-01",
      },
      generatedAt: "2026-06-05T12:00:00Z",
    });
    expect(html).toContain("CONFIDENTIEL");
    expect(html).toContain("Dispositif de filtration");
    expect(html).toContain("Revendications");
    expect(html).toContain("1. Un dispositif");
  });
});
