import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";

export type DashboardDocumentRow = {
  id: string;
  title: string;
  file_name: string;
  mime_type: string | null;
  status: string;
  updated_at: string;
  projectTitle: string;
  href: string;
  hasAiSummary: boolean;
};

function mimeShort(mime: string | null): string {
  if (!mime) return "Fichier";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word")) return "Word";
  if (mime.includes("image")) return "Image";
  if (mime.includes("csv")) return "CSV";
  return mime.split("/").pop()?.toUpperCase() ?? "Fichier";
}

export function DashboardDocumentsPanel({
  documents,
  actionHref,
}: {
  documents: DashboardDocumentRow[];
  actionHref: string;
}) {
  return (
    <DashboardSection
      title="Documents récents"
      description="Dernières pièces déposées sur vos dossiers"
      icon={FileText}
      actionHref={actionHref}
    >
      {!documents.length ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Uploadez des pièces depuis un dossier pour les retrouver ici."
          className="rounded-none border-0 bg-transparent py-10"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={doc.href}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/25"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{doc.title || doc.file_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{doc.projectTitle}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {mimeShort(doc.mime_type)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {doc.status === "active" ? "Actif" : doc.status}
                    </Badge>
                    {doc.hasAiSummary && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400">
                        <Sparkles className="h-3 w-3" />
                        Synthèse IA
                      </span>
                    )}
                  </div>
                </div>
                <time className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true, locale: fr })}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
