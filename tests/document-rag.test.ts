import { describe, expect, it } from "vitest";
import { chunkText, scoreChunk } from "@/lib/ai/document-rag";

describe("document-rag", () => {
  it("returns single chunk for short text", () => {
    expect(chunkText("Filtration portable eau potable")).toEqual([
      "Filtration portable eau potable",
    ]);
  });

  it("splits long text with overlap", () => {
    const text = "alpha ".repeat(200).trim();
    const chunks = chunkText(text, 100, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(100);
  });

  it("scores chunks by keyword overlap", () => {
    const chunk = "Système de filtration par membrane pour eau potable portable";
    expect(scoreChunk(chunk, ["filtration", "membrane"])).toBe(2);
    expect(scoreChunk(chunk, ["xyz"])).toBe(0);
    expect(scoreChunk(chunk, [])).toBe(0);
  });
});
