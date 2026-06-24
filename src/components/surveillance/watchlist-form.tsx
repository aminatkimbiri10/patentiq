"use client";

import { useFormState } from "react-dom";
import { createWatchlistItem, type WatchlistActionState } from "@/lib/actions/watchlist";
import { useActionToast } from "@/hooks/use-action-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IpAssetType } from "@/types/surveillance";

export function WatchlistForm({
  projectId,
  defaultTitle,
  defaultAssetType = "trademark",
}: {
  projectId?: string;
  defaultTitle?: string;
  defaultAssetType?: Exclude<IpAssetType, "design">;
}) {
  const [state, formAction, pending] = useFormState(createWatchlistItem, {} as WatchlistActionState);
  useActionToast(state);

  const classesLabel =
    defaultAssetType === "patent" ? "Classes IPC" : "Classes Nice";

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
      <h3 className="font-semibold">Portefeuille — actif déjà protégé</h3>
      <p className="text-sm text-muted-foreground">
        Marque ou brevet <strong>déjà enregistré</strong>. Ajoutez-le pour lancer des scans de
        similarité (OMPIC / EPO).
      </p>
      {projectId && <input type="hidden" name="project_id" value={projectId} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="wl-title">Nom / dénomination *</Label>
          <Input
            id="wl-title"
            name="title"
            required
            defaultValue={defaultTitle}
            placeholder="Ex. Coca-Cola"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-type">Type</Label>
          <select
            id="wl-type"
            name="asset_type"
            defaultValue={defaultAssetType}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="trademark">Marque</option>
            <option value="patent">Brevet</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-reg">N° enregistrement OMPIC</Label>
          <Input
            id="wl-reg"
            name="registration_number"
            placeholder={
              defaultAssetType === "patent" ? "MA-B-2024-…" : "MA-M-2024-…"
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-nice">{classesLabel}</Label>
          <Input
            id="wl-nice"
            name="nice_classes"
            placeholder={defaultAssetType === "patent" ? "A47G…" : "32, 35…"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-registered">Date d&apos;enregistrement</Label>
          <Input id="wl-registered" name="registered_at" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-territory">Territoire</Label>
          <Input id="wl-territory" name="territory" defaultValue="MA" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="wl-logo">URL image / logo (optionnel)</Label>
          <Input id="wl-logo" name="logo_url" type="url" placeholder="https://…/logo.png" />
          <p className="text-[11px] text-muted-foreground">
            Si renseigné, le scan marque compare aussi la similarité visuelle (aHash) avec les logos
            candidats OMPIC live.
          </p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="wl-summary">Résumé / produits couverts</Label>
          <Textarea
            id="wl-summary"
            name="summary"
            rows={2}
            placeholder="Produits, secteur…"
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter au portefeuille & activer surveillance"}
      </Button>
    </form>
  );
}
