"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { Loader2, Play, Radar } from "lucide-react";
import { createTechWatch, runTechWatchScanAction, type TechWatchActionState } from "@/lib/actions/tech-watch";
import type { TechWatchRow } from "@/lib/surveillance/tech-watch-runner";
import { notifyActionResult, useActionToast } from "@/hooks/use-action-toast";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TECH_WATCH_KIND_LABELS } from "@/types/surveillance";

export function TechWatchForm({ projectId }: { projectId?: string }) {
  const [state, formAction, pending] = useFormState(createTechWatch, {} as TechWatchActionState);
  useActionToast(state);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border p-4">
      <h3 className="font-semibold">Veille continue</h3>
      <p className="text-sm text-muted-foreground">
        Mots-clés surveillés chaque semaine — brevets (EPO + Maroc).
      </p>
      {projectId && <input type="hidden" name="project_id" value={projectId} />}
      <input type="hidden" name="watch_kind" value="patent" />
      <div className="space-y-2">
        <Label htmlFor="tw-title">Nom de la veille</Label>
        <Input id="tw-title" name="title" required placeholder="Veille gourdes filtrantes" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tw-keywords">Mots-clés</Label>
        <Textarea
          id="tw-keywords"
          name="keywords"
          required
          rows={2}
          placeholder="filtration portable gourde membrane"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tw-ipc">Classes IPC ou Locarno (optionnel)</Label>
        <Input id="tw-ipc" name="ipc_classes" placeholder="A47G / 07-01" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        Créer la veille
      </Button>
    </form>
  );
}

export function TechWatchList({ items }: { items: TechWatchRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!items.length) {
    return (
      <EmptyState
        icon={Radar}
        title="Aucune veille active"
        description="Créez une veille brevets pour suivre les nouveaux dépôts EPO et marocains."
        className="py-10"
      />
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Veilles actives</h3>
      {items.map((w) => (
        <div key={w.id} className="rounded-lg border p-3 text-sm space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{w.title}</p>
            <Badge variant="outline">
              {TECH_WATCH_KIND_LABELS[w.watch_kind ?? "patent"]}
            </Badge>
          </div>
          <p className="text-muted-foreground">{w.keywords}</p>
          {w.last_report_summary && (
            <p className="text-xs text-muted-foreground">{w.last_report_summary}</p>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await runTechWatchScanAction(w.id);
                notifyActionResult(result);
                if (result.success) router.refresh();
              })
            }
          >
            {pending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Play className="mr-1 h-3 w-3" />
            )}
            Scanner maintenant
          </Button>
        </div>
      ))}
    </div>
  );
}
