import type { SupabaseClient } from "@supabase/supabase-js";
import { searchOmpicSimilar } from "@/lib/surveillance/ompic-provider";
import { notifyUser } from "@/lib/notifications/notify-user";
import type { IpAssetType } from "@/types/surveillance";

function normalizeTitle(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export type ScanWatchlistResult = {
  watchlistId: string;
  newAlerts: number;
  mode: string;
  error?: string;
};

export async function scanWatchlistItem(
  supabase: SupabaseClient,
  watchlistId: string
): Promise<ScanWatchlistResult> {
  const { data: item, error: fetchErr } = await supabase
    .from("ip_watchlist")
    .select("*")
    .eq("id", watchlistId)
    .single();

  if (fetchErr || !item) {
    return { watchlistId, newAlerts: 0, mode: "error", error: "Actif introuvable" };
  }

  if (!item.surveillance_active) {
    return { watchlistId, newAlerts: 0, mode: "skipped" };
  }

  if (item.asset_type === "design") {
    return { watchlistId, newAlerts: 0, mode: "skipped" };
  }

  const { hits, mode, error } = await searchOmpicSimilar(
    item.title as string,
    item.asset_type as IpAssetType,
    {
      registration_number: item.registration_number as string | null,
      nice_classes: item.nice_classes as string | null,
      territory: (item.territory as string) ?? "MA",
      summary: item.summary as string | null,
      logo_url: (item.logo_url as string | null) ?? null,
    }
  );

  if (error && hits.length === 0) {
    return {
      watchlistId,
      newAlerts: 0,
      mode,
      error: `${error}. Vérifiez votre connexion ou configurez OMPIC_PROXY_URL (n8n).`,
    };
  }

  const matches = hits.filter(
    (m) => normalizeTitle(m.title) !== normalizeTitle(item.title as string)
  );

  const now = new Date().toISOString();
  await supabase
    .from("ip_watchlist")
    .update({ last_scan_at: now, updated_at: now })
    .eq("id", watchlistId);

  let newAlerts = 0;
  for (const m of matches.slice(0, 8)) {
    const ref = m.ref ?? m.title;
    const { data: existing } = await supabase
      .from("ip_watch_alerts")
      .select("id")
      .eq("watchlist_id", watchlistId)
      .eq("matched_ref", ref)
      .maybeSingle();

    if (existing) continue;

    const { error: insErr } = await supabase.from("ip_watch_alerts").insert({
      watchlist_id: watchlistId,
      similarity_score: m.score ?? null,
      matched_title: m.title,
      matched_source: m.source,
      matched_ref: ref,
      summary: m.summary ?? null,
      status: "new",
      metadata: {
        ...(m.publication_end_at || m.opposition_eligible
          ? {
              publication_end_at: m.publication_end_at ?? null,
              opposition_eligible:
                m.opposition_eligible ??
                (item.asset_type === "trademark" && m.publication_end_at != null),
            }
          : item.asset_type === "trademark"
            ? { opposition_eligible: true }
            : {}),
        ...(m.logo_score != null
          ? {
              logo_score: m.logo_score,
              text_score: m.text_score ?? null,
              match_kind: m.logo_score >= 0.72 ? "text_and_logo" : "text",
            }
          : {}),
      },
    });

    if (!insErr) newAlerts++;
  }

  if (newAlerts > 0 && item.owner_id) {
    const notifyInputs = [
      {
        userId: item.owner_id as string,
        projectId: (item.project_id as string | null) ?? undefined,
        notificationType: "warning" as const,
        title: "Alerte surveillance PI",
        body: `${newAlerts} similarité(s) pour « ${item.title} » (${mode}).`,
        actionUrl: "/dashboard/surveillance",
        metadata: { event: "watch_alert", watchlist_id: watchlistId, mode },
      },
    ];

    if (item.project_id) {
      const { data: project } = await supabase
        .from("projects")
        .select("assigned_to")
        .eq("id", item.project_id as string)
        .maybeSingle();

      const cpiId = project?.assigned_to as string | null | undefined;
      if (cpiId && cpiId !== item.owner_id) {
        notifyInputs.push({
          userId: cpiId,
          projectId: item.project_id as string,
          notificationType: "warning",
          title: "Alerte surveillance — dossier client",
          body: `${newAlerts} similarité(s) OMPIC pour « ${item.title} ».`,
          actionUrl: "/cpi/surveillance",
          metadata: { event: "watch_alert", watchlist_id: watchlistId, mode },
        });
      }
    }

    await Promise.all(notifyInputs.map((input) => notifyUser(input)));
  }

  return { watchlistId, newAlerts, mode };
}

export async function scanAllActiveWatchlist(
  supabase: SupabaseClient
): Promise<{ processed: number; newAlerts: number; outcomes: ScanWatchlistResult[] }> {
  const { data: items } = await supabase
    .from("ip_watchlist")
    .select("id")
    .eq("surveillance_active", true);

  const outcomes: ScanWatchlistResult[] = [];
  let newAlerts = 0;

  for (const item of items ?? []) {
    const result = await scanWatchlistItem(supabase, item.id);
    outcomes.push(result);
    newAlerts += result.newAlerts;
  }

  return { processed: items?.length ?? 0, newAlerts, outcomes };
}
