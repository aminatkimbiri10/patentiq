"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import type { IpAlertStatus, IpAssetType } from "@/types/surveillance";
import { scanWatchlistItem, scanAllActiveWatchlist } from "@/lib/surveillance/scan-watchlist-core";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatAlertStatusMessage,
  formatWatchlistScanMessage,
} from "@/lib/messages/user-feedback";

export type WatchlistRow = {
  id: string;
  project_id: string | null;
  owner_id: string;
  asset_type: IpAssetType;
  title: string;
  registration_number: string | null;
  nice_classes: string | null;
  summary: string | null;
  logo_url: string | null;
  registered_at: string | null;
  territory: string;
  surveillance_active: boolean;
  last_scan_at: string | null;
  created_at: string;
  projects?: { title: string; reference_code: string | null } | null;
};

export type WatchAlertRow = {
  id: string;
  watchlist_id: string;
  similarity_score: number | null;
  matched_title: string;
  matched_source: string;
  matched_ref: string | null;
  summary: string | null;
  status: IpAlertStatus;
  metadata?: {
    publication_end_at?: string | null;
    opposition_eligible?: boolean;
    logo_score?: number;
    text_score?: number;
    match_kind?: "text" | "text_and_logo";
    opposition?: {
      notes?: string;
      deadline_at?: string | null;
      status?: "draft" | "filed" | "closed";
      filed_at?: string | null;
      mandataire?: string | null;
    };
  };
  created_at: string;
  ip_watchlist?: { title: string; asset_type: IpAssetType } | null;
};


const createSchema = z.object({
  title: z.string().min(1).max(500),
  asset_type: z.enum(["trademark", "patent"]),
  project_id: z.string().uuid().optional(),
  registration_number: z.string().max(100).optional(),
  nice_classes: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  logo_url: z.string().max(2000).optional(),
  registered_at: z.string().optional(),
  territory: z.string().max(10).optional(),
});

export type WatchlistActionState = { success?: boolean; error?: string; message?: string };

export async function createWatchlistItem(
  _prev: WatchlistActionState,
  formData: FormData
): Promise<WatchlistActionState> {
  const ctx = await requireUser();
  const parsed = createSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    asset_type: formData.get("asset_type") ?? "trademark",
    project_id: formData.get("project_id") || undefined,
    registration_number: formData.get("registration_number") || undefined,
    nice_classes: formData.get("nice_classes") || undefined,
    summary: formData.get("summary") || undefined,
    logo_url: String(formData.get("logo_url") ?? "").trim() || undefined,
    registered_at: formData.get("registered_at") || undefined,
    territory: formData.get("territory") || "MA",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("ip_watchlist").insert({
    owner_id: ctx.user.id,
    title: parsed.data.title,
    asset_type: parsed.data.asset_type,
    project_id: parsed.data.project_id ?? null,
    registration_number: parsed.data.registration_number ?? null,
    nice_classes: parsed.data.nice_classes ?? null,
    summary: parsed.data.summary ?? null,
    logo_url: parsed.data.logo_url ?? null,
    registered_at: parsed.data.registered_at ?? null,
    territory: parsed.data.territory ?? "MA",
    surveillance_active: true,
    metadata: {},
  });

  if (error) return { error: error.message };

  revalidatePath("/cpi/surveillance");
  revalidatePath("/dashboard/surveillance");
  return { success: true, message: "Actif ajouté à la surveillance." };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export async function importWatchlistFromCsv(
  _prev: WatchlistActionState,
  formData: FormData
): Promise<WatchlistActionState> {
  const ctx = await requireUser();
  const raw = String(formData.get("csv") ?? "").trim();
  if (!raw) return { error: "Collez un fichier CSV ou des lignes à importer." };

  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { error: "CSV invalide — en-tête + au moins une ligne requise." };
  }

  const header = parseCsvLine(lines[0].toLowerCase());
  const titleIdx = header.indexOf("title");
  const typeIdx = header.indexOf("asset_type");
  if (titleIdx < 0) {
    return { error: "Colonne obligatoire manquante : title" };
  }

  const rows: Record<string, string | null>[] = [];
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const title = cells[titleIdx]?.trim();
    if (!title) continue;

    const assetType = (typeIdx >= 0 ? cells[typeIdx] : "trademark")?.trim() || "trademark";
    if (!["trademark", "patent"].includes(assetType)) continue;

    const get = (col: string) => {
      const idx = header.indexOf(col);
      return idx >= 0 ? cells[idx]?.trim() || null : null;
    };

    rows.push({
      title,
      asset_type: assetType,
      registration_number: get("registration_number"),
      nice_classes: get("nice_classes"),
      summary: get("summary"),
      territory: get("territory") ?? "MA",
    });
  }

  if (!rows.length) return { error: "Aucune ligne valide à importer." };

  const supabase = await createClient();
  const { error } = await supabase.from("ip_watchlist").insert(
    rows.map((row) => ({
      owner_id: ctx.user.id,
      title: row.title as string,
      asset_type: row.asset_type as IpAssetType,
      registration_number: row.registration_number,
      nice_classes: row.nice_classes,
      summary: row.summary,
      territory: row.territory ?? "MA",
      surveillance_active: true,
    }))
  );

  if (error) return { error: error.message };

  revalidatePath("/cpi/surveillance");
  revalidatePath("/dashboard/surveillance");
  return {
    success: true,
    message: `${rows.length} actif${rows.length > 1 ? "s" : ""} importé${rows.length > 1 ? "s" : ""} dans le portefeuille.`,
  };
}

