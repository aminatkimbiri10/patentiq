/** OCR 100 % local dans le navigateur — Tesseract.js + PDF.js (aucune API payante) */

const MAX_OCR_PAGES = 3;
const OCR_SCALE = 1.5;

/** Copie le buffer : PDF.js peut détacher l'ArrayBuffer original au premier getDocument(). */
export function cloneArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer.slice(0);
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

async function renderPdfPageToCanvas(
  // PDF.js types are strict; on utilise le document chargé une seule fois
  doc: { getPage: (n: number) => Promise<PdfPageLike> },
  pageNum: number
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: OCR_SCALE });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const task = page.render({ canvasContext: ctx, viewport, canvas });
  await task.promise;
  return canvas;
}

type PdfPageLike = {
  getViewport: (p: { scale: number }) => { width: number; height: number };
  render: (p: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    canvas: HTMLCanvasElement;
  }) => { promise: Promise<void> };
};

async function recognizeCanvas(canvas: HTMLCanvasElement): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("fra");
  try {
    const { data } = await worker.recognize(canvas);
    return data.text?.trim() ?? "";
  } finally {
    await worker.terminate();
  }
}

export async function extractTextWithBrowserOcr(
  fileUrl: string,
  mimeType: string | null,
  onProgress?: (message: string) => void
): Promise<string> {
  onProgress?.("Téléchargement du fichier…");
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Impossible de télécharger le document");

  if (mimeType?.startsWith("image/")) {
    onProgress?.("OCR image en cours (local)…");
    const blob = await res.blob();
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("fra");
    try {
      const { data } = await worker.recognize(blob);
      return data.text?.trim() ?? "";
    } finally {
      await worker.terminate();
    }
  }

  if (mimeType === "application/pdf") {
    const raw = await res.arrayBuffer();
    const pdfData = cloneArrayBuffer(raw);
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ data: pdfData }).promise;
    const pages = Math.min(doc.numPages, MAX_OCR_PAGES);
    const parts: string[] = [];

    for (let p = 1; p <= pages; p++) {
      onProgress?.(`OCR page ${p}/${pages} (local, gratuit)…`);
      const canvas = await renderPdfPageToCanvas(
        doc as unknown as { getPage: (n: number) => Promise<PdfPageLike> },
        p
      );
      const text = await recognizeCanvas(canvas);
      if (text) parts.push(text);
    }

    return parts.join("\n\n").trim();
  }

  throw new Error("OCR disponible pour PDF et images (PNG, JPG…)");
}
