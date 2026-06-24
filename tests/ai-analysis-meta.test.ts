import { describe, expect, it } from "vitest";
import {
  extractSourceLinksFromPayload,
  formatAiConfidenceLabel,
  formatSynthesisProviderLabel,
  getAiConfidenceLevel,
  getAiSearchProviders,
} from "@/lib/ai/ai-analysis-meta";
import type { AiSearch } from "@/types/database";

function mockSearch(overrides: Partial<AiSearch> = {}): AiSearch {
  return {
    id: "1",
    project_id: "p1",
    user_id: "u1",
    search_type: "novelty",
    query: "test",
    status: "completed",
    metadata: {},
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    ...overrides,
  } as AiSearch;
}

describe("ai-analysis-meta", () => {
  it("reads providers from metadata", () => {
    const providers = getAiSearchProviders(
      mockSearch({
        metadata: { providers: { synthesis: "huggingface", patent: "epo-ops" } },
      })
    );
    expect(providers.synthesis).toBe("huggingface");
    expect(providers.patent).toBe("epo-ops");
  });

  it("assigns confidence levels", () => {
    expect(
      getAiConfidenceLevel(
        mockSearch({
          metadata: { providers: { synthesis: "stub", patent: "stub" } },
        })
      )
    ).toBe("low");

    expect(
      getAiConfidenceLevel(
        mockSearch({
          status: "completed",
          metadata: { providers: { synthesis: "huggingface", patent: "epo-ops" } },
        })
      )
    ).toBe("high");

    expect(
      getAiConfidenceLevel(
        mockSearch({
          status: "completed",
          metadata: { providers: { synthesis: "huggingface", patent: "n/a" } },
        })
      )
    ).toBe("medium");
  });

  it("formats labels for UI", () => {
    expect(formatAiConfidenceLabel("high")).toBe("Confiance élevée");
    expect(formatSynthesisProviderLabel("quota-fallback")).toContain("Quota HF");
    expect(formatSynthesisProviderLabel("template")).toContain("template");
  });

  it("extracts source links from payload", () => {
    const links = extractSourceLinksFromPayload({
      espacenet_url: "https://worldwide.espacenet.com/patent/search?q=1",
      ompic_url: "https://search.ompic.ma/",
    });
    expect(links).toHaveLength(2);
    expect(links[0].kind).toBe("espacenet");
    expect(links[1].kind).toBe("ompic");
  });
});
