"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getDocumentSignedUrl, saveDocumentOcrText } from "@/lib/actions/documents";
import { extractTextWithBrowserOcr } from "@/lib/documents/ocr-client";

export function DocumentOcrButton({
  documentId,
  projectId,
  mimeType,
  hasOcrText,
}: {
  documentId: string;
  projectId: string;
  mimeType: string | null;
  hasOcrText?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const canOcr =
    mimeType === "application/pdf" || (mimeType?.startsWith("image/") ?? false);

  if (!canOcr) return null;

  async function runOcr() {
    setLoading(true);
    setProgress("Préparation…");
    try {
      const { url, mimeType: mime } = await getDocumentSignedUrl(documentId);
      const text = await extractTextWithBrowserOcr(url, mime, setProgress);
      if (!text || text.length < 10) {
        throw new Error("Aucun texte détecté — essayez un scan plus net ou une résolution plus élevée.");
      }
      const result = await saveDocumentOcrText(documentId, projectId, text);
      if (result.error) throw new Error(result.error);
      toast.success("Texte extrait (OCR local) — utilisable par l'IA et l'assistant");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur OCR");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-xs"
      disabled={loading}
      onClick={() => void runOcr()}
      title="OCR gratuit dans votre navigateur (Tesseract) — aucune API externe"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ScanText className="h-3.5 w-3.5" />
      )}
      {loading ? progress ?? "OCR…" : hasOcrText ? "Re-OCR" : "OCR local"}
    </Button>
  );
}
