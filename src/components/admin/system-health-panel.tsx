import Link from "next/link";
import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HealthCheckResult } from "@/lib/health/check";

export function SystemHealthPanel({ report }: { report: HealthCheckResult }) {
  const { checks } = report;

  return (
    <section className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Santé système</h2>
        </div>
        <Badge variant={report.ok && !report.degraded ? "success" : "outline"}>
          {report.ok && !report.degraded ? "Opérationnel" : report.ok ? "Dégradé" : "Indisponible"}
        </Badge>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <HealthItem
          ok={checks.supabase.ok}
          title="Supabase"
          detail={
            checks.supabase.ok
              ? `${checks.supabase.latencyMs ?? "—"} ms`
              : checks.supabase.error ?? "Erreur"
          }
        />
        <HealthItem
          ok={checks.config.epo || checks.config.llm}
          title="Providers IA"
          detail={[
            checks.config.epo ? "EPO" : null,
            checks.config.llm ? "HF" : null,
            checks.config.workerSecret ? "Worker" : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Non configuré"}
        />
        <HealthItem
          ok={!checks.aiWorker.alert}
          title="File IA"
          detail={`${checks.aiWorker.pending} en attente${checks.aiWorker.stale ? ` · ${checks.aiWorker.stale} stale` : ""}`}
          warn={checks.aiWorker.alert}
        />
        <HealthItem
          ok
          title="OMPIC"
          detail={`Mode ${checks.config.ompicMode}${checks.config.ompicProxy ? " + proxy" : ""}`}
        />
        {checks.aiMetrics && (
          <>
            <HealthItem
              ok
              title="Analyses 24 h"
              detail={`${checks.aiMetrics.completed24h} OK · ${checks.aiMetrics.failed24h} échec`}
            />
            <HealthItem
              ok={checks.aiMetrics.quotaFallback24h === 0}
              title="Fallbacks HF 24 h"
              detail={`${checks.aiMetrics.quotaFallback24h} quota · ${checks.aiMetrics.templateFallback24h} template`}
              warn={checks.aiMetrics.quotaFallback24h > 0}
            />
          </>
        )}
      </div>
      <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        API{" "}
        <Link href="/api/health" className="text-primary hover:underline" target="_blank">
          /api/health
        </Link>{" "}
        — {new Date(report.timestamp).toLocaleString("fr-FR")}
      </p>
    </section>
  );
}

function HealthItem({
  ok,
  title,
  detail,
  warn,
}: {
  ok: boolean;
  title: string;
  detail: string;
  warn?: boolean;
}) {
  const Icon = warn ? AlertTriangle : ok ? CheckCircle2 : AlertTriangle;
  const color = warn ? "text-amber-600" : ok ? "text-emerald-600" : "text-destructive";

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <p className="text-xs font-medium">{title}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
