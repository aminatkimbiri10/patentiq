"use client";

import { FileText, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getDocumentSignedUrl, deleteDocument } from "@/lib/actions/documents";
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
}: {
  documents: Document[];
  projectId: string;
  canDelete?: boolean;
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
        description="Uploadez votre premier fichier pour démarrer le dossier."
        className="py-12"
      />
    );
  }

  return (
    <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/20 sm:flex-nowrap sm:gap-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{doc.title}</p>
            <p className="text-xs text-muted-foreground">
              {doc.file_name} · {formatSize(doc.file_size)} ·{" "}
              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: fr })}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 capitalize">
            {doc.status}
          </Badge>
          <div className="flex w-full shrink-0 justify-end gap-1 sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(doc.id)}
              title="Télécharger"
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
        </li>
      ))}
    </ul>
  );
}
