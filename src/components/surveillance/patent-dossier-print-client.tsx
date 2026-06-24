"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PatentDossierPrintClient({
  projectTitle,
  html,
}: {
  projectTitle: string;
  html: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const triggerPrint = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (win) win.print();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(triggerPrint, 400);
    return () => window.clearTimeout(timer);
  }, [ready, triggerPrint]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="print:hidden sticky top-0 z-10 border-b bg-background px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Dossier brevet — {projectTitle}</p>
            <p className="text-xs text-muted-foreground">
              Impression → Destination « Enregistrer au format PDF » pour obtenir un PDF professionnel.
            </p>
          </div>
          <Button type="button" size="sm" disabled={!ready} onClick={triggerPrint}>
            {ready ? (
              <>
                <Printer className="mr-1.5 h-4 w-4" />
                Télécharger PDF
              </>
            ) : (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Chargement…
              </>
            )}
          </Button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title={`Dossier ${projectTitle}`}
        srcDoc={html}
        className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-1 border-0 bg-white print:min-h-0 print:max-w-none"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}
