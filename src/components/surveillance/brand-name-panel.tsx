"use client";

import { useState, useTransition } from "react";
import { Loader2, Search, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";
import { suggestBrandNames, type SuggestBrandNamesResult } from "@/lib/actions/brand-name";
import { searchOmpicTrademarksAction } from "@/lib/actions/opposition-dossier";
import type { BrandNameSuggestion } from "@/lib/ai/brand-name-generator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type CheckState = {
  loading: boolean;
  total?: number | null;
  conflicts?: number;
  error?: string;
};

export function BrandNamePanel({ projectId }: { projectId: string }) {
  const [suggestions, setSuggestions] = useState<BrandNameSuggestion[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setNote(null);
    startTransition(async () => {
      const result: SuggestBrandNamesResult = await suggestBrandNames(projectId);
      if (!result.success || !result.suggestions) {
        toast.error(result.error ?? "Génération impossible");
        return;
      }
      setSuggestions(result.suggestions);
      setChecks({});
      const src = result.source === "huggingface" ? "Hugging Face" : "modèle hors-ligne";
      setNote(`${result.suggestions.length} propositions (${src}). ${result.disclaimer ?? ""}`);
      toast.success("Dénominations générées — vérifiez la disponibilité sur OMPIC.");
    });
  }

  async function checkOmpic(name: string) {
    setChecks((prev) => ({ ...prev, [name]: { loading: true } }));
    const result = await searchOmpicTrademarksAction({ query: name, searchType: "phonetic" });
    if (result.error) {
      setChecks((prev) => ({ ...prev, [name]: { loading: false, error: result.error } }));
      return;
    }
    setChecks((prev) => ({
      ...prev,
      [name]: { loading: false, total: result.total, conflicts: result.hits.length },
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
        <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          <strong>Générateur de dénomination.</strong> L&apos;IA propose des noms de marque à partir
          du dossier. Vérifiez chaque nom sur OMPIC (search.ompic.ma) avant tout choix définitif.
        </p>
      </div>

      <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={handleGenerate}>
        <Sparkles className="mr-1.5 h-4 w-4" />
        {pending ? "Génération…" : "Générer des dénominations (IA)"}
      </Button>

      {note && <p className="text-xs text-green-700 dark:text-green-400">{note}</p>}

      {suggestions.length > 0 && (
        <ul className="space-y-2">
          {suggestions.map((s) => {
            const check = checks[s.name];
            return (
              <li
                key={s.name}
                className="rounded-lg border border-border/60 bg-background px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold">{s.name}</span>
                      <Badge variant="outline" className="text-[10px]">{s.style}</Badge>
                    </div>
                    {s.rationale && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.rationale}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    disabled={check?.loading}
                    onClick={() => void checkOmpic(s.name)}
                  >
                    {check?.loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    Vérifier OMPIC
                  </Button>
                </div>

                {check && !check.loading && (
                  <div className="mt-2 text-xs">
                    {check.error ? (
                      <span className="text-muted-foreground">{check.error}</span>
                    ) : check.conflicts && check.conflicts > 0 ? (
                      <span
                        className={cn(
                          "font-medium",
                          check.conflicts > 0 ? "text-amber-600" : "text-emerald-600"
                        )}
                      >
                        ⚠ {check.conflicts} similarité(s) trouvée(s) sur OMPIC
                        {check.total != null ? ` (${check.total} résultat(s))` : ""}
                      </span>
                    ) : (
                      <span className="font-medium text-emerald-600">
                        ✓ Aucune similarité proche détectée sur OMPIC
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
