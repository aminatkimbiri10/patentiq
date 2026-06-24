"use client";

import { useFormState } from "react-dom";
import { updateMarqueLifecycle, type MarqueLifecycleActionState } from "@/lib/actions/marque-lifecycle";
import {
  MARQUE_LIFECYCLE_LABELS,
  MARQUE_LIFECYCLE_ORDER,
  type MarqueLifecycleState,
} from "@/lib/workflow/marque-lifecycle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MarqueLifecyclePanel({
  projectId,
  lifecycle,
  canEdit,
}: {
  projectId: string;
  lifecycle: MarqueLifecycleState;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useFormState(
    updateMarqueLifecycle,
    {} as MarqueLifecycleActionState
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cycle marque OMPIC : dépôt → publication <strong>2 mois</strong> (oppositions) →
        enregistrement (~4 mois) → surveillance catalogue.
      </p>

      <div className="flex flex-wrap gap-2">
        {MARQUE_LIFECYCLE_ORDER.map((step) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              lifecycle.status === step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {MARQUE_LIFECYCLE_LABELS[step]}
          </span>
        ))}
      </div>

      {lifecycle.published_at && (
        <p className="text-xs text-muted-foreground">
          Publié le {new Date(lifecycle.published_at).toLocaleDateString("fr-FR")}
          {lifecycle.opposition_deadline_at &&
            ` — fin opposition : ${new Date(lifecycle.opposition_deadline_at).toLocaleDateString("fr-FR")}`}
        </p>
      )}

      {canEdit && (
        <form action={formAction} className="space-y-4 rounded-xl border p-4">
          <input type="hidden" name="project_id" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="marque-status">Étape actuelle</Label>
            <select
              id="marque-status"
              name="status"
              defaultValue={lifecycle.status}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {MARQUE_LIFECYCLE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {MARQUE_LIFECYCLE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marque-notes">Notes CPI</Label>
            <Textarea
              id="marque-notes"
              name="notes"
              rows={2}
              defaultValue={lifecycle.notes ?? ""}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">{state.message}</p>}
          <Button type="submit" disabled={pending} size="sm">
            Mettre à jour le cycle marque
          </Button>
        </form>
      )}
    </div>
  );
}
