import {
  parseMarqueLifecycle,
  type MarqueLifecycleState,
} from "@/lib/workflow/marque-lifecycle";
import {
  parseBrevetLifecycle,
  type BrevetLifecycleState,
} from "@/lib/workflow/brevet-lifecycle";

export type IpDeadlineKind = "marque_opposition" | "brevet_publication";

export type IpDeadlineUrgency = "overdue" | "critical" | "soon" | "ok";

export type IpDeadline = {
  projectId: string;
  projectTitle: string;
  referenceCode: string | null;
  categorySlug: string | null;
  kind: IpDeadlineKind;
  label: string;
  deadlineAt: string;
  daysRemaining: number;
  urgency: IpDeadlineUrgency;
  section: "marque-cycle" | "brevet-cycle";
};

export type ProjectDeadlineInput = {
  id: string;
  title: string;
  reference_code?: string | null;
  metadata?: unknown;
  categories?: { slug: string } | { slug: string }[] | null;
};

export function daysUntil(isoDate: string, from = new Date()): number {
  const end = new Date(isoDate);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

export function classifyDeadlineUrgency(daysRemaining: number): IpDeadlineUrgency {
  if (daysRemaining < 0) return "overdue";
  if (daysRemaining <= 7) return "critical";
  if (daysRemaining <= 30) return "soon";
  return "ok";
}

function categorySlugFromProject(
  categories: ProjectDeadlineInput["categories"]
): string | null {
  if (!categories) return null;
  const c = Array.isArray(categories) ? categories[0] : categories;
  return c?.slug ?? null;
}

function marqueDeadline(
  project: ProjectDeadlineInput,
  lc: MarqueLifecycleState
): IpDeadline | null {
  const at = lc.opposition_deadline_at;
  if (!at) return null;
  if (
    lc.status === "depose" ||
    lc.status === "enregistre" ||
    lc.status === "surveillance_active"
  ) {
    return null;
  }

  const daysRemaining = daysUntil(at);
  return {
    projectId: project.id,
    projectTitle: project.title,
    referenceCode: project.reference_code ?? null,
    categorySlug: categorySlugFromProject(project.categories) ?? "marque",
    kind: "marque_opposition",
    label: "Fin délai opposition (2 mois)",
    deadlineAt: at,
    daysRemaining,
    urgency: classifyDeadlineUrgency(daysRemaining),
    section: "marque-cycle",
  };
}

function brevetDeadline(
  project: ProjectDeadlineInput,
  lc: BrevetLifecycleState
): IpDeadline | null {
  const at = lc.publication_deadline_at;
  if (!at) return null;
  if (
    lc.status === "publie" ||
    lc.status === "accorde" ||
    lc.status === "surveillance_active"
  ) {
    return null;
  }

  const daysRemaining = daysUntil(at);
  return {
    projectId: project.id,
    projectTitle: project.title,
    referenceCode: project.reference_code ?? null,
    categorySlug: categorySlugFromProject(project.categories) ?? "brevet",
    kind: "brevet_publication",
    label: "Publication prévue (18 mois)",
    deadlineAt: at,
    daysRemaining,
    urgency: classifyDeadlineUrgency(daysRemaining),
    section: "brevet-cycle",
  };
}

export function extractIpDeadlinesFromProject(
  project: ProjectDeadlineInput
): IpDeadline[] {
  const out: IpDeadline[] = [];
  const marque = parseMarqueLifecycle(project.metadata);
  const brevet = parseBrevetLifecycle(project.metadata);

  if (marque) {
    const d = marqueDeadline(project, marque);
    if (d) out.push(d);
  }
  if (brevet) {
    const d = brevetDeadline(project, brevet);
    if (d) out.push(d);
  }
  return out;
}

export function collectIpDeadlines(projects: ProjectDeadlineInput[]): IpDeadline[] {
  return projects
    .flatMap(extractIpDeadlinesFromProject)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function deadlineKey(deadline: Pick<IpDeadline, "projectId" | "kind" | "deadlineAt">): string {
  return `${deadline.projectId}:${deadline.kind}:${deadline.deadlineAt.slice(0, 10)}`;
}

export function shouldRemindDeadline(daysRemaining: number): boolean {
  return daysRemaining <= 30;
}

export function reminderBody(deadline: IpDeadline): string {
  if (deadline.daysRemaining < 0) {
    return `Échéance dépassée de ${Math.abs(deadline.daysRemaining)} jour(s) — ${deadline.label} (${deadline.projectTitle}).`;
  }
  if (deadline.daysRemaining === 0) {
    return `Échéance aujourd'hui — ${deadline.label} (${deadline.projectTitle}).`;
  }
  return `${deadline.label} dans ${deadline.daysRemaining} jour(s) — ${deadline.projectTitle}.`;
}
