import { extractText, getDocumentProxy } from "unpdf";

/** Limite mémoire / temps de parsing (aligné upload courant) */
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

/** Nombre max de pages extraites pour les gros dossiers */
export const MAX_PDF_PAGES = 40;

export type PdfExtractResult = {
  text: string;
  totalPages: number;
  pagesUsed: number;
  truncatedByPages: boolean;
  truncatedByChars: boolean;
};

export function normalizeExtractedText(
  raw: string,
  maxChars: number
): { text: string; truncatedByChars: boolean } {
  const normalized = raw.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) {
    return { text: normalized, truncatedByChars: false };
  }
  return {
    text: `${normalized.slice(0, maxChars)}…`,
    truncatedByChars: true,
  };
}

export async function extractPdfTextFromBuffer(
  buffer: ArrayBuffer,
  maxChars: number
): Promise<PdfExtractResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text: pageTexts } = await extractText(pdf, {
    mergePages: false,
  });

  const pagesUsed = Math.min(totalPages, MAX_PDF_PAGES);
  const merged = pageTexts.slice(0, pagesUsed).join("\n\n");
  const { text, truncatedByChars } = normalizeExtractedText(merged, maxChars);

  return {
    text,
    totalPages,
    pagesUsed,
    truncatedByPages: totalPages > pagesUsed,
    truncatedByChars,
  };
}
