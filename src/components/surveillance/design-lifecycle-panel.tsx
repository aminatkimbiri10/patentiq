"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cycle dessin &amp; modèle OMPIC : dépôt → examen formel → publication au registre →
        enregistrement → surveillance manuelle des antériorités (recherche sur les portails OMPIC).
      </p>

      <div className="flex flex-wrap gap-2">
        {DESIGN_LIFECYCLE_ORDER.map((step) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              lifecycle.status === step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {DESIGN_LIFECYCLE_LABELS[step]}
          </span>
        ))}
      </div>

      {lifecycle.published_at && (
        <p className="text-xs text-muted-foreground">
          Publié le {new Date(lifecycle.published_at).toLocaleDateString("fr-FR")}
          {lifecycle.registered_at &&
            ` — enregistré le ${new Date(lifecycle.registered_at).toLocaleDateString("fr-FR")}`}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          href={OMPIC_DESIGN_LINKS.depot}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          directompic.ma <ExternalLink className="h-3 w-3" />
        </Link>
        <Link
          href={OMPIC_DESIGN_LINKS.portal}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          ompic.ma <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {canEdit && (
        <form action={formAction} className="space-y-4 rounded-xl border p-4">
          <input type="hidden" name="project_id" value={projectId} />
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
          <div className="space-y-2">
            <Label htmlFor="design-notes">Notes CPI</Label>
            <Textarea
              id="design-notes"
              name="notes"
              rows={2}
              defaultValue={lifecycle.notes ?? ""}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">{state.message}</p>}
          <Button type="submit" size="sm" disabled={pending}>
            Mettre à jour le cycle dessin &amp; modèle
          </Button>
        </form>
      )}

      {lifecycle.status === "surveillance_active" && (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          L&apos;OMPIC ne propose pas de recherche automatisée publique pour les dessins &amp; modèles.
          Effectuez la veille d&apos;antériorité manuellement via{" "}
          <Link
            href={OMPIC_DESIGN_LINKS.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            ompic.ma
          </Link>{" "}
          et consignez vos conclusions dans les notes du dossier.
        </p>
      )}
    </div>
  );
}
