"use client";

import { useFormState } from "react-dom";
import { CalendarClock } from "lucide-react";
import { updateMarqueLifecycle, type MarqueLifecycleActionState } from "@/lib/actions/marque-lifecycle";
import {
  MARQUE_LIFECYCLE_LABELS,
  MARQUE_LIFECYCLE_ORDER,
  type MarqueLifecycleState,
} from "@/lib/workflow/marque-lifecycle";
import { PiLifecycleStepper } from "@/components/surveillance/pi-parcours/pi-lifecycle-stepper";
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
    <div className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header bg-muted/20">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cycle marque OMPIC</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Dépôt → publication <strong>2 mois</strong> (oppositions) → enregistrement → surveillance.
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <PiLifecycleStepper
          order={MARQUE_LIFECYCLE_ORDER}
          labels={MARQUE_LIFECYCLE_LABELS}
          current={lifecycle.status}
        />

        {(lifecycle.published_at || lifecycle.opposition_deadline_at) && (
          <div className="flex flex-wrap gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              {lifecycle.published_at &&
                `Publié le ${new Date(lifecycle.published_at).toLocaleDateString("fr-FR")}`}
              {lifecycle.opposition_deadline_at &&
                ` · fin opposition ${new Date(lifecycle.opposition_deadline_at).toLocaleDateString("fr-FR")}`}
            </span>
          </div>
        )}

        {canEdit && (
          <form action={formAction} className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
            <input type="hidden" name="project_id" value={projectId} />
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="marque-notes">Notes CPI</Label>
                <Textarea
                  id="marque-notes"
                  name="notes"
                  rows={2}
                  defaultValue={lifecycle.notes ?? ""}
                  placeholder="Décisions, délais, éléments de contexte…"
                />
              </div>
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.success && <p className="text-sm text-green-600">{state.message}</p>}
            <Button type="submit" disabled={pending} size="sm">
              Mettre à jour le cycle marque
            </Button>
          </form>
        )}

        {!canEdit && lifecycle.notes && (
          <p className="rounded-lg border border-border/60 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes CPI : </span>
            {lifecycle.notes}
          </p>
        )}
      </div>
    </div>
  );
}
