import { describe, expect, it } from "vitest";
import {
  applyLlmSynthesisFallback,
  isLlmQuotaError,
  llmErrorHint,
} from "@/lib/ai/llm-client";

describe("llm synthesis fallback", () => {
  it("detects quota errors", () => {
    expect(isLlmQuotaError(new Error("Hugging Face (429): rate limit"))).toBe(true);
    expect(isLlmQuotaError(new Error("Hugging Face (503): busy"))).toBe(false);
  });

  it("returns quota hint", () => {
    const hint = llmErrorHint(new Error("Hugging Face (429): quota"));
    expect(hint).toContain("Quota Hugging Face");
  });

  it("appends hint to template summary", () => {
    const providers = { synthesis: "huggingface" };
    const summary = applyLlmSynthesisFallback(
      "Résumé template.",
      new Error("Hugging Face (429): quota"),
      providers
    );
    expect(summary).toContain("Résumé template.");
    expect(summary).toContain("Quota Hugging Face");
    expect(providers.synthesis).toBe("quota-fallback");
  });

  it("uses template-fallback for non-quota errors", () => {
    const providers = { synthesis: "huggingface" };
    applyLlmSynthesisFallback("Base.", new Error("Hugging Face (500): boom"), providers);
    expect(providers.synthesis).toBe("template-fallback");
  });
});
