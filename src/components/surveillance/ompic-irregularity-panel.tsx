"use client";

import { useState, useTransition } from "react";
import { ClipboardCopy, FileWarning, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  draftOmpicResponse,
  type DraftOmpicResponseResult,
} from "@/lib/actions/ompic-irregularity";
import type { OmpicResponseDraft } from "@/lib/ai/ompic-irregularity";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OmpicIrregularityPanel({
  projectId,
  readOnly = false,
}: {
  projectId: string;
  readOnly?: boolean;
}) {
  const [notification, setNotification] = useState("");
  const [draft, setDraft] = useState<OmpicResponseDraft | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    if (notification.trim().length < 20) {
      toast.error("Collez d'abord le texte de la notification.");
      return;
    }
    setNote(null);
    startTransition(async () => {
      const result: DraftOmpicResponseResult = await draftOmpicResponse(
        projectId,
        notification
      );
      if (!result.success || !result.draft) {
        toast.error(result.error ?? "Génération impossible");
        return;
      }
      setDraft(result.draft);
      const src = result.source === "huggingface" ? "Hugging Face" : "modèle hors-ligne";
      setNote(`Trame générée (${src}). ${result.disclaimer ?? ""}`);
      toast.success("Trame de réponse générée — relisez et adaptez.");
    });
  }

  async function copyCourrier() {
    if (!draft?.courrier) return;
    try {
      await navigator.clipboard.writeText(draft.courrier);
      toast.success("Courrier copié dans le presse-papier.");
    } catch {
      toast.error("Copie impossible — sélectionnez le texte manuellement.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
        <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          <strong>Assistant irrégularité OMPIC.</strong> Collez la notification reçue : l&apos;IA
          propose une trame de réponse structurée. Validation par un CPI obligatoire avant envoi.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ompic-notification">Texte de la notification d&apos;irrégularité</Label>
        <Textarea
          id="ompic-notification"
          rows={6}
          readOnly={readOnly}
          value={notification}
          onChange={(e) => setNotification(e.target.value)}
          placeholder="Collez ici le contenu de la notification reçue de l'OMPIC (motifs d'irrégularité, pièces manquantes, délai…)."
          className="text-sm leading-relaxed"
        />
      </div>

      {!readOnly && (
        <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={handleGenerate}>
          <Sparkles className="mr-1.5 h-4 w-4" />
          {pending ? "Génération…" : "Générer une trame de réponse (IA)"}
        </Button>
      )}

      {note && <p className="text-xs text-green-700 dark:text-green-400">{note}</p>}

      {draft && (
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Objet</p>
            <p className="mt-1 text-sm font-medium">{draft.objet}</p>
          </div>

          {draft.resume_irregularite && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Irrégularité identifiée
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {draft.resume_irregularite}
              </p>
            </div>
          )}

          {draft.actions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions à mener
              </p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                {draft.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </div>
          )}

          {draft.pieces.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pièces à joindre
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {draft.pieces.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {draft.delai && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Délai</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{draft.delai}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Projet de courrier
              </p>
              <Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={copyCourrier}>
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copier
              </Button>
            </div>
            <pre className="mt-1 whitespace-pre-wrap rounded-md border border-border/60 bg-background p-3 font-sans text-sm leading-relaxed">
              {draft.courrier}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
