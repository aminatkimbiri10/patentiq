"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { siteConfig } from "@/config/site";
import { i2paBrand } from "@/config/i2pa-brand";

const DISMISS_KEY = "i2pa-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  }

  async function install() {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      } else {
        dismiss();
      }
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  }

  if (!visible || !deferred) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 z-[125] max-w-sm animate-in slide-in-from-bottom-4 duration-300",
        "max-md:bottom-[5.5rem] max-md:left-3 max-md:right-14"
      )}
      role="dialog"
      aria-label="Installer I2PA"
    >
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-md ring-1 ring-border/40">
            <Image
              src={i2paBrand.appMarkUrl}
              alt={siteConfig.name}
              width={44}
              height={44}
              className="h-full w-full scale-110 object-cover object-center"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Installer I2PA</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Accès rapide depuis votre écran d&apos;accueil — gratuit, même compte.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={install} disabled={installing}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {installing ? "Installation…" : "Installer"}
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Plus tard
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
