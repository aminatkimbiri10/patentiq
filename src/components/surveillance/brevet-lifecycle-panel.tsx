"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { CalendarClock, ExternalLink } from "lucide-react";
import { updateBrevetLifecycle, type BrevetLifecycleActionState } from "@/lib/actions/brevet-lifecycle";
import {
  BREVET_LIFECYCLE_LABELS,
  BREVET_LIFECYCLE_ORDER,
  OMPIC_BREVET_LINKS,
  type BrevetLifecycleState,
} from "@/lib/workflow/brevet-lifecycle";
import { WatchlistForm } from "@/components/surveillance/watchlist-form";
import { PiLifecycleStepper } from "@/components/surveillance/pi-parcours/pi-lifecycle-stepper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BrevetLifecyclePanel({
  projectId,
  lifecycle,
  projectTitle,
  canEdit,
}: {
  projectId: string;
  lifecycle: BrevetLifecycleState;
  projectTitle?: string;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useFormState(
    updateBrevetLifecycle,
    {} as BrevetLifecycleActionState
  );

  return (
    <div className="space-y-5">
      <div className="enterprise-panel overflow-hidden">
        <div className="enterprise-panel-header bg-muted/20">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Cycle brevet national</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Dépôt → examen → publication (~<strong>18 mois</strong>) → délivrance → surveillance.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <PiLifecycleStepper
            order={BREVET_LIFECYCLE_ORDER}
            labels={BREVET_LIFECYCLE_LABELS}
            current={lifecycle.status}
          />

          {lifecycle.publication_deadline_at && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              Publication prévue :{" "}
              {new Date(lifecycle.publication_deadline_at).toLocaleDateString("fr-FR")}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["Dépôt en ligne", OMPIC_BREVET_LINKS.depot],
                ["Publications brevets", OMPIC_BREVET_LINKS.publication],
                ["Registre", OMPIC_BREVET_LINKS.registre],
              ] as const
            ).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-primary hover:bg-muted/40"
              >
                {label}
                <ExternalLink className="h-3 w-3" />
              </Link>
            ))}
          </div>

          {canEdit && (
            <form action={formAction} className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
              <input type="hidden" name="project_id" value={projectId} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brevet-status">Statut actuel</Label>
                  <select
                    id="brevet-status"
                    name="status"
                    defaultValue={lifecycle.status}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {BREVET_LIFECYCLE_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {BREVET_LIFECYCLE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="brevet-notes">Notes CPI</Label>
                  <Textarea
                    id="brevet-notes"
                    name="notes"
                    rows={2}
                    defaultValue={lifecycle.notes ?? ""}
                    placeholder="Examen, délais, décisions…"
                  />
                </div>
              </div>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              {state.success && <p className="text-sm text-green-600">{state.message}</p>}
              <Button type="submit" size="sm" disabled={pending}>
                Mettre à jour le cycle brevet
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

      {lifecycle.status === "surveillance_active" && (
        <WatchlistForm
          projectId={projectId}
          defaultTitle={projectTitle}
          defaultAssetType="patent"
        />
      )}
    </div>
  );
}
