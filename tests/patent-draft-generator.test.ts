import { describe, expect, it } from "vitest";
import {
  templatePatentDraft,
  type PatentDraftSections,
} from "@/lib/ai/patent-draft-generator";
import type { RichProjectAiContext } from "@/lib/ai/project-chat-context";

const baseCtx: RichProjectAiContext = {
  title: "Gourde filtrante",
  inventionSummary: "Une gourde avec membrane ultrafiltrante pour eau potable en randonnée.",
  needDescription: "Filtration portable sans électricité.",
  categoryName: "Brevet d'invention",
  categorySlug: "brevet",
  referenceCode: "PI-001",
  status: "in_review",
  contextBlock: "Projet test",
};

describe("patent-draft-generator", () => {
  it("templatePatentDraft fills all sections", () => {
    const s = templatePatentDraft(baseCtx);
    const keys: (keyof PatentDraftSections)[] = [
      "title",
      "technical_field",
      "background",
      "description",
      "abstract",
    ];
    for (const k of keys) {
      expect(s[k].length).toBeGreaterThan(10);
    }
    expect(s.title).toContain("Gourde");
  });

  it("template includes claims hint when provided", () => {
    const s = templatePatentDraft(baseCtx, "1. Un dispositif comprenant…");
    expect(s.background).toContain("revendications");
  });
});
