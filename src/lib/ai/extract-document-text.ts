import type { SupabaseClient } from "@supabase/supabase-js";
import {
  extractPdfTextFromBuffer,
  MAX_PDF_BYTES,
  normalizeExtractedText,
} from "@/lib/ai/extract-pdf-text";

const MAX_TEXT_CHARS = 12_000;

export type ExtractedDocument = {
  documentId: string;
  title: string;
  fileName: string;
  mimeType: string | null;
  text: string;
  source: "text" | "pdf" | "metadata";
  meta?: {
    totalPages?: number;
    pagesUsed?: number;
    truncated?: boolean;
  };
};

export async function extractDocumentText(
  admin: SupabaseClient,
  documentId: string
): Promise<ExtractedDocument | null> {
  const { data: doc } = await admin
    .from("documents")
    .select("id, title, file_name, file_path, bucket_id, mime_type, file_size, status, metadata")
    .eq("id", documentId)
    .neq("status", "deleted")
    .single();

  if (!doc) return null;

  const docMeta = doc.metadata as { ocr_text?: string; ocr_at?: string } | null;
  const base = {
    documentId: doc.id,
    title: doc.title,
    fileName: doc.file_name,
    mimeType: doc.mime_type,
  };

  if (docMeta?.ocr_text && docMeta.ocr_text.length >= 20) {
    const { text } = normalizeExtractedText(docMeta.ocr_text, MAX_TEXT_CHARS);
    return {
      ...base,
      text,
      source: "text",
      meta: { truncated: text.length < docMeta.ocr_text.length },
    };
  }

  const { data: blob, error } = await admin.storage
    .from(doc.bucket_id)
    .download(doc.file_path);

  if (error || !blob) {
    return {
      ...base,
      text: `Document : ${doc.title} (${doc.file_name}). Contenu fichier inaccessible.`,
      source: "metadata",
    };
  }

  const mime = doc.mime_type ?? "application/octet-stream";

  if (mime === "text/plain" || mime === "text/csv" || mime.startsWith("text/")) {
    const raw = await blob.text();
    const { text } = normalizeExtractedText(raw, MAX_TEXT_CHARS);
    return {
      ...base,
      mimeType: mime,
      text,
      source: "text",
    };
  }

  if (mime === "application/pdf") {
    const size = doc.file_size ?? blob.size;
    if (size > MAX_PDF_BYTES) {
      return {
        ...base,
        mimeType: mime,
        text: `PDF trop volumineux pour l'extraction automatique (${Math.round(size / 1024 / 1024)} Mo, max ${MAX_PDF_BYTES / 1024 / 1024} Mo). Utilisez un extrait TXT ou réduisez le fichier.`,
        source: "metadata",
      };
    }

    try {
      const buffer = await blob.arrayBuffer();
      const extracted = await extractPdfTextFromBuffer(buffer, MAX_TEXT_CHARS);

      if (!extracted.text || extracted.text.length < 20) {
        return {
          ...base,
          mimeType: mime,
          text: `PDF « ${doc.title} » : aucun texte extractible détecté (document scanné ou image). Uploadez une version TXT/CSV ou complétez le résumé d'invention du projet.`,
          source: "metadata",
          meta: { totalPages: extracted.totalPages, pagesUsed: extracted.pagesUsed },
        };
      }

      const notes: string[] = [];
      if (extracted.truncatedByPages) {
        notes.push(
          `Extrait : ${extracted.pagesUsed}/${extracted.totalPages} premières pages.`
        );
      }
      if (extracted.truncatedByChars) {
        notes.push("Texte tronqué pour l'analyse IA.");
      }

      const text =
        notes.length > 0
          ? `${extracted.text}\n\n[${notes.join(" ")}]`
          : extracted.text;

      return {
        ...base,
        mimeType: mime,
        text,
        source: "pdf",
        meta: {
          totalPages: extracted.totalPages,
          pagesUsed: extracted.pagesUsed,
          truncated: extracted.truncatedByPages || extracted.truncatedByChars,
        },
      };
    } catch (e) {
      console.error("[ai] PDF extraction failed:", e);
      return {
        ...base,
        mimeType: mime,
        text: `Impossible d'extraire le texte de « ${doc.file_name} ». Vérifiez que le PDF n'est pas protégé, ou fournissez une version texte.`,
        source: "metadata",
      };
    }
  }

  return {
    ...base,
    mimeType: mime,
    text: `Fichier : ${doc.title} (${doc.file_name}, ${mime}). Format non pris en charge pour l'extraction — utilisez PDF texte, CSV ou TXT.`,
    source: "metadata",
  };
}
