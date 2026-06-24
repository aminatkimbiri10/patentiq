export type BrevetLifecycleStatus =
  | "depose"
  | "examen"
  | "en_attente_publication"
  | "publie"
  | "accorde"
  | "surveillance_active";

export const BREVET_LIFECYCLE_LABELS: Record<BrevetLifecycleStatus, string> = {
  depose: "Déposé",
  examen: "Examen en cours",
  en_attente_publication: "En attente publication (18 mois)",
  publie: "Publié",
  accorde: "Accordé / délivré",
  surveillance_active: "Surveillance active",
};

export const BREVET_LIFECYCLE_ORDER: BrevetLifecycleStatus[] = [
  "depose",
  "examen",
  "en_attente_publication",
  "publie",
  "accorde",
  "surveillance_active",
];

export type BrevetLifecycleState = {
  status: BrevetLifecycleStatus;
  deposited_at?: string | null;
  publication_deadline_at?: string | null;
  published_at?: string | null;
  granted_at?: string | null;
  notes?: string | null;
};

const VALID: BrevetLifecycleStatus[] = [
  "depose",
  "examen",
  "en_attente_publication",
  "publie",
  "accorde",
  "surveillance_active",
];

export function parseBrevetLifecycle(metadata: unknown): BrevetLifecycleState | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const raw = m.brevet_lifecycle;
  if (!raw || typeof raw !== "object") return null;
  const lc = raw as Record<string, unknown>;
  const status = lc.status;
  if (!VALID.includes(status as BrevetLifecycleStatus)) return null;
  return {
    status: status as BrevetLifecycleStatus,
    deposited_at: typeof lc.deposited_at === "string" ? lc.deposited_at : null,
    publication_deadline_at:
      typeof lc.publication_deadline_at === "string" ? lc.publication_deadline_at : null,
    published_at: typeof lc.published_at === "string" ? lc.published_at : null,
    granted_at: typeof lc.granted_at === "string" ? lc.granted_at : null,
    notes: typeof lc.notes === "string" ? lc.notes : null,
  };
}

export function defaultBrevetLifecycle(): BrevetLifecycleState {
  return { status: "depose" };
}

/** Délai légal typique avant publication au Maroc : 18 mois après dépôt */
export function computePublicationDeadline(depositedAt: string): string {
  const d = new Date(depositedAt);
  d.setMonth(d.getMonth() + 18);
  return d.toISOString();
}

export const OMPIC_BREVET_LINKS = {
  depot: "https://directompic.ma",
  publication: "https://patent.ompic.ma",
  registre: "https://patentregister.ompic.ma",
} as const;
