import { describe, it, expect } from "vitest";
import { normalizeExtractedText } from "@/lib/ai/extract-pdf-text";

describe("normalizeExtractedText", () => {
  it("collapses whitespace", () => {
    expect(normalizeExtractedText("hello   world\n\nfoo", 100).text).toBe(
      "hello world foo"
    );
  });

  it("truncates long text", () => {
    const long = "a".repeat(50);
    const { text, truncatedByChars } = normalizeExtractedText(long, 20);
    expect(truncatedByChars).toBe(true);
    expect(text.endsWith("…")).toBe(true);
    expect(text.length).toBe(21);
  });
});
