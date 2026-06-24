"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

/** Marque les notifications lues après affichage — sans bloquer le rendu serveur. */
export function MarkAllReadOnVisit({ hadUnread }: { hadUnread: boolean }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (!hadUnread || done.current) return;
    done.current = true;
    void markAllNotificationsRead().then(() => router.refresh());
  }, [hadUnread, router]);

  return null;
}
