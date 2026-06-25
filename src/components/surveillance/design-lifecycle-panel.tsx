"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { CalendarClock, ExternalLink } from "lucide-react";
import {
  updateDesignLifecycle,
  type DesignLifecycleActionState,
} from "@/lib/actions/design-lifecycle";
import {
  DESIGN_LIFECYCLE_LABELS,
  DESIGN_LIFECYCLE_ORDER,
  OMPIC_DESIGN_LINKS,
  type DesignLifecycleState,
} from "@/lib/workflow/design-lifecycle";
import { PiLifecycleStepper } from "@/components/surveillance/pi-parcours/pi-lifecycle-stepper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DesignLifecyclePanel({
  projectId,
  lifecycle,
  canEdit,
}: {
  projectId: string;
  lifecycle: DesignLifecycleState;
  projectTitle?: string;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useFormState(
    updateDesignLifecycle,
    {} as DesignLifecycleActionState
  );

  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header bg-muted/20">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cycle dessin &amp; modèle</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Dépôt → examen formel → publication au registre → enregistrement → veille manuelle.
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <PiLifecycleStepper
          order={DESIGN_LIFECYCLE_ORDER}
          labels={DESIGN_LIFECYCLE_LABELS}
          current={lifecycle.status}
        />

        {(lifecycle.published_at || lifecycle.registered_at) && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            {lifecycle.published_at &&
              `Publié le ${new Date(lifecycle.published_at).toLocaleDateString("fr-FR")}`}
            {lifecycle.registered_at &&
              ` · enregistré le ${new Date(lifecycle.registered_at).toLocaleDateString("fr-FR")}`}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["Dépôt en ligne", OMPIC_DESIGN_LINKS.depot],
              ["Portail OMPIC", OMPIC_DESIGN_LINKS.portal],
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
                <Label htmlFor="design-status">Statut actuel</Label>
                <select
                  id="design-status"
                  name="status"
                  defaultValue={lifecycle.status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {DESIGN_LIFECYCLE_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {DESIGN_LIFECYCLE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="design-notes">Notes CPI</Label>
                <Textarea
                  id="design-notes"
                  name="notes"
                  rows={2}
                  defaultValue={lifecycle.notes ?? ""}
                />
              </div>
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.success && <p className="text-sm text-green-600">{state.message}</p>}
            <Button type="submit" size="sm" disabled={pending}>
              Mettre à jour le cycle dessin &amp; modèle
            </Button>
          </form>
        )}

        {!canEdit && lifecycle.notes && (
          <p className="rounded-lg border border-border/60 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Notes CPI : </span>
            {lifecycle.notes}
          </p>
        )}

        {lifecycle.status === "surveillance_active" && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-muted-foreground">
            Veille manuelle recommandée — l&apos;OMPIC ne propose pas de recherche automatisée publique
            pour les dessins &amp; modèles. Consultez{" "}
            <Link
              href={OMPIC_DESIGN_LINKS.portal}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              ompic.ma
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
