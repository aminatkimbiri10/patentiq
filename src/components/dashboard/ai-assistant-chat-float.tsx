"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { AiAssistantChat } from "@/components/dashboard/ai-assistant-chat";
import { cn } from "@/lib/utils/cn";

export function AiAssistantChatFloat({
  projectId,
  providerLabel,
}: {
  projectId: string;
  providerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function openChat() {
    setOpen(true);
    setTeaserDismissed(true);
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Fond mobile */}
      <div
        className={cn(
          "fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Ancré au viewport (hors du main scrollable) */}
      <div
        className={cn(
          "pointer-events-none fixed z-[130]",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
          "sm:bottom-6 sm:right-6"
        )}
        aria-live="polite"
      >
        <div className="pointer-events-auto flex flex-col items-end">
          {/* Bulle d'accroche */}
          {!open && !teaserDismissed && (
            <div className="chat-widget-teaser-enter mb-3 mr-1 max-w-[15rem] sm:max-w-[17rem]">
              <div className="relative rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-xl">
                <button
                  type="button"
                  onClick={() => setTeaserDismissed(true)}
                  className="absolute right-2 top-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Masquer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="pr-5 text-sm font-semibold text-foreground">Bonjour 👋</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Une question sur votre dossier PI ? Je suis là pour vous guider.
                </p>
                <button
                  type="button"
                  onClick={openChat}
                  className="mt-2.5 text-xs font-semibold text-primary hover:underline"
                >
                  Démarrer la conversation →
                </button>
                <span
                  className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-border/70 bg-card"
                  aria-hidden
                />
              </div>
            </div>
          )}

          {/* Panneau chat */}
          {open && (
            <div
              className={cn(
                "chat-widget-panel-enter mb-3 flex flex-col overflow-hidden bg-background shadow-[0_8px_40px_hsl(210_40%_10%_/_0.18)]",
                "h-[min(34rem,calc(100dvh-5.5rem))] w-full max-w-[24rem]",
                "rounded-2xl border border-border/80 sm:h-[32rem] sm:w-[380px]",
                "max-lg:fixed max-lg:bottom-[4.75rem] max-lg:left-3 max-lg:right-3 max-lg:mb-0 max-lg:max-w-none"
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Assistant PI"
            >
              <AiAssistantChat
                projectId={projectId}
                providerLabel={providerLabel}
                variant="floating"
                enabled={open}
                onClose={() => setOpen(false)}
              />
            </div>
          )}

          {/* Bouton flottant — reste visible au scroll */}
          <button
            type="button"
            onClick={() => (open ? setOpen(false) : openChat())}
            className={cn(
              "relative flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full shadow-[0_4px_24px_hsl(var(--primary)_/_0.45)] transition-all duration-200",
              "hover:scale-105 active:scale-95",
              open
                ? "bg-muted text-foreground ring-2 ring-border shadow-lg"
                : "chat-fab-pulse bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-primary-foreground"
            )}
            aria-expanded={open}
            aria-label={open ? "Fermer l'assistant PI" : "Ouvrir l'assistant PI"}
          >
            {open ? (
              <X className="h-6 w-6" strokeWidth={2.25} />
            ) : (
              <MessageCircle className="h-7 w-7" strokeWidth={2} />
            )}
            {!open && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            )}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
