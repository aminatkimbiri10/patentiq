"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

/** Raccourci Ctrl/Cmd + B pour réduire / développer la sidebar */
export function useSidebarShortcut() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);
}
