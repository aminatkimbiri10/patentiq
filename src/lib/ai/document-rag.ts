import type { SupabaseClient } from "@supabase/supabase-js";
import { extractDocumentText } from "@/lib/ai/extract-document-text";

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 120;

function normalizeTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëïîôùûüç\s-]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    chunks.push(cleaned.slice(start, start + chunkSize));
    if (start + chunkSize >= cleaned.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
}

export function scoreChunk(chunk: string, queryTerms: string[]): number {
  if (!queryTerms.length) return 0;
  const hay = chunk.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    if (hay.includes(term)) score += 1;
  }
  return score;
}

/** RAG léger — recherche par mots-clés dans les documents du dossier (sans embeddings). */
export async function retrieveRelevantDocumentChunks(
  admin: SupabaseClient,
  projectId: string,
  query: string,
  limit = 3
): Promise<{ title: string; excerpt: string; score: number }[]> {
  const terms = normalizeTerms(query);
  if (!terms.length) return [];

  const { data: docs } = await admin
    .from("documents")
    .select("id, title, mime_type, metadata")
    .eq("project_id", projectId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  const scored: { title: string; excerpt: string; score: number }[] = [];

  for (const doc of docs ?? []) {
    const meta = doc.metadata as { ocr_text?: string } | null;
    let text = meta?.ocr_text?.trim() ?? "";

    if (!text || text.length < 40) {
      const extracted = await extractDocumentText(admin, doc.id);
      if (extracted?.text && extracted.text.length > 30) {
        text = extracted.text;
      }
    }

    if (!text) continue;

    for (const chunk of chunkText(text)) {
      const score = scoreChunk(chunk, terms);
      if (score > 0) {
        scored.push({
          title: doc.title as string,
          excerpt: chunk.slice(0, 700),
          score,
        });
      }
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
