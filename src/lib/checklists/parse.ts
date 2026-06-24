export type ProjectChecklistState = {
  checked: Record<string, boolean>;
  dismissed_auto?: Record<string, boolean>;
  updated_at?: string;
  updated_by?: string;
};

export function parseProjectChecklist(metadata: unknown): ProjectChecklistState {
  if (!metadata || typeof metadata !== "object") return { checked: {} };
  const raw = (metadata as Record<string, unknown>).checklist;
  if (!raw || typeof raw !== "object") return { checked: {} };
  const checklist = raw as Record<string, unknown>;
  const checked =
    checklist.checked && typeof checklist.checked === "object"
      ? (checklist.checked as Record<string, boolean>)
      : {};
  const dismissed_auto =
    checklist.dismissed_auto && typeof checklist.dismissed_auto === "object"
      ? (checklist.dismissed_auto as Record<string, boolean>)
      : undefined;
  return {
    checked,
    dismissed_auto,
    updated_at: typeof checklist.updated_at === "string" ? checklist.updated_at : undefined,
    updated_by: typeof checklist.updated_by === "string" ? checklist.updated_by : undefined,
  };
}

export function checklistProgress(
  itemIds: string[],
  state: ProjectChecklistState
): { done: number; total: number; percent: number } {
  const total = itemIds.length;
  const done = itemIds.filter((id) => state.checked[id]).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}
