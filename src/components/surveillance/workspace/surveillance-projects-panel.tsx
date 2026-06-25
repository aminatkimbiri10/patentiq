import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { FolderKanban } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { SurveillanceProjectRow } from "@/lib/surveillance/context-data";

export function SurveillanceProjectsPanel({ projects }: { projects: SurveillanceProjectRow[] }) {
  return (
    <DashboardSection
      title="Projets sous surveillance"
      description="Dossiers liés à votre portefeuille PI"
      icon={FolderKanban}
    >
      {!projects.length ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet lié"
          description="Associez un actif à un dossier lors de l'ajout au portefeuille."
          className="rounded-none border-0 bg-transparent py-8"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={project.href}
                className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{project.title}</p>
                  {project.reference_code && (
                    <p className="text-xs text-muted-foreground">{project.reference_code}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {project.watchCount} actif{project.watchCount !== 1 ? "s" : ""}
                  </Badge>
                  {project.lastScanAt && (
                    <time className="text-[11px] text-muted-foreground">
                      Scan{" "}
                      {formatDistanceToNow(new Date(project.lastScanAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </time>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
