"use client";

import { useEffect } from "react";

const RELOAD_KEY = "patent-chunk-reload";

/**
 * Recharge une fois si un chunk JS/CSS Next.js échoue au chargement
 * (symptôme : page HTML brute sans Tailwind / layout cassé).
 */
export function ChunkRecovery() {
  useEffect(() => {
    function shouldRecover(message: string) {
      const m = message.toLowerCase();
      return (
        m.includes("chunkloaderror") ||
        m.includes("loading chunk") ||
        m.includes("failed to fetch dynamically imported module") ||
        m.includes("cannot find module") ||
        /loading css chunk/i.test(message)
      );
    }

    function recover(source: string) {
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      console.warn("[I2PA] Ressource manquante, rechargement…", source);
      window.location.reload();
    }

    function onError(event: ErrorEvent) {
      if (event.message && shouldRecover(event.message)) {
        recover(event.message);
      }
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "";
      if (message && shouldRecover(message)) {
        recover(message);
      }
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    sessionStorage.removeItem(RELOAD_KEY);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
