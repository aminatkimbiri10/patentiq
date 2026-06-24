"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, ChevronRight } from "lucide-react";
import { markNotificationRead } from "@/lib/actions/notifications";
import { ListPanel, ListPanelItem } from "@/components/shared/list-panel";
import { cn } from "@/lib/utils/cn";
import type { Notification } from "@/types/database";

export function NotificationList({ items }: { items: Notification[] }) {
  return (
    <ListPanel>
      {items.map((n) => {
        const content = (
          <>
            <div className="flex min-w-0 flex-1 gap-4">
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  n.is_read ? "bg-muted" : "bg-primary/10"
                )}
              >
                <Bell
                  className={cn("h-4 w-4", n.is_read ? "text-muted-foreground" : "text-primary")}
                />
              </div>
              <div className="min-w-0">
                <p className={cn("font-medium", !n.is_read && "text-foreground")}>{n.title}</p>
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
            {n.action_url && (
              <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground sm:mt-0" />
            )}
          </>
        );

        if (!n.action_url) {
          return (
            <ListPanelItem key={n.id} className="items-start">
              {content}
            </ListPanelItem>
          );
        }

        return (
          <ListPanelItem key={n.id} className="items-start p-0">
            <Link
              href={n.action_url}
              onClick={() => {
                if (!n.is_read) void markNotificationRead(n.id);
              }}
              className="flex min-h-[44px] w-full items-start justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/30 active:bg-muted/50"
            >
              {content}
            </Link>
          </ListPanelItem>
        );
      })}
    </ListPanel>
  );
}
