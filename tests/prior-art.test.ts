import { describe, it, expect } from "vitest";
import {
  getPriorArtDocumentationStatus,
  getPriorArtSearchTypeForItem,
  isPriorArtChecklistItem,
  priorArtProjectUrl,
} from "@/lib/checklists/prior-art";

describe("prior-art checklist", () => {
  it("maps fto checklist item to fto search", () => {
    expect(getPriorArtSearchTypeForItem("fto")).toBe("fto");
    expect(priorArtProjectUrl("p1", "fto")).toContain("type=fto");
  });

  it("detects prior art checklist items", () => {
    expect(isPriorArtChecklistItem("anteriorite")).toBe(true);
    expect(isPriorArtChecklistItem("figures")).toBe(false);
  });

  it("maps checklist items to default search types", () => {
    expect(getPriorArtSearchTypeForItem("anteriorite")).toBe("novelty");
    expect(getPriorArtSearchTypeForItem("anteriorite-marque")).toBe("semantic");
    expect(getPriorArtSearchTypeForItem("anteriorite-design")).toBe("similarity");
  });

  it("builds project URL with search type for holder", () => {
    expect(priorArtProjectUrl("p1", "anteriorite")).toContain("type=novelty");
    expect(priorArtProjectUrl("p1", "anteriorite-design")).toContain("type=similarity");
  });

  it("builds CPI case URL for prior art", () => {
    expect(priorArtProjectUrl("p1", "anteriorite", "cpi")).toContain("/cpi/cases/p1");
    expect(priorArtProjectUrl("p1", "anteriorite", "cpi")).toContain("tab=ia");
  });

  it("marks documented when completed novelty search exists", () => {
    const status = getPriorArtDocumentationStatus([
      {
        search_type: "novelty",
        status: "completed",
        created_at: "2026-01-01T00:00:00Z",
      },
      { search_type: "summarization", status: "completed", created_at: "2026-01-02" },
    ]);
    expect(status.documented).toBe(true);
    expect(status.count).toBe(1);
  });

  it("requires similarity for design prior art item", () => {
    const status = getPriorArtDocumentationStatus(
      [{ search_type: "novelty", status: "completed", created_at: "2026-01-01" }],
      "anteriorite-design"
    );
    expect(status.documented).toBe(false);
  });
});
