import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPanel, ListPanelItem } from "@/components/shared/list-panel";
import { Pagination } from "@/components/shared/pagination";
import { Bell } from "lucide-react";
import { parsePageParam, getRange, getTotalPages, LIST_PAGE_SIZE } from "@/lib/pagination";
import type { Notification } from "@/types/database";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const ctx = await requireUser();
  const supabase = await createClient();
  const page = parsePageParam(searchParams.page);
  const { from, to } = getRange(page, LIST_PAGE_SIZE);

  const { data: notifications, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const items = (notifications ?? []) as Notification[];
  const totalPages = getTotalPages(count ?? 0, LIST_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={
          count != null
            ? `${count} notification${count !== 1 ? "s" : ""}`
            : "Alertes sur vos projets et documents."
        }
      />
      {!items.length ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous serez informé des mises à jour importantes ici."
        />
      ) : (
        <>
          <ListPanel>
            {items.map((n) => (
              <ListPanelItem key={n.id} className="items-start">
                <div className="flex gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{n.title}</p>
                    {n.body && (
                      <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    )}
                    <time className="mt-2 block text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </time>
                  </div>
                </div>
              </ListPanelItem>
            ))}
          </ListPanel>
          <Pagination basePath="/dashboard/notifications" page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
