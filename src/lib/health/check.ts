import { getAiProviderConfig } from "@/lib/ai/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOmpicSearchMode } from "@/lib/surveillance/ompic-provider";

export const AI_WORKER_STALE_MINUTES = 15;

export type HealthCheckResult = {
  ok: boolean;
  degraded: boolean;
  service: string;
  timestamp: string;
  checks: {
    supabase: { ok: boolean; latencyMs?: number; error?: string };
    config: {
      epo: boolean;
      llm: boolean;
      workerSecret: boolean;
      ompicMode: string;
      ompicProxy: boolean;
    };
    aiWorker: {
      pending: number;
      stale: number;
      workerConfigured: boolean;
      alert: boolean;
    };
    aiMetrics?: {
      completed24h: number;
      failed24h: number;
      quotaFallback24h: number;
      templateFallback24h: number;
    };
  };
};

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();
  const config = getAiProviderConfig();
  const workerSecret = !!process.env.AI_WORKER_SECRET?.trim();
  const ompicProxy = !!process.env.OMPIC_PROXY_URL?.trim();

  let supabaseOk = false;
  let supabaseLatencyMs: number | undefined;
  let supabaseError: string | undefined;
  let pending = 0;
  let stale = 0;
  let completed24h = 0;
  let failed24h = 0;
  let quotaFallback24h = 0;
  let templateFallback24h = 0;

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const supabaseStart = Date.now();

  try {
    const admin = createAdminClient();
    const { error: pingError } = await admin.from("ai_searches").select("id").limit(1);
    supabaseLatencyMs = Date.now() - supabaseStart;

    if (pingError) {
      supabaseError = pingError.message;
    } else {
      supabaseOk = true;

      const { count: pendingCount } = await admin
        .from("ai_searches")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      pending = pendingCount ?? 0;

      const staleCutoff = new Date(
        Date.now() - AI_WORKER_STALE_MINUTES * 60 * 1000
      ).toISOString();

      const { count: staleCount } = await admin
        .from("ai_searches")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .lt("created_at", staleCutoff);

      stale = staleCount ?? 0;

      const [{ count: completedCount }, { count: failedCount }, { data: recentSearches }] =
        await Promise.all([
          admin
            .from("ai_searches")
            .select("id", { count: "exact", head: true })
            .eq("status", "completed")
            .gte("completed_at", since24h),
          admin
            .from("ai_searches")
            .select("id", { count: "exact", head: true })
            .eq("status", "failed")
            .gte("created_at", since24h),
          admin
            .from("ai_searches")
            .select("metadata")
            .eq("status", "completed")
            .gte("completed_at", since24h)
            .limit(100),
        ]);

      completed24h = completedCount ?? 0;
      failed24h = failedCount ?? 0;

      for (const row of recentSearches ?? []) {
        const meta = row.metadata as { providers?: { synthesis?: string } } | null;
        const synthesis = meta?.providers?.synthesis ?? "";
        if (synthesis.includes("quota")) quotaFallback24h += 1;
        if (synthesis.includes("template") || synthesis.includes("fallback")) {
          templateFallback24h += 1;
        }
      }
    }
  } catch (e) {
    supabaseLatencyMs = Date.now() - supabaseStart;
    supabaseError = e instanceof Error ? e.message : "Supabase indisponible";
  }

  const workerAlert = workerSecret && stale > 0;
  const degraded = !supabaseOk || workerAlert || (!config.epo && !config.llm);

  return {
    ok: supabaseOk,
    degraded,
    service: "patent-platform",
    timestamp,
    checks: {
      supabase: {
        ok: supabaseOk,
        latencyMs: supabaseLatencyMs,
        error: supabaseError,
      },
      config: {
        epo: !!config.epo,
        llm: !!config.llm,
        workerSecret,
        ompicMode: getOmpicSearchMode(),
        ompicProxy,
      },
      aiWorker: {
        pending,
        stale,
        workerConfigured: workerSecret,
        alert: workerAlert,
      },
      aiMetrics: {
        completed24h,
        failed24h,
        quotaFallback24h,
        templateFallback24h,
      },
    },
  };
}
