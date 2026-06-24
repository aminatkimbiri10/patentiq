import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildEpoCqlQueries,
  parseExchangeDocuments,
  searchMoroccanPatents,
} from "@/lib/ai/providers/epo-ops";
import { notifyUser } from "@/lib/notifications/notify-user";
import { buildTechWatchReportSummary } from "@/lib/surveillance/tech-watch-summary";
import type { TechWatchKind } from "@/types/surveillance";

export type TechWatchRow = {
  id: string;
  owner_id: string;
  project_id: string | null;
  title: string;
  keywords: string;
  ipc_classes: string | null;
  territory: string;
  watch_kind: TechWatchKind;
  is_active: boolean;
  last_scan_at: string | null;
  last_report_summary: string | null;
};

type TechWatchHit = {
  title: string;
  ref: string;
  source: string;
  summary?: string;
};

const EPO_OPS_BASE = "https://ops.epo.org/3.2";

function appendIpcFilter(queries: string[], ipcClasses: string | null): string[] {
  if (!ipcClasses?.trim()) return queries;
  const ipc = ipcClasses.split(/[,;\s]+/)[0]?.trim().replace(/\./g, "");
  if (!ipc || ipc.length < 2) return queries;
  return queries.map((q) => `(${q}) and ic=${ipc}*`);
}

async function fetchEpoToken(key: string, secret: string): Promise<string> {
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${EPO_OPS_BASE}/auth/accesstoken`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`EPO auth ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function searchEpoForTechWatch(
  keywords: string,
  key: string,
  secret: string,
  ipcClasses: string | null,
  limit: number
): Promise<TechWatchHit[]> {
  const token = await fetchEpoToken(key, secret);
  const queries = appendIpcFilter(buildEpoCqlQueries(keywords), ipcClasses);

  for (const cql of queries) {
    const url = `${EPO_OPS_BASE}/rest-services/published-data/search/biblio?q=${encodeURIComponent(cql)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/exchange+xml",
        "X-OPS-Range": `1-${limit}`,
      },
    });
    if (!res.ok) continue;
    const xml = await res.text();
    const hits = parseExchangeDocuments(xml);
    if (hits.length > 0) {
      return hits.slice(0, limit).map((h) => ({
        title: h.title,
        ref: h.source_ref,
        source: "epo-ops",
        summary: h.abstract?.slice(0, 160),
      }));
    }
  }
  return [];
}

export async function runTechWatchScan(
  supabase: SupabaseClient,
  watchId: string
): Promise<{ watchId: string; hits: number; summary?: string; error?: string }> {
  const { data: row, error } = await supabase
    .from("ip_tech_watch")
    .select("*")
    .eq("id", watchId)
    .single();

  if (error || !row) return { watchId, hits: 0, error: "Veille introuvable" };
  if (!row.is_active) return { watchId, hits: 0 };

  const watchKind = (row.watch_kind as TechWatchKind | null) ?? "patent";
  if (watchKind === "design") {
    return {
      watchId,
      hits: 0,
      summary:
        "Veille dessins & modèles désactivée — recherche manuelle sur ompic.ma (pas de source automatisée).",
    };
  }

  const key = process.env.EPO_OPS_CONSUMER_KEY;
  const secret = process.env.EPO_OPS_CONSUMER_SECRET;
  const territory = String(row.territory ?? "MA+EP");
  const includeMa = territory.includes("MA");
  const hits: TechWatchHit[] = [];

  try {
    if (key && secret) {
      const epoHits = await searchEpoForTechWatch(
        row.keywords as string,
        key,
        secret,
        row.ipc_classes as string | null,
        5
      );
      hits.push(...epoHits);

      if (includeMa) {
        const maPatents = await searchMoroccanPatents(
          row.keywords as string,
          key,
          secret,
          4
        );
        for (const p of maPatents) {
          hits.push({
            title: p.title,
            ref: p.source_ref.startsWith("MA") ? p.source_ref : `MA-${p.source_ref}`,
            source: "ompic_ma_epo",
            summary: p.abstract?.slice(0, 160),
          });
        }
      }
    }
  } catch {
    /* continue with empty hits */
  }

  const seen = new Set<string>();
  const unique = hits.filter((h) => {
    const k = h.ref.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const label = "brevet(s)";
  const titles = unique.map((h) => h.title).filter(Boolean);

  let summary: string;
  if (key && secret && unique.length > 0) {
    const report = await buildTechWatchReportSummary(
      row.title as string,
      row.keywords as string,
      unique,
      label
    );
    summary = report.summary;
  } else if (titles.length > 0) {
    summary = `Veille « ${row.title} » : ${unique.length} ${label} — ex. ${titles.slice(0, 2).join(" ; ")}`;
  } else if (key && secret) {
    summary = `Veille « ${row.title} » : aucun brevet proche (EPO${includeMa ? " + MA" : ""}).`;
  } else {
    summary = `Veille « ${row.title} » : configurez EPO_OPS_* pour activer la recherche automatique.`;
  }

  const now = new Date().toISOString();
  await supabase
    .from("ip_tech_watch")
    .update({
      last_scan_at: now,
      last_report_summary: summary,
      updated_at: now,
      metadata: {
        watch_kind: watchKind,
        last_hits: unique.slice(0, 8).map((h) => ({
          title: h.title,
          ref: h.ref,
          source: h.source,
        })),
        scanned_at: now,
      },
    })
    .eq("id", watchId);

  if (titles.length > 0 && row.owner_id) {
    await notifyUser({
      userId: row.owner_id as string,
      projectId: (row.project_id as string | null) ?? undefined,
      notificationType: "info",
      title: "Rapport veille technologique",
      body: summary,
      actionUrl: "/dashboard/surveillance",
      metadata: { event: "tech_watch", watch_id: watchId, watch_kind: watchKind },
    });
  }

  return { watchId, hits: unique.length, summary };
}

export async function runAllTechWatchScans(supabase: SupabaseClient) {
  const { data: rows } = await supabase
    .from("ip_tech_watch")
    .select("id")
    .eq("is_active", true);

  const outcomes = [];
  for (const r of rows ?? []) {
    outcomes.push(await runTechWatchScan(supabase, r.id));
  }

  return { processed: rows?.length ?? 0, outcomes };
}
