import Link from "next/link";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import type { ProjectStatus } from "@/types/database";

export function ProjectCard({
  project,
  href,
  compact = false,
}: {
  project: {
    id: string;
    title: string;
    reference_code: string | null;
    description: string | null;
    status: ProjectStatus;
  };
  href?: string;
  compact?: boolean;
}) {
  const link = href ?? `/dashboard/projects/${project.id}`;

  return (
    <tr className="group transition-colors hover:bg-muted/40">
      <td className="font-mono text-xs text-muted-foreground">
        {project.reference_code ?? "—"}
      </td>
      <td>
        <Link
          href={link}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {project.title}
        </Link>
        {project.description && !compact && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {project.description}
          </p>
        )}
      </td>
      <td>
        <ProjectStatusBadge status={project.status} />
      </td>
      <td className="text-right">
        <Link href={link} className="text-xs font-medium text-primary hover:underline">
          Ouvrir
        </Link>
      </td>
    </tr>
  );
}

export function ProjectTable({
  projects,
  hrefFor,
  embedded = false,
}: {
  projects: {
    id: string;
    title: string;
    reference_code: string | null;
    description: string | null;
    status: ProjectStatus;
  }[];
  hrefFor?: (id: string) => string;
  embedded?: boolean;
}) {
  const table = (
      <table className="enterprise-table">
        <thead>
          <tr>
            <th className="w-[120px]">Réf.</th>
            <th>Dossier</th>
            <th className="w-[140px]">Statut</th>
            <th className="w-[80px] text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} href={hrefFor?.(p.id)} compact />
          ))}
        </tbody>
      </table>
  );

  if (embedded) {
    return <div className="table-scroll">{table}</div>;
  }

  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="table-scroll">{table}</div>
    </div>
  );
}
