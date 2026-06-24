export type DesignLifecycleStatus =
  | "depose"
  | "examen"
  | "publie"
  | "enregistre"
  | "surveillance_active";

export const DESIGN_LIFECYCLE_LABELS: Record<DesignLifecycleStatus, string> = {
  depose: "Déposé",
  examen: "Examen formel",
  publie: "Publié (registre)",
  enregistre: "Enregistré / protégé",
  surveillance_active: "Surveillance active",
};

export const DESIGN_LIFECYCLE_ORDER: DesignLifecycleStatus[] = [
  "depose",
  "examen",
  "publie",
  "enregistre",
  "surveillance_active",
];

export type DesignLifecycleState = {
  status: DesignLifecycleStatus;
  deposited_at?: string | null;
  published_at?: string | null;
  registered_at?: string | null;
  notes?: string | null;
};

const VALID: DesignLifecycleStatus[] = [
  "depose",
  "examen",
  "publie",
  "enregistre",
  "surveillance_active",
];

export function parseDesignLifecycle(metadata: unknown): DesignLifecycleState | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const raw = m.design_lifecycle;
  if (!raw || typeof raw !== "object") return null;
  const lc = raw as Record<string, unknown>;
  const status = lc.status;
  if (!VALID.includes(status as DesignLifecycleStatus)) return null;
  return {
    status: status as DesignLifecycleStatus,
    deposited_at: typeof lc.deposited_at === "string" ? lc.deposited_at : null,
    published_at: typeof lc.published_at === "string" ? lc.published_at : null,
    registered_at: typeof lc.registered_at === "string" ? lc.registered_at : null,
    notes: typeof lc.notes === "string" ? lc.notes : null,
  };
}

export function defaultDesignLifecycle(): DesignLifecycleState {
  return { status: "depose" };
}

export const OMPIC_DESIGN_LINKS = {
  depot: "https://directompic.ma",
  portal: "https://www.ompic.ma",
} as const;
