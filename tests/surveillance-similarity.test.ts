import { describe, expect, it } from "vitest";
import { findSimilarTitles, textSimilarity } from "@/lib/surveillance/similarity";

describe("surveillance similarity", () => {
  it("returns 1 for identical titles", () => {
    expect(textSimilarity("Coca-Cola", "Coca-Cola")).toBe(1);
  });

  it("detects similar mark names", () => {
    const score = textSimilarity("Coca-Cola", "Coca Cola");
    expect(score).toBeGreaterThan(0.8);
  });

  it("finds Coca-Cola similar marks in catalog", () => {
    const matches = findSimilarTitles("Coca-Cola", [
      { title: "Coca-Kola", ref: "MA-1" },
      { title: "Atlas Telecom", ref: "MA-2" },
    ]);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.title).toBe("Coca-Kola");
  });
});
