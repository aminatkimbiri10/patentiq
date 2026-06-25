import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, Bell } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import type { DashboardActivity } from "@/lib/dashboard/overview-data";

export function ActivityFeedPanel({
  activity,
  actionHref = "/dashboard/notifications",
}: {
  activity: DashboardActivity[];
  actionHref?: string;
}) {
  return (
    <DashboardSection
      title="Activité récente"
      description="Mises à jour dossiers et notifications"
      icon={Activity}
      actionHref={actionHref}
      actionLabel="Notifications"
    >
      {!activity.length ? (
        <EmptyState
          icon={Activity}
          title="Aucune activité récente"
          description="Les changements de statut, uploads et alertes s'afficheront ici."
          className="rounded-none border-0 bg-transparent py-10"
        />
      ) : (
        <ol className="divide-y divide-border/60">
          {activity.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-muted/25"
                >
                  <ActivityItemContent item={item} />
                </Link>
              ) : (
                <div className="flex gap-3 px-4 py-3.5">
                  <ActivityItemContent item={item} />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </DashboardSection>
  );
}

function ActivityItemContent({ item }: { item: DashboardActivity }) {
  const Icon = item.kind === "notification" ? Bell : Activity;
  return (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.body && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        )}
        <time className="mt-1.5 block text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
        </time>
      </div>
    </>
  );
}