export async function listWatchlistForUser(): Promise<WatchlistRow[]> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: isCpi } = await supabase.rpc("has_role", { p_role: "cpi_advisor" });

  let query = supabase
    .from("ip_watchlist")
    .select("*, projects(title, reference_code)")
    .order("created_at", { ascending: false });

  if (!isCpi) {
    query = query.eq("owner_id", ctx.user.id);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as WatchlistRow[];
}

export async function listWatchAlerts(limit = 50): Promise<WatchAlertRow[]> {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ip_watch_alerts")
    .select("*, ip_watchlist(title, asset_type)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as WatchAlertRow[];
}

export async function runWatchlistScan(watchlistId: string): Promise<WatchlistActionState> {
  await requireUser();
  const supabase = await createClient();
  const result = await scanWatchlistItem(supabase, watchlistId);

  if (result.error) return { error: result.error };

  revalidatePath("/cpi/surveillance");
  revalidatePath("/dashboard/surveillance");

  return {
    success: true,
    message: formatWatchlistScanMessage(result.newAlerts, result.mode),
  };
}

export async function runMyWatchlistScans(): Promise<WatchlistActionState> {
  await requireUser();
  const supabase = await createClient();
  const items = (await listWatchlistForUser()).filter((i) => i.surveillance_active);

  if (!items.length) {
    return { error: "Aucun actif actif à scanner — ajoutez un actif au portefeuille." };
  }

  let totalAlerts = 0;
  for (const item of items) {
    const result = await scanWatchlistItem(supabase, item.id);
    if (result.error) return { error: result.error };
    totalAlerts += result.newAlerts;
  }

  revalidatePath("/cpi/surveillance");
  revalidatePath("/dashboard/surveillance");

  return {
    success: true,
    message:
      totalAlerts > 0
        ? `${items.length} actif(s) scanné(s) — ${totalAlerts} nouvelle(s) alerte(s).`
        : `${items.length} actif(s) scanné(s) — aucune nouvelle similarité.`,
  };
}

export async function runAllActiveScans(): Promise<{ processed: number; alerts: number }> {
  const supabase = createAdminClient();
  const { processed, newAlerts } = await scanAllActiveWatchlist(supabase);
  return { processed, alerts: newAlerts };
}

export async function updateAlertStatus(
  alertId: string,
  status: IpAlertStatus
): Promise<WatchlistActionState> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("ip_watch_alerts")
    .update({ status })
    .eq("id", alertId);

  if (error) return { error: error.message };

  revalidatePath("/cpi/surveillance");
  revalidatePath("/dashboard/surveillance");
  return { success: true, message: formatAlertStatusMessage(status) };
}

export async function toggleWatchlistActive(
  watchlistId: string,
  active: boolean
): Promise<WatchlistActionState> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("ip_watchlist")
    .update({ surveillance_active: active, updated_at: new Date().toISOString() })
    .eq("id", watchlistId);

  if (error) return { error: error.message };
  revalidatePath("/cpi/surveillance");
  revalidatePath("/dashboard/surveillance");
  return {
    success: true,
    message: active ? "Surveillance reprise pour cet actif." : "Surveillance mise en pause.",
  };
}
