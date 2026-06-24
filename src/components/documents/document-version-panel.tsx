"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, ChevronUp, Download, History, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  getDocumentVersionHistory,
  getDocumentVersionSignedUrl,
  uploadDocumentVersion,
  type DocumentActionState,
  type DocumentVersionHistory,
} from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALLOWED_UPLOAD_MIME } from "@/config/constants";
import type { Document } from "@/types/database";

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function VersionSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Envoi…" : "Publier la version"}
    </Button>
  );
}

export function DocumentVersionPanel({
  doc,
  projectId,
  canUploadVersion = true,
}: {
  doc: Document;
  projectId: string;
  canUploadVersion?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<DocumentVersionHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [state, formAction] = useFormState(uploadDocumentVersion, {} as DocumentActionState);

  async function loadHistory() {
    if (history) return;
    setLoading(true);
    try {
      const data = await getDocumentVersionHistory(doc.id);
      setHistory(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur chargement historique");
    } finally {
      setLoading(false);
    }
  }

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) await loadHistory();
  }

  async function handleVersionDownload(versionNumber: number) {
    try {
      const { url } = await getDocumentVersionSignedUrl(doc.id, versionNumber);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur téléchargement");
    }
  }

  useEffect(() => {
    if (state?.success) {
      toast.success("Nouvelle version publiée");
      window.location.reload();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  const pastVersions = history?.versions ?? [];
  const hasHistory = doc.version_number > 1 || pastVersions.length > 0;

  return (
    <div className="w-full border-t border-border/40 pt-3 mt-3">
      <button
        type="button"
        onClick={() => void toggleOpen()}
        className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5" />
          Versions ({doc.version_number})
          {hasHistory && " · historique disponible"}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {loading && (
            <p className="text-xs text-muted-foreground">Chargement de l&apos;historique…</p>
          )}

          {!loading && (
            <ul className="space-y-2 rounded-lg border border-border/60 bg-muted/10 p-3">
              <li className="flex items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-medium text-foreground">
                    v{doc.version_number} (actuelle)
                  </span>
                  <span className="ml-2 text-muted-foreground">{doc.file_name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleVersionDownload(doc.version_number)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </li>
              {pastVersions.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-medium">v{v.version_number}</span>
                    <span className="ml-2 truncate text-muted-foreground">{v.file_name}</span>
                    <span className="ml-2 text-muted-foreground">
                      · {formatSize(v.file_size)} ·{" "}
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true, locale: fr })}
                    </span>
                    {v.profiles?.full_name && (
                      <span className="ml-1 text-muted-foreground">— {v.profiles.full_name}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleVersionDownload(v.version_number)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
              {!hasHistory && pastVersions.length === 0 && (
                <li className="text-xs text-muted-foreground">Première version du document.</li>
              )}
            </ul>
          )}

          {canUploadVersion && (
            <form action={formAction} className="space-y-3 rounded-lg border border-dashed border-border/80 p-3">
              <input type="hidden" name="document_id" value={doc.id} />
              <input type="hidden" name="project_id" value={projectId} />
              <div className="flex items-center gap-2 text-xs font-medium">
                <Upload className="h-3.5 w-3.5 text-primary" />
                Nouvelle version
              </div>
              <div className="space-y-2">
                <Label htmlFor={`file-${doc.id}`} className="text-xs">
                  Fichier
                </Label>
                <Input
                  id={`file-${doc.id}`}
                  type="file"
                  name="file"
                  accept={ALLOWED_UPLOAD_MIME.join(",")}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`note-${doc.id}`} className="text-xs">
                  Note de modification (optionnel)
                </Label>
                <Input
                  id={`note-${doc.id}`}
                  name="change_note"
                  placeholder="Ex. Corrections suite à la revue CPI"
                  className="h-9 text-xs"
                />
              </div>
              <VersionSubmitButton />
            </form>
          )}
        </div>
      )}
    </div>
  );
}
