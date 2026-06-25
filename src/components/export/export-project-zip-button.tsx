"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExportProjectZipButton({
  projectId,
  variant = "outline" as const,
  size = "sm" as const,
}: {
  projectId: string;
  variant?: "outline" | "secondary" | "default";
  size?: "sm" | "default";
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/export-zip`);
      if (!res.ok) {
        let message = "Export ZIP impossible";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          if (res.status === 500) {
            message = "Erreur serveur — redemarrez npm run dev puis reessayez.";
          }
        }
        toast.error(message);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "i2pa-dossier.zip";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dossier ZIP téléchargé");
    } catch {
      toast.error("Erreur réseau lors de l'export ZIP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size={size} disabled={loading} onClick={handleExport}>
      <Archive className="mr-1.5 h-4 w-4" />
      {loading ? "Export…" : "Export ZIP dossier"}
    </Button>
  );
}
