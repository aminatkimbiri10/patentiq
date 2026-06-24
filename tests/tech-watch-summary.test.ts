import { describe, expect, it } from "vitest";
import { buildTechWatchReportSummary } from "@/lib/surveillance/tech-watch-summary";

describe("tech-watch-summary", () => {
  it("returns template when no hits", async () => {
    const { summary, provider } = await buildTechWatchReportSummary(
      "Veille gourdes",
      "filtration portable",
      [],
      "brevet(s)"
    );
    expect(provider).toBe("template");
    expect(summary).toContain("aucun brevet(s)");
  });

  it("returns template listing when LLM not configured", async () => {
    const prev = process.env.HUGGINGFACE_API_KEY;
    delete process.env.HUGGINGFACE_API_KEY;
    delete process.env.HF_TOKEN;

    const { summary, provider } = await buildTechWatchReportSummary(
      "Veille gourdes",
      "filtration",
      [{ title: "Membrane filter", ref: "EP123" }],
      "brevet(s)"
    );
    expect(provider).toBe("template");
    expect(summary).toContain("Membrane filter");

    if (prev) process.env.HUGGINGFACE_API_KEY = prev;
  });
});
