"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { runTechWatchScan } from "@/lib/surveillance/tech-watch-runner";
import type { TechWatchRow } from "@/lib/surveillance/tech-watch-runner";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  keywords: z.string().min(3).max(500),
  ipc_classes: z.string().max(200).optional(),
  project_id: z.string().uuid().optional(),
  territory: z.string().max(20).optional(),
  watch_kind: z.enum(["patent", "design"]).optional(),
});

export type TechWatchActionState = { success?: boolean; error?: string; message?: string };

export async function createTechWatch(
  _prev: TechWatchActionState,
  formData: FormData
): Promise<TechWatchActionState> {
  const ctx = await requireUser();
  const parsed = createSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    keywords: String(formData.get("keywords") ?? "").trim(),
    ipc_classes: formData.get("ipc_classes") || undefined,
    project_id: formData.get("project_id") || undefined,
    territory: formData.get("territory") || "MA+EP",
    watch_kind: formData.get("watch_kind") || "patent",
  });

  if (!parsed.success) return { error: "Données invalides" };

  const supabase = await createClient();
  const { error } = await supabase.from("ip_tech_watch").insert({
    owner_id: ctx.user.id,
    title: parsed.data.title,
    keywords: parsed.data.keywords,
    ipc_classes: parsed.data.ipc_classes ?? null,
    project_id: parsed.data.project_id ?? null,
    territory: parsed.data.territory ?? "MA+EP",
    watch_kind: parsed.data.watch_kind ?? "patent",
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/surveillance");
  revalidatePath("/cpi/surveillance");
  return { success: true, message: "Veille technologique créée." };
}

export async function listTechWatchForUser(): Promise<TechWatchRow[]> {
  const ctx = await requireUser();
  const supabase = await createClient();
  const { data: isCpi } = await supabase.rpc("has_role", { p_role: "cpi_advisor" });

  let q = supabase.from("ip_tech_watch").select("*").order("created_at", { ascending: false });
  if (!isCpi) q = q.eq("owner_id", ctx.user.id);

  const { data } = await q;
  return (data ?? []) as TechWatchRow[];
}

export async function runTechWatchScanAction(watchId: string): Promise<TechWatchActionState> {
  await requireUser();
  const supabase = await createClient();
  const result = await runTechWatchScan(supabase, watchId);
  if (result.error) return { error: result.error };
  revalidatePath("/dashboard/surveillance");
  revalidatePath("/cpi/surveillance");
  return {
    success: true,
    message: result.summary ?? `Scan terminé (${result.hits} résultat(s)).`,
  };
}
