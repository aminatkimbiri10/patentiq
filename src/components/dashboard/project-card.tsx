import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import type { Project } from "@/types/database";

export function ProjectCard({
  project,
  href,
}: {
  project: Project;
  href?: string;
}) {
  const link = href ?? `/dashboard/projects/${project.id}`;

  return (
    <Link href={link} className="group block h-full">
      <article className="card-elevated flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {project.reference_code}
            </p>
            <h3 className="mt-1 line-clamp-2 font-semibold leading-snug group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        {project.description && (
          <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
          <ProjectStatusBadge status={project.status} />
        </div>
      </article>
    </Link>
  );
}
