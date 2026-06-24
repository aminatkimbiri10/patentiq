import { describe, it, expect } from "vitest";
import { PROJECT_AI_SEARCH_TYPES, getSearchTypeLabel } from "@/lib/ai/search-types";

describe("AI search types", () => {
  it("exposes FTO search type", () => {
    const values = PROJECT_AI_SEARCH_TYPES.map((t) => t.value);
    expect(values).toContain("fto");
    expect(getSearchTypeLabel("fto")).toBe("Liberté d'exploitation (FTO)");
  });

  it("exposes analysis types without one-shot assistant", () => {
    const values = PROJECT_AI_SEARCH_TYPES.map((t) => t.value);
    expect(values).toContain("novelty");
    expect(values).not.toContain("assistant");
  });

  it("labels unknown types as-is", () => {
    expect(getSearchTypeLabel("novelty")).toBe("Nouveauté");
    expect(getSearchTypeLabel("assistant")).toBe("assistant");
    expect(getSearchTypeLabel("report")).toBe("report");
  });
});
