"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function GlobalSearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    if (q.length < 2) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className="card-elevated flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={initialQuery}
          placeholder="Rechercher un projet, document ou tâche…"
          className="pl-10"
          minLength={2}
        />
      </div>
      <Button type="submit" className="shrink-0">
        Rechercher
      </Button>
    </form>
  );
}
