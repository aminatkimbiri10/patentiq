"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, FolderKanban, ListChecks, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type SearchResults = {
  projects: { id: string; title: string; reference_code: string | null; status: string }[];
  documents: {
    id: string;
    title: string;
    file_name: string;
    project_id: string;
    projectTitle?: string;
    projectRef?: string | null;
  }[];
  tasks: {
    id: string;
    title: string;
    status: string;
    project_id: string;
    projectTitle?: string;
    projectRef?: string | null;
  }[];
};

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ projects: [], documents: [], tasks: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, search]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const hasResults =
    results &&
    (results.projects.length > 0 || results.documents.length > 0 || results.tasks.length > 0);

  function go(href: string) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  return (
    <div ref={wrapRef} className={cn("relative min-w-0 flex-1", className)}>
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim().length >= 2) {
            go(`/dashboard/search?q=${encodeURIComponent(q.trim())}`);
          }
        }}
        placeholder="Rechercher projets, documents…"
        className="h-10 rounded-xl border-border/60 bg-muted/40 pl-10 focus-visible:bg-background"
      />

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-card shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche…
            </div>
          ) : !hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Aucun résultat pour « {q} »
            </p>
          ) : (
            <div className="max-h-[min(70vh,400px)] overflow-y-auto p-2">
              {results!.projects.length > 0 && (
                <Section title="Projets" icon={FolderKanban}>
                  {results!.projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => go(`/dashboard/projects/${p.id}`)}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{p.title}</span>
                      {p.reference_code && (
                        <span className="text-xs text-muted-foreground">{p.reference_code}</span>
                      )}
                    </button>
                  ))}
                </Section>
              )}
              {results!.documents.length > 0 && (
                <Section title="Documents" icon={FileText}>
                  {results!.documents.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => go(`/dashboard/projects/${d.project_id}`)}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{d.title || d.file_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.projectTitle}
                        {d.projectRef && ` · ${d.projectRef}`}
                      </span>
                    </button>
                  ))}
                </Section>
              )}
              {results!.tasks.length > 0 && (
                <Section title="Tâches" icon={ListChecks}>
                  {results!.tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => go(`/dashboard/projects/${t.project_id}`)}
                      className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="font-medium">{t.title}</span>
                      <span className="text-xs text-muted-foreground">{t.projectTitle}</span>
                    </button>
                  ))}
                </Section>
              )}
              <Link
                href={`/dashboard/search?q=${encodeURIComponent(q.trim())}`}
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-lg px-3 py-2 text-center text-xs font-medium text-primary hover:bg-primary/5"
              >
                Voir tous les résultats →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <p className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      {children}
    </div>
  );
}
