"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { logProjectActivity } from "@/lib/project-activity/log";

export type OppositionDossier = {
  notes?: string;
  deadline_at?: string | null;
  status?: "draft" | "filed" | "closed";
  filed_at?: string | null;
  mandataire?: string | null;
};

const saveSchema = z.object({
  alert_id: z.string().uuid(),
  notes: z.string().max(5000).optional(),
  deadline_at: z.string().optional(),
  status: z.enum(["draft", "filed", "closed"]).optional(),
  mandataire: z.string().max(300).optional(),
});

export type OppositionActionState = { success?: boolean; error?: string; message?: string };

export async function saveOppositionDossier(
  _prev: OppositionActionState,
  formData: FormData
): Promise<OppositionActionState> {
  const ctx = await requireUser();
  const parsed = saveSchema.safeParse({
    alert_id: formData.get("alert_id"),
    notes: String(formData.get("notes") ?? "").trim() || undefined,
    deadline_at: String(formData.get("deadline_at") ?? "").trim() || undefined,
    status: formData.get("status") || "draft",
    mandataire: String(formData.get("mandataire") ?? "").trim() || undefined,
  });

  if (!parsed.success) return { error: "Données invalides" };

  const supabase = await createClient();
  const { data: alert, error: fetchErr } = await supabase
    .from("ip_watch_alerts")
    .select("id, matched_title, metadata, watchlist_id, ip_watchlist(project_id, title)")
    .eq("id", parsed.data.alert_id)
    .single();

  if (fetchErr || !alert) return { error: "Alerte introuvable" };

  const prevMeta = (alert.metadata as Record<string, unknown>) ?? {};
  const prevOpp = (prevMeta.opposition as OppositionDossier) ?? {};
  const status = parsed.data.status ?? "draft";

  const opposition: OppositionDossier = {
    ...prevOpp,
    notes: parsed.data.notes ?? prevOpp.notes,
    deadline_at: parsed.data.deadline_at ?? prevOpp.deadline_at,
    status,
    mandataire: parsed.data.mandataire ?? prevOpp.mandataire,
    filed_at:
      status === "filed" && !prevOpp.filed_at
        ? new Date().toISOString()
        : prevOpp.filed_at ?? null,
  };

  const alertStatus = status === "filed" ? "opposition_filed" : undefined;

  const { error } = await supabase
    .from("ip_watch_alerts")
    .update({
      metadata: { ...prevMeta, opposition },
      ...(alertStatus ? { status: alertStatus } : {}),
    })
    .eq("id", parsed.data.alert_id);

  if (error) return { error: error.message };

  const watchlist = alert.ip_watchlist as {
    project_id?: string | null;
    title?: string;
  } | null;

  if (watchlist?.project_id) {
    await logProjectActivity(supabase, {
      projectId: watchlist.project_id,
      authorId: ctx.user.id,
      kind: "opposition_updated",
      title: "Fiche opposition mise à jour",
      content: `Alerte « ${alert.matched_title ?? "similarité"} » — statut ${status}.`,
      metadata: { alert_id: parsed.data.alert_id },
    });
  }

  revalidatePath("/dashboard/surveillance");
  revalidatePath("/cpi/surveillance");
  if (watchlist?.project_id) {
    revalidatePath(`/dashboard/projects/${watchlist.project_id}`);
    revalidatePath(`/cpi/cases/${watchlist.project_id}`);
  }

  return {
    success: true,
    message:
      status === "filed"
        ? "Opposition enregistrée dans le dossier."
        : "Fiche opposition enregistrée.",
  };
}

export async function searchOmpicTrademarksAction(input: {
  query: string;
  niceClasses?: string;
  searchType?: "phonetic" | "exact";
}): Promise<{
  hits: Array<{ title: string; ref?: string; score?: number; summary?: string }>;
  total: number | null;
  error?: string;
}> {
  await requireUser();
  const { searchOmpicTrademarks } = await import("@/lib/surveillance/ompic-trademark-search");
  const result = await searchOmpicTrademarks({
    query: input.query,
    niceClasses: input.niceClasses,
    searchType: input.searchType ?? "phonetic",
    maxResults: 25,
  });
  return {
    hits: result.hits,
    total: result.total,
    error: result.error,
  };
}
