"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { updateBrevetLifecycle, type BrevetLifecycleActionState } from "@/lib/actions/brevet-lifecycle";
import {
  BREVET_LIFECYCLE_LABELS,
  BREVET_LIFECYCLE_ORDER,
  OMPIC_BREVET_LINKS,
  type BrevetLifecycleState,
} from "@/lib/workflow/brevet-lifecycle";
import { WatchlistForm } from "@/components/surveillance/watchlist-form";
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cycle brevet national Maroc : dépôt → examen → publication (~{" "}
        <strong>18 mois</strong>) → délivrance → surveillance concurrence.
      </p>

      <div className="flex flex-wrap gap-2">
        {BREVET_LIFECYCLE_ORDER.map((step) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              lifecycle.status === step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {BREVET_LIFECYCLE_LABELS[step]}
          </span>
        ))}
      </div>

      {lifecycle.publication_deadline_at && (
        <p className="text-xs text-muted-foreground">
          Publication prévue :{" "}
          {new Date(lifecycle.publication_deadline_at).toLocaleDateString("fr-FR")}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          href={OMPIC_BREVET_LINKS.depot}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          directompic.ma <ExternalLink className="h-3 w-3" />
        </Link>
        <Link
          href={OMPIC_BREVET_LINKS.publication}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          patent.ompic.ma <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {canEdit && (
        <form action={formAction} className="space-y-4 rounded-xl border p-4">
          <input type="hidden" name="project_id" value={projectId} />
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
          <div className="space-y-2">
            <Label htmlFor="brevet-notes">Notes CPI</Label>
            <Textarea
              id="brevet-notes"
              name="notes"
              rows={2}
              defaultValue={lifecycle.notes ?? ""}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">{state.message}</p>}
          <Button type="submit" size="sm" disabled={pending}>
            Mettre à jour le cycle brevet
          </Button>
        </form>
      )}

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
