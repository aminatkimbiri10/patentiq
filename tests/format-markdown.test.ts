import { describe, expect, it } from "vitest";
import {
  markdownToHtml,
  parseInlineMarkdown,
  parseMarkdownLines,
} from "@/lib/ai/format-markdown-text";

describe("parseInlineMarkdown", () => {
  it("renders bold segments", () => {
    expect(parseInlineMarkdown("**Recherche** de brevet")).toEqual([
      { kind: "bold", value: "Recherche" },
      { kind: "text", value: " de brevet" },
    ]);
  });
});

describe("parseMarkdownLines", () => {
  it("detects numbered lists", () => {
    expect(parseMarkdownLines("1. **Étape** un")).toEqual([
      { type: "numbered", index: "1", text: "**Étape** un" },
    ]);
  });
});

describe("markdownToHtml", () => {
  it("converts bold and lists", () => {
    const html = markdownToHtml("1. **Recherche** : test");
    expect(html).toContain("<strong>Recherche</strong>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>");
  });
});
