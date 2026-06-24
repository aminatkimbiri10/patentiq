import { describe, it, expect } from "vitest";
import {
  mergePriorArtResults,
  ompicHitsToAiResults,
} from "@/lib/surveillance/ompic-prior-art";
import type { OmpicHit } from "@/lib/surveillance/ompic-provider";

describe("ompic-prior-art", () => {
  it("converts OMPIC hits to AI result items", () => {
    const hits: OmpicHit[] = [
      {
        title: "COCO",
        ref: "MA-M-260907",
        source: "ompic_ma",
        score: 0.72,
        summary: "Dépôt OMPIC",
      },
    ];
    const results = ompicHitsToAiResults(hits, "novelty");
    expect(results[0]?.result_type).toBe("prior_art_trademark");
    expect(results[0]?.source_ref).toBe("MA-M-260907");
    expect(results[0]?.payload.ompic).toBe(true);
  });

  it("merges and deduplicates by source_ref", () => {
    const a = [
      {
        result_type: "prior_art",
        title: "A",
        summary: "s",
        score: 0.5,
        rank: 1,
        source_ref: "EP111",
        payload: {},
      },
    ];
    const b = [
      {
        result_type: "prior_art",
        title: "A better",
        summary: "s",
        score: 0.8,
        rank: 1,
        source_ref: "EP111",
        payload: {},
      },
    ];
    const merged = mergePriorArtResults(a, b);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.score).toBe(0.8);
  });
});
