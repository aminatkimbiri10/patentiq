import { describe, it, expect } from "vitest";
import { buildAiReportPdfBuffer } from "@/lib/export/build-ai-report-pdf";

describe("buildAiReportPdfBuffer", () => {
  it("produces a valid PDF buffer", async () => {
    const buffer = await buildAiReportPdfBuffer({
      projectTitle: "Gourde filtrante",
      referenceCode: "PI-001",
      categoryName: "Brevet",
      query: "filtration eau potable",
      summary: "**Synthèse** — aucun conflit majeur identifié.",
      results: [
        {
          id: "r1",
          search_id: "s1",
          result_type: "patent",
          title: "Dispositif de filtration",
          summary: "Brevet européen similaire.",
          score: 0.72,
          rank: 1,
          source_ref: "EP1234567",
          payload: {},
          metadata: {},
          created_at: "2026-06-01T00:00:00Z",
        },
      ],
      generatedAt: "2026-06-05T12:00:00Z",
      searchType: "novelty",
    });

    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(500);
  });
});
