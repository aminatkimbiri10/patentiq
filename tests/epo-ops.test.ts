import { describe, it, expect } from "vitest";
import {
  buildEpoCqlQueries,
  buildMoroccanCqlQueries,
  extractEpoKeywords,
} from "@/lib/ai/providers/epo-ops";

describe("epo-ops CQL", () => {
  it("extracts meaningful keywords", () => {
    const words = extractEpoKeywords(
      "gourde isotherme avec un système de filtration intégré pour l'eau"
    );
    expect(words.length).toBeGreaterThanOrEqual(2);
    expect(words).toContain("gourde");
    expect(words).not.toContain("avec");
  });

  it("builds txt all query first", () => {
    const queries = buildEpoCqlQueries(
      "gourde isotherme filtration intégrée"
    );
    expect(queries[0]).toMatch(/^txt all "/);
    expect(queries.length).toBeGreaterThan(1);
  });

  it("rejects empty queries", () => {
    expect(() => buildEpoCqlQueries("a")).toThrow();
  });

  it("filters Moroccan patents with pn=MA not pa=MA", () => {
    const queries = buildMoroccanCqlQueries("veste filtration");
    expect(queries.length).toBeGreaterThan(0);
    expect(queries.every((q) => q.includes("pn=MA") || q.endsWith(" and MA"))).toBe(true);
    expect(queries.some((q) => q.includes("pa=MA"))).toBe(false);
  });
});
