export type MarqueLifecycleStatus =
  | "depose"
  | "publie"
  | "opposition_ouverte"
  | "enregistre"
  | "surveillance_active";

export const MARQUE_LIFECYCLE_LABELS: Record<MarqueLifecycleStatus, string> = {
  depose: "Déposé",
  publie: "Publié (2 mois)",
  opposition_ouverte: "Opposition ouverte",
  enregistre: "Enregistré",
  surveillance_active: "Surveillance active",
};

export const MARQUE_LIFECYCLE_ORDER: MarqueLifecycleStatus[] = [
  "depose",
  "publie",
  "opposition_ouverte",
  "enregistre",
  "surveillance_active",
];

export type MarqueLifecycleState = {
  status: MarqueLifecycleStatus;
  published_at?: string | null;
  opposition_deadline_at?: string | null;
  registered_at?: string | null;
  notes?: string | null;
};

export function parseMarqueLifecycle(metadata: unknown): MarqueLifecycleState | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const raw = m.marque_lifecycle;
  if (!raw || typeof raw !== "object") return null;
  const lc = raw as Record<string, unknown>;
  const status = lc.status;
  if (
    status !== "depose" &&
    status !== "publie" &&
    status !== "opposition_ouverte" &&
    status !== "enregistre" &&
    status !== "surveillance_active"
  ) {
    return null;
  }
  return {
    status,
    published_at: typeof lc.published_at === "string" ? lc.published_at : null,
    opposition_deadline_at:
      typeof lc.opposition_deadline_at === "string" ? lc.opposition_deadline_at : null,
    registered_at: typeof lc.registered_at === "string" ? lc.registered_at : null,
    notes: typeof lc.notes === "string" ? lc.notes : null,
  };
}

export function defaultMarqueLifecycle(): MarqueLifecycleState {
  return { status: "depose" };
}

export function computeOppositionDeadline(publishedAt: string): string {
  const d = new Date(publishedAt);
  d.setMonth(d.getMonth() + 2);
  return d.toISOString();
}

export {
  isMarqueCategory,
  isBrevetCategory,
  isDesignCategory,
} from "@/lib/workflow/category-slugs";
