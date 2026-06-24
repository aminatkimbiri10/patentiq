"use client";

import { FileText, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getDocumentSignedUrl, deleteDocument } from "@/lib/actions/documents";
import { DocumentVersionPanel } from "@/components/documents/document-version-panel";
import { DocumentOcrButton } from "@/components/documents/document-ocr-button";
import type { Document } from "@/types/database";

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentList({
  documents,
  projectId,
  canDelete = true,
  canUploadVersion = true,
}: {
  documents: Document[];
  projectId: string;
  canDelete?: boolean;
  canUploadVersion?: boolean;
}) {
  async function handleDownload(id: string) {
    try {
      const { url } = await getDocumentSignedUrl(id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur téléchargement");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await deleteDocument(id, projectId);
      toast.success("Document supprimé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur suppression");
    }
  }

  if (!documents.length) {
    return (
      <EmptyState
        icon={FileText}
        title="Aucun document"
        description="Glissez un PDF, TXT ou image dans la zone ci-dessus. Les scans peuvent être lus via OCR local (gratuit)."
        className="py-12"
      />
    );
  }

  return (
    <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
      {documents.map((doc) => {
        const ocrText = (doc.metadata as { ocr_text?: string } | null)?.ocr_text;
        return (
        <li
          key={doc.id}
          className="px-4 py-4 transition-colors hover:bg-muted/20"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{doc.title}</p>
              <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(doc.file_size)} ·{" "}
                {formatDistanceToNow(new Date(doc.updated_at ?? doc.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {doc.version_number > 1 && (
                <Badge variant="secondary" className="text-[10px]">
                  v{doc.version_number}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {doc.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 sm:ml-auto sm:justify-end">
              <DocumentOcrButton
                documentId={doc.id}
                projectId={projectId}
                mimeType={doc.mime_type}
                hasOcrText={!!ocrText}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(doc.id)}
                title="Télécharger (version actuelle)"
                className="h-9 w-9"
              >
                <Download className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(doc.id)}
                  title="Supprimer"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {ocrText && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Texte OCR disponible pour l&apos;IA ({ocrText.length} car.)
            </p>
          )}
          <DocumentVersionPanel
            doc={doc}
            projectId={projectId}
            canUploadVersion={canUploadVersion}
          />
        </li>
        );
      })}
    </ul>
  );
}
