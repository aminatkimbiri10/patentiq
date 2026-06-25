import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, AlertTriangle, Radar, ScanLine } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { cn } from "@/lib/utils/cn";
import type { SurveillanceActivityItem } from "@/lib/surveillance/dashboard-stats";

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-destructive",
  high: "text-amber-600 dark:text-amber-400",
  medium: "text-muted-foreground",
  low: "text-muted-foreground",
};

function activityIcon(kind: SurveillanceActivityItem["kind"]) {
  if (kind === "alert") return AlertTriangle;
  if (kind === "tech_watch") return Radar;
  return ScanLine;
}

export function SurveillanceTimeline({
  items,
  embedded = false,
}: {
  items: SurveillanceActivityItem[];
  embedded?: boolean;
}) {
  const content = !items.length ? (
    <p className="px-5 py-8 text-sm text-muted-foreground">
      Aucune activité — lancez un scan OMPIC ou ajoutez un actif au portefeuille.
    </p>
  ) : (
    <ol className="divide-y divide-border/60">
      {items.map((item) => {
        const Icon = activityIcon(item.kind);
        return (
          <li key={item.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  item.severity && SEVERITY_CLASS[item.severity]
                )}
              >
                {item.title}
              </p>
              {item.body && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
              )}
              <time className="mt-1 block text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (embedded) return content;

  return (
    <DashboardSection title="Activité récente" description="Alertes, scans et veilles" icon={Activity}>
      {content}
    </DashboardSection>
  );
}
