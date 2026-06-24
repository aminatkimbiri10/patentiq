import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export type ProjectUpdate = {
  id: string;
  title: string | null;
  content: string | null;
  update_type: string;
  created_at: string;
};

export function ProjectTimeline({
  updates,
  limit,
}: {
  updates: ProjectUpdate[];
  limit?: number;
}) {
  const items = limit ? updates.slice(0, limit) : updates;

  if (!items.length) {
    return (
      <EmptyState
        icon={Activity}
        title="Aucune activité"
        description="Les mises à jour de statut et actions apparaîtront ici."
        className="py-12"
      />
    );
  }

  return (
    <ol className="relative space-y-0">
      {items.map((u, i) => (
        <li key={u.id} className="relative flex gap-4 pb-8 last:pb-0">
          {i < items.length - 1 && (
            <span className="absolute left-[15px] top-8 h-full w-px bg-border" />
          )}
          <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
            <p className="text-sm font-semibold">{u.title ?? u.update_type}</p>
            {u.content && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{u.content}</p>
            )}
            <time className="mt-2 block text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: fr })}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
