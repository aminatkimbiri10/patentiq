"use client";

import { useState } from "react";
import { Search, Sparkles, History, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { AiSearch, AiResult } from "@/types/database";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "default",
  completed: "success",
  failed: "destructive",
  cancelled: "secondary",
};

function SearchResultList({ results }: { results: AiResult[] }) {
  if (!results.length) {
    return <p className="px-4 py-3 text-xs text-muted-foreground">Aucun résultat enregistré.</p>;
  }

  return (
    <ul className="border-t border-border/60 bg-muted/20">
      {results.map((r) => (
        <li key={r.id} className="border-b border-border/40 px-4 py-3 last:border-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.title ?? r.source_ref}</p>
              {r.source_ref && (
                <p className="font-mono text-xs text-primary">{r.source_ref}</p>
              )}
            </div>
            {r.score != null && (
              <Badge variant="secondary" className="shrink-0">
                {Math.round(Number(r.score) * 100)}%
              </Badge>
            )}
          </div>
          {r.summary && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{r.summary}</p>
          )}
          {typeof r.payload === "object" &&
            r.payload &&
            "espacenet_url" in r.payload &&
            typeof (r.payload as { espacenet_url?: string }).espacenet_url === "string" && (
              <a
                href={(r.payload as { espacenet_url: string }).espacenet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block text-xs text-primary hover:underline"
              >
                Voir sur Espacenet →
              </a>
            )}
        </li>
      ))}
    </ul>
  );
}

function SearchRow({
  search,
  results,
}: {
  search: AiSearch;
  results: AiResult[];
}) {
  const [open, setOpen] = useState(search.status === "completed");

  return (
    <li className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{search.query ?? search.search_type}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {search.search_type}
            {results.length > 0 && ` · ${results.length} résultat(s)`}
          </p>
          {search.error_message && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {search.error_message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[search.status] ?? "outline"} className="capitalize">
            {search.status}
          </Badge>
          {(search.status === "completed" || results.length > 0) && (
            open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {open && <SearchResultList results={results} />}
    </li>
  );
}

export function AiSearchPanel({
  projectId,
  searches,
  resultsBySearch = {},
  providerLabel,
}: {
  projectId: string;
  searches: AiSearch[];
  resultsBySearch?: Record<string, AiResult[]>;
  providerLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function launchSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, query, searchType: "novelty" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success(data.message ?? "Recherche terminée");
      setQuery("");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-elevated space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label className="text-base font-semibold">Recherche de nouveauté</Label>
            <p className="text-xs text-muted-foreground">
              {providerLabel ??
                "Configurez EPO_OPS_* et GEMINI_API_KEY dans .env.local pour des résultats réels"}
            </p>
          </div>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mots-clés, description technique, classes IPC…"
          onKeyDown={(e) => e.key === "Enter" && launchSearch()}
        />
        <Button onClick={launchSearch} disabled={loading || !query.trim()} className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Analyse en cours…" : "Lancer la recherche"}
        </Button>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4 text-muted-foreground" />
          Historique ({searches.length})
        </h3>
        {searches.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucune recherche"
            description="Lancez une première analyse de nouveauté sur ce projet."
            className="py-12"
          />
        ) : (
          <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
            {searches.map((s) => (
              <SearchRow
                key={s.id}
                search={s}
                results={resultsBySearch[s.id] ?? []}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
