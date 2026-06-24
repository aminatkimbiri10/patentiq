import { describe, expect, it } from "vitest";
import {
  computeAutoCheckedItems,
  isAutoCheckedOnly,
  mergeChecklistChecked,
} from "@/lib/checklists/auto-sync";
import { getChecklistTemplate } from "@/lib/checklists/templates";

describe("checklist auto-sync", () => {
  it("auto-checks prior art when IA completed", () => {
    const template = getChecklistTemplate("brevet");
    const auto = computeAutoCheckedItems(template, {
      aiSearches: [{ search_type: "novelty", status: "completed", created_at: "2026-01-01" }],
      patentDraft: null,
      patentClaims: null,
      hasActiveWatchlist: false,
      hasActiveTechWatch: false,
      hasActiveDocuments: false,
    });
    expect(auto.anteriorite).toBe(true);
  });

  it("auto-checks marque surveillance when watchlist active", () => {
    const template = getChecklistTemplate("marque");
    const auto = computeAutoCheckedItems(template, {
      aiSearches: [],
      patentDraft: null,
      patentClaims: null,
      hasActiveWatchlist: true,
      hasActiveTechWatch: false,
      hasActiveDocuments: false,
    });
    expect(auto["surveillance-portefeuille"]).toBe(true);
  });

  it("merges manual and auto without overriding manual false dismiss", () => {
    const merged = mergeChecklistChecked(
      { a: false },
      { a: true, b: true },
      { a: true }
    );
    expect(merged.a).toBe(false);
    expect(merged.b).toBe(true);
  });

  it("detects auto-only items", () => {
    expect(isAutoCheckedOnly("x", {}, { x: true })).toBe(true);
    expect(isAutoCheckedOnly("x", { x: true }, { x: true })).toBe(false);
  });
});
