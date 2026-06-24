"use client";

import { useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { searchOmpicTrademarksAction } from "@/lib/actions/opposition-dossier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Hit = { title: string; ref?: string; score?: number; summary?: string };

export function OmpicTrademarkSearchPanel() {
  const [query, setQuery] = useState("");
  const [niceClasses, setNiceClasses] = useState("");
  const [searchType, setSearchType] = useState<"phonetic" | "exact">("phonetic");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function runSearch() {
    if (!query.trim()) {
      toast.error("Saisissez un nom de marque");
      return;
    }
    startTransition(async () => {
      const result = await searchOmpicTrademarksAction({
        query: query.trim(),
        niceClasses: niceClasses.trim() || undefined,
        searchType,
      });
      if (result.error) {
        toast.error(result.error);
        setHits([]);
        setTotal(null);
        return;
      }
      setHits(result.hits);
      setTotal(result.total);
      if (result.hits.length === 0) {
        toast.message("Aucune similarité trouvée sur OMPIC pour cette requête.");
      } else {
        toast.success(`${result.hits.length} résultat(s) OMPIC`);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
      <div>
        <h3 className="font-semibold">Recherche antériorité marques OMPIC</h3>
        <p className="text-sm text-muted-foreground">
          Interroge search.ompic.ma (phonétique ou exacte). Filtrez par classe Nice si besoin.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="ompic-q">Nom de marque</Label>
          <Input
            id="ompic-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex. Coca, Atlas, Inwi…"
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ompic-nice">Classe Nice (optionnel)</Label>
          <Input
            id="ompic-nice"
            value={niceClasses}
            onChange={(e) => setNiceClasses(e.target.value)}
            placeholder="32, 35…"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ompic-type">Mode</Label>
          <select
            id="ompic-type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "phonetic" | "exact")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="phonetic">Phonétique (défaut OMPIC)</option>
            <option value="exact">Exacte</option>
          </select>
        </div>
      </div>
      <Button type="button" size="sm" disabled={pending} onClick={runSearch}>
        {pending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-1.5 h-4 w-4" />
        )}
        Rechercher sur OMPIC
      </Button>
      {total != null && (
        <p className="text-xs text-muted-foreground">
          {total} résultat(s) sur le portail OMPIC · {hits.length} similarité(s) affichée(s)
        </p>
      )}
      {hits.length > 0 && (
        <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border bg-muted/20 p-2">
          {hits.map((h) => (
            <li key={h.ref ?? h.title} className="rounded-md border bg-background px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{h.title}</span>
                {h.score != null && (
                  <Badge variant="secondary">{Math.round(h.score * 100)} %</Badge>
                )}
              </div>
              {h.ref && <p className="text-xs text-muted-foreground">{h.ref}</p>}
              {h.summary && <p className="text-xs text-muted-foreground">{h.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
