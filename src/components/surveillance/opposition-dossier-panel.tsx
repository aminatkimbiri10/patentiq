"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { ChevronDown, FileText } from "lucide-react";
import {
  saveOppositionDossier,
  type OppositionActionState,
  type OppositionDossier,
} from "@/lib/actions/opposition-dossier";
import { useActionToast } from "@/hooks/use-action-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WatchAlertRow } from "@/lib/actions/watchlist";

function getOpposition(meta: WatchAlertRow["metadata"]): OppositionDossier {
  const opp = meta?.opposition;
  if (!opp || typeof opp !== "object") return { status: "draft" };
  return opp as OppositionDossier;
}

export function OppositionDossierPanel({ alert }: { alert: WatchAlertRow }) {
  const [open, setOpen] = useState(
    alert.status === "opposition_filed" || !!getOpposition(alert.metadata).notes
  );
  const opposition = getOpposition(alert.metadata);
  const [state, formAction, pending] = useFormState(
    saveOppositionDossier,
    {} as OppositionActionState
  );
  useActionToast(state);

  if (alert.ip_watchlist?.asset_type !== "trademark") return null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Fiche opposition OMPIC
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <form action={formAction} className="space-y-3 border-t border-border/40 px-3 py-3">
          <input type="hidden" name="alert_id" value={alert.id} />
          <p className="text-xs text-muted-foreground">
            Marque conflictuelle : <strong>{alert.matched_title}</strong>
            {alert.matched_ref && ` (${alert.matched_ref})`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`opp-deadline-${alert.id}`}>Échéance opposition</Label>
              <Input
                id={`opp-deadline-${alert.id}`}
                name="deadline_at"
                type="date"
                defaultValue={
                  opposition.deadline_at?.slice(0, 10) ??
                  alert.metadata?.publication_end_at?.slice(0, 10) ??
                  ""
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`opp-status-${alert.id}`}>Statut procédure</Label>
              <select
                id={`opp-status-${alert.id}`}
                name="status"
                defaultValue={opposition.status ?? "draft"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="draft">Préparation</option>
                <option value="filed">Opposition déposée</option>
                <option value="closed">Clôturée</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`opp-mandataire-${alert.id}`}>Mandataire / CPI</Label>
            <Input
              id={`opp-mandataire-${alert.id}`}
              name="mandataire"
              defaultValue={opposition.mandataire ?? ""}
              placeholder="Cabinet ou conseil en charge"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`opp-notes-${alert.id}`}>Notes & pièces</Label>
            <Textarea
              id={`opp-notes-${alert.id}`}
              name="notes"
              rows={3}
              defaultValue={opposition.notes ?? ""}
              placeholder="Arguments, classes Nice visées, liste des pièces jointes (hors plateforme)…"
            />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer la fiche opposition"}
          </Button>
        </form>
      )}
    </div>
  );
}
