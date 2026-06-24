import { describe, expect, it } from "vitest";
import { computeProjectCompleteness } from "@/lib/projects/completeness";

describe("project-completeness", () => {
  it("returns 0% for an empty draft project", () => {
    const result = computeProjectCompleteness({
      inventionSummary: null,
      needDescription: null,
      categorySlug: null,
      documentCount: 0,
      checklistDone: 0,
      checklistTotal: 8,
    });
    expect(result.percent).toBe(0);
    expect(result.level).toBe("incomplet");
    expect(result.nextAction).not.toBeNull();
  });

  it("returns 100% and 'complet' when everything is done", () => {
    const result = computeProjectCompleteness({
      inventionSummary: "Un dispositif technique innovant et détaillé.",
      needDescription: null,
      categorySlug: "brevet",
      documentCount: 3,
      checklistDone: 8,
      checklistTotal: 8,
    });
    expect(result.percent).toBe(100);
    expect(result.level).toBe("complet");
    expect(result.nextAction).toBeNull();
  });

  it("counts partial checklist progress proportionally", () => {
    const result = computeProjectCompleteness({
      inventionSummary: "Description suffisamment longue pour compter.",
      needDescription: null,
      categorySlug: "marque",
      documentCount: 1,
      checklistDone: 2,
      checklistTotal: 8,
    });
    // objet(2) + categorie(1) + documents(2) + checklist(5 * 2/8 = 1.25) = 6.25 / 10 = 63%
    expect(result.percent).toBe(63);
    expect(result.level).toBe("en_cours");
  });

  it("ignores too-short summary text", () => {
    const result = computeProjectCompleteness({
      inventionSummary: "court",
      needDescription: null,
      categorySlug: "brevet",
      documentCount: 0,
      checklistDone: 0,
      checklistTotal: 5,
    });
    const objet = result.items.find((i) => i.id === "objet");
    expect(objet?.done).toBe(false);
  });
});
