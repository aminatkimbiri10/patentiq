"use client";

import { useFormState } from "react-dom";
import { Upload } from "lucide-react";
import { importWatchlistFromCsv, type WatchlistActionState } from "@/lib/actions/watchlist";
import { useActionToast } from "@/hooks/use-action-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE = `title,asset_type,nice_classes,registration_number,summary
TechMaroc,trademark,35;42,MA-12345,Marque client secteur tech
Filtration MA,patent,,MA-BREV-99,Système filtration eau`;

export function WatchlistCsvImport() {
  const [state, formAction, pending] = useFormState(importWatchlistFromCsv, {} as WatchlistActionState);
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-dashed border-border/80 bg-muted/10 p-4">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Import CSV portefeuille</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Colonnes : <code className="text-[11px]">title</code> (obligatoire),{" "}
        <code className="text-[11px]">asset_type</code> (trademark|patent),{" "}
        <code className="text-[11px]">nice_classes</code>,{" "}
        <code className="text-[11px]">registration_number</code>,{" "}
        <code className="text-[11px]">summary</code>
      </p>
      <div className="space-y-2">
        <Label htmlFor="watchlist-csv">Contenu CSV</Label>
        <Textarea
          id="watchlist-csv"
          name="csv"
          rows={5}
          className="font-mono text-xs"
          placeholder={EXAMPLE}
        />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Import…" : "Importer le portefeuille"}
      </Button>
    </form>
  );
}
