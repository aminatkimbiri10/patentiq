"use client";

import { useState, useTransition } from "react";
import { Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import { buildClaimChart, type BuildClaimChartResult } from "@/lib/actions/claim-chart";
import type { ClaimChart, ClaimChartAssessment } from "@/lib/ai/claim-chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const ASSESSMENT_META: Record<
  ClaimChartAssessment,
  { symbol: string; label: string; className: string }
> = {
  disclosed: { symbol: "●", label: "Divulgué", className: "text-destructive" },
  partial: { symbol: "◐", label: "Partiel", className: "text-amber-600" },
  not_disclosed: { symbol: "○", label: "Non divulgué", className: "text-emerald-600" },
  unknown: { symbol: "–", label: "À évaluer", className: "text-muted-foreground" },
};

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {(Object.keys(ASSESSMENT_META) as ClaimChartAssessment[]).map((key) => {
        const meta = ASSESSMENT_META[key];
        return (
          <span key={key} className="inline-flex items-center gap-1">
            <span className={cn("font-bold", meta.className)}>{meta.symbol}</span>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

export function ClaimChartPanel({ projectId }: { projectId: string }) {
  const [chart, setChart] = useState<ClaimChart | null>(null);
  const [pending, startTransition] = useTransition();

  function handleBuild() {
    startTransition(async () => {
      const result: BuildClaimChartResult = await buildClaimChart(projectId);
      if (!result.success || !result.chart) {
        toast.error(result.error ?? "Cartographie impossible");
        return;
      }
      setChart(result.chart);
      toast.success("Cartographie générée.");
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Grid3x3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h4 className="text-sm font-semibold">Cartographie des revendications</h4>
            <p className="text-xs text-muted-foreground">
              Croise chaque élément de revendication avec les antériorités de la dernière analyse
              Nouveauté / FTO.
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={handleBuild}>
          {pending ? "Génération…" : "Générer la cartographie"}
        </Button>
      </div>

      {chart && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{chart.summary}</p>

          {chart.rows.length > 0 && chart.priorArt.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-border/60 bg-background">
                <table className="w-full min-w-[480px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium">Élément de revendication</th>
                      {chart.priorArt.map((pa) => (
                        <th key={pa.ref} className="px-3 py-2 text-center font-medium" title={pa.title}>
                          {pa.ref}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {chart.rows.map((row, i) => (
                      <tr key={i} className="align-top">
                        <td className="px-3 py-2">{row.element}</td>
                        {row.cells.map((cell, j) => {
                          const meta = ASSESSMENT_META[cell.assessment];
                          return (
                            <td key={j} className="px-3 py-2 text-center" title={cell.note ?? meta.label}>
                              <span className={cn("text-lg font-bold", meta.className)}>
                                {meta.symbol}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Legend />
            </>
          ) : (
            <p className="rounded-lg border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
              Aucune antériorité à cartographier. Lancez d&apos;abord une analyse{" "}
              <strong>Nouveauté</strong> ou <strong>FTO</strong> dans l&apos;onglet « Analyses IA ».
            </p>
          )}

          <p className="text-xs text-muted-foreground">{chart.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
