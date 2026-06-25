import { describe, it, expect, vi } from "vitest";
import JSZip from "jszip";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildProjectZipBuffer } from "@/lib/export/load-project-zip";

function mockSupabaseForZip(projectId: string) {
  const project = {
    title: "Gourde filtrante",
    reference_code: "PI-DEMO-001",
    invention_summary: "Filtration portable",
    need_description: "Protection brevet MA",
    status: "in_review",
    categories: { name: "Brevet d'invention", slug: "brevet" },
  };

  const chain = (result: unknown) => {
    const self = {
      eq: () => self,
      order: () => self,
      limit: () => self,
      single: async () => result,
      maybeSingle: async () => result,
      then: (
        onFulfilled: (value: unknown) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(result).then(onFulfilled, onRejected),
    };
    return self;
  };

  return {
    from: vi.fn((table: string) => {
      if (table === "projects") {
        return { select: () => chain({ data: project, error: null }) };
      }
      if (table === "documents") {
        return {
          select: () => chain({ data: [], error: null }),
        };
      }
      if (table === "ai_searches") {
        return {
          select: () =>
            chain({
              data: [
                {
                  id: "search-abc12345",
                  search_type: "novelty",
                  status: "completed",
                  query: "filtration eau",
                  created_at: "2026-06-01T00:00:00Z",
                  completed_at: "2026-06-01T00:05:00Z",
                  error_message: null,
                  metadata: { summary: "Synthèse test antériorité." },
                },
              ],
              error: null,
            }),
        };
      }
      if (table === "patent_drafts" || table === "patent_claims_drafts") {
        return { select: () => chain({ data: null, error: null }) };
      }
      if (table === "ai_results") {
        return {
          select: () =>
            chain({
              data: [{ title: "Brevet similaire", summary: "Test", score: 0.8, rank: 1, source_ref: "EP1", payload: {} }],
              error: null,
            }),
        };
      }
      return { select: () => chain({ data: null, error: null }) };
    }),
    storage: {
      from: () => ({
        download: async () => ({ data: null, error: new Error("skip") }),
      }),
    },
  } as unknown as SupabaseClient;
}

describe("buildProjectZipBuffer", () => {
  it("returns 404 when project missing", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "not found" } }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;

    const result = await buildProjectZipBuffer(supabase, "missing-id");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
  });

  it("builds zip with manifest and analyses when IA present", async () => {
    const projectId = "11111111-1111-1111-1111-111111111111";
    const result = await buildProjectZipBuffer(mockSupabaseForZip(projectId), projectId);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.filename).toMatch(/^i2pa-Gourde-filtrante\.zip$/);

    const zip = await JSZip.loadAsync(result.buffer);
    expect(zip.file("README.txt")).toBeTruthy();
    expect(zip.file("manifest.json")).toBeTruthy();

    const manifest = JSON.parse((await zip.file("manifest.json")!.async("string")) as string);
    expect(manifest.title).toBe("Gourde filtrante");
    expect(manifest.category_slug).toBe("brevet");
    expect(manifest.ai_search_count).toBe(1);

    const aiFiles = Object.keys(zip.files).filter((f) => f.startsWith("analyses-ia/") && f.endsWith(".pdf"));
    expect(aiFiles.length).toBe(1);

    const pdfBytes = await zip.file(aiFiles[0])!.async("uint8array");
    expect(Buffer.from(pdfBytes.subarray(0, 4)).toString()).toBe("%PDF");
  });
});
