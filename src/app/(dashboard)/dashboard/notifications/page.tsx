import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { MarkAllReadOnVisit } from "@/components/notifications/mark-all-read-on-visit";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationList } from "@/components/notifications/notification-list";
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

  const { count: unreadTotal } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.user.id)
    .eq("is_read", false);

  const hadUnread = (unreadTotal ?? 0) > 0;

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
      <MarkAllReadOnVisit hadUnread={hadUnread} />
      <PageHeader
        icon={Bell}
        title="Notifications"
        description={
          hadUnread
            ? `${unreadTotal} nouvelle${(unreadTotal ?? 0) > 1 ? "s" : ""} alerte${(unreadTotal ?? 0) > 1 ? "s" : ""}`
            : count != null
              ? `${count} notification${count !== 1 ? "s" : ""}`
              : "Alertes sur vos projets, messages et analyses."
        }
      />
      {!items.length ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous serez informé des nouveaux messages, tâches et analyses IA ici."
        />
      ) : (
        <>
          <NotificationList items={items} />
          <Pagination basePath="/dashboard/notifications" page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
