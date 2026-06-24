import { AlertTriangle, Info } from "lucide-react";
import { getOmpicSearchMode, ompicProviderLabel } from "@/lib/surveillance/ompic-provider";

/** Indique le mode OMPIC actif — utile pour la démo encadrante (live vs secours). */
export function OmpicModeBanner() {
  const mode = getOmpicSearchMode();
  const label = ompicProviderLabel();

  if (mode === "live") {
    return (
      <div className="flex gap-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-medium text-foreground">OMPIC :</span> {label}. En cas de
          maintenance du portail, passez en mode <code className="text-xs">hybrid</code> dans{" "}
          <code className="text-xs">.env.local</code>.
        </p>
      </div>
    );
  }

  const isStub = mode === "stub";
  return (
    <div
      className={`flex gap-2 rounded-lg border px-4 py-3 text-sm ${
        isStub
          ? "border-amber-300/60 bg-amber-50/80 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          : "border-blue-300/50 bg-blue-50/60 text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100"
      }`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">Mode démo / secours — {label}</p>
        <p className="text-xs opacity-90">
          {mode === "hybrid"
            ? "Tentative live OMPIC puis catalogue de démonstration si échec. Idéal pour la présentation encadrante."
            : "Catalogue simulé (ex. marques type Coca-Cola). Indiquez-le clairement lors de la démo."}
        </p>
      </div>
    </div>
  );
}
