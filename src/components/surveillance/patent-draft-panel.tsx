"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { Lock, Sparkles } from "lucide-react";
import type { PatentDraftVersionRow } from "@/lib/actions/patent-draft-history";
import {
  savePatentDraft,
  type PatentDraft,
  type PatentDraftActionState,
} from "@/lib/actions/patent-draft";
import { suggestPatentDraft } from "@/lib/actions/patent-draft-ai";
import { useActionToast } from "@/hooks/use-action-toast";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DraftFields = {
  title: string;
  technical_field: string;
  background: string;
  description: string;
  abstract: string;
};

const EMPTY: DraftFields = {
  title: "",
  technical_field: "",
  background: "",
  description: "",
  abstract: "",
};

function fromDraft(draft: PatentDraft | null): DraftFields {
  if (!draft) return EMPTY;
  return {
    title: draft.title ?? "",
    technical_field: draft.technical_field ?? "",
    background: draft.background ?? "",
    description: draft.description ?? "",
    abstract: draft.abstract ?? "",
  };
}

const FIELD_META: Array<{
  key: keyof DraftFields;
  label: string;
  rows: number;
  placeholder: string;
  multiline: boolean;
}> = [
  {
    key: "title",
    label: "Titre de l'invention",
    rows: 2,
    placeholder: "Dispositif de filtration portable…",
    multiline: false,
  },
  {
    key: "technical_field",
    label: "Domaine technique",
    rows: 3,
    placeholder: "La présente invention concerne…",
    multiline: true,
  },
  {
    key: "background",
    label: "État de la technique (antériorité)",
    rows: 6,
    placeholder: "Les solutions existantes présentent…",
    multiline: true,
  },
  {
    key: "description",
    label: "Description détaillée",
    rows: 10,
    placeholder: "Description des modes de réalisation…",
    multiline: true,
  },
  {
    key: "abstract",
    label: "Abrégé",
    rows: 4,
    placeholder: "Résumé en 150 mots max (publication)…",
    multiline: true,
  },
];

export function PatentDraftPanel({
  projectId,
  draft,
  readOnly = false,
  draftVersions = [],
}: {
  projectId: string;
  draft: PatentDraft | null;
  readOnly?: boolean;
  draftVersions?: PatentDraftVersionRow[];
}) {
  const [fields, setFields] = useState<DraftFields>(() => fromDraft(draft));
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPending, startAi] = useTransition();
  const [state, formAction, pending] = useFormState(
    savePatentDraft,
    {} as PatentDraftActionState
  );
  useActionToast(state);

  useEffect(() => {
    setFields(fromDraft(draft));
  }, [draft]);

  function updateField(key: keyof DraftFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSuggest() {
    setAiError(null);
    setAiNote(null);
    startAi(async () => {
      const result = await suggestPatentDraft(projectId);
      if (!result.success || !result.sections) {
        const err = result.error ?? "Échec de la suggestion IA";
        setAiError(err);
        toast.error(err);
        return;
      }
      setFields(result.sections);
      const src =
        result.source === "huggingface"
          ? "Hugging Face"
          : "modèle hors-ligne (template)";
      const note = `Brouillon suggéré (${src}). ${result.disclaimer ?? ""}`;
      setAiNote(note);
      toast.success("Brouillon IA inséré — relisez et validez avant enregistrement.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p>
          <strong>Confidentiel — brouillon CPI.</strong> Sections alignées sur le dépôt OMPIC /
          directompic. L&apos;IA propose un point de départ ; validation juridique obligatoire avant
          dépôt.
        </p>
      </div>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={aiPending || pending}
            onClick={handleSuggest}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {aiPending ? "Génération…" : "Suggérer brouillon (IA)"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Utilise le résumé invention, documents OCR et revendications si présents.
          </span>
        </div>
      )}

      {aiNote && <p className="text-sm text-green-700 dark:text-green-400">{aiNote}</p>}
      {aiError && <p className="text-sm text-destructive">{aiError}</p>}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="project_id" value={projectId} />

        {FIELD_META.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.multiline ? (
              <Textarea
                id={f.key}
                name={f.key}
                rows={f.rows}
                readOnly={readOnly}
                value={fields[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="font-mono text-sm leading-relaxed max-sm:text-base"
              />
            ) : (
              <Input
                id={f.key}
                name={f.key}
                readOnly={readOnly}
                value={fields[f.key]}
                onChange={(e) => updateField(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        {!readOnly && (
          <Button type="submit" disabled={pending || aiPending}>
            {pending ? "Enregistrement…" : "Enregistrer le brouillon"}
          </Button>
        )}

        {draft?.updated_at && (
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {new Date(draft.updated_at).toLocaleString("fr-FR")}
          </p>
        )}

        {draftVersions.length > 0 && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">Historique des versions</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {draftVersions.map((v) => (
                <li key={v.id}>
                  {new Date(v.created_at).toLocaleString("fr-FR")}
                  {v.title ? ` — ${v.title.slice(0, 60)}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
