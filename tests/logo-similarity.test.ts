import { describe, expect, it } from "vitest";
import { hashSimilarity } from "@/lib/surveillance/logo-similarity";

describe("logo-similarity", () => {
  it("returns 1 for identical hashes", () => {
    const h = "1010101010101010101010101010101010101010101010101010101010101010";
    expect(hashSimilarity(h, h)).toBe(1);
  });

  it("returns 0 for different length hashes", () => {
    expect(hashSimilarity("1010", "10101")).toBe(0);
  });

  it("measures partial similarity", () => {
    expect(hashSimilarity("11110000", "11110001")).toBe(0.875);
  });

  it("returns 0 for empty input", () => {
    expect(hashSimilarity("", "1010")).toBe(0);
  });
});
