"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Lock } from "lucide-react";
import {
  savePatentClaimsDraft,
  type ClaimsActionState,
  type PatentClaimsDraft,
} from "@/lib/actions/patent-claims";
import { useActionToast } from "@/hooks/use-action-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PatentClaimsPanel({
  projectId,
  draft,
  readOnly = false,
}: {
  projectId: string;
  draft: PatentClaimsDraft | null;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useFormState(
    savePatentClaimsDraft,
    {} as ClaimsActionState
  );
  useActionToast(state);
  const [deps, setDeps] = useState(
    draft?.dependent_claims?.join("\n") ?? ""
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          <strong>Confidentiel.</strong> Les revendications définissent le périmètre juridique du
          brevet (nouveauté, activité inventive, application industrielle). Accès restreint au
          porteur et au CPI assigné.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="project_id" value={projectId} />
        <input type="hidden" name="dependent_claims" value={JSON.stringify(
          deps.split("\n").map((l) => l.trim()).filter(Boolean)
        )} />

        <div className="space-y-2">
          <Label htmlFor="independent_claim">Revendication indépendante</Label>
          <Textarea
            id="independent_claim"
            name="independent_claim"
            rows={6}
            readOnly={readOnly}
            defaultValue={draft?.independent_claim ?? ""}
            placeholder="1. Un dispositif de filtration comprenant…"
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dependent_claims">Revendications dépendantes (une par ligne)</Label>
          <Textarea
            id="dependent_claims"
            rows={8}
            readOnly={readOnly}
            value={deps}
            onChange={(e) => setDeps(e.target.value)}
            placeholder={"2. Le dispositif selon la revendication 1, où…\n3. …"}
            className="font-mono text-sm"
          />
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        {!readOnly && (
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer les revendications"}
          </Button>
        )}

        {draft?.updated_at && (
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {new Date(draft.updated_at).toLocaleString("fr-FR")}
          </p>
        )}
      </form>
    </div>
  );
}
