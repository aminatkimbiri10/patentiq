"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { type DesignLifecycleStatus } from "@/lib/workflow/design-lifecycle";

const schema = z.object({
  project_id: z.string().uuid(),
  status: z.enum([
    "depose",
    "examen",
    "publie",
    "enregistre",
    "surveillance_active",
  ]),
  notes: z.string().max(2000).optional(),
});

export type DesignLifecycleActionState = { success?: boolean; error?: string; message?: string };

export async function updateDesignLifecycle(
  _prev: DesignLifecycleActionState,
  formData: FormData
): Promise<DesignLifecycleActionState> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const [{ data: isCpi }, { data: isAdmin }] = await Promise.all([
    supabase.rpc("has_role", { p_role: "cpi_advisor" }),
    supabase.rpc("has_role", { p_role: "admin" }),
  ]);

  const parsed = schema.safeParse({
    project_id: formData.get("project_id"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { error: "Données invalides" };

  const { data: project } = await supabase
    .from("projects")
    .select("metadata, owner_id")
    .eq("id", parsed.data.project_id)
    .single();

  if (!project) return { error: "Projet introuvable" };

  const isOwner = project.owner_id === ctx.user.id;
  if (!isCpi && !isAdmin && !isOwner) {
    return { error: "Non autorisé" };
  }

  const meta = (project.metadata as Record<string, unknown>) ?? {};
  const prev = (meta.design_lifecycle as Record<string, unknown>) ?? {};
  const status = parsed.data.status as DesignLifecycleStatus;
  const now = new Date().toISOString();

  const lifecycle: Record<string, unknown> = {
    ...prev,
    status,
    notes: parsed.data.notes ?? prev.notes ?? null,
  };

  if (status === "depose" && !prev.deposited_at) {
    lifecycle.deposited_at = now;
  }
  if (status === "publie" && !prev.published_at) {
    lifecycle.published_at = now;
  }
  if (status === "enregistre" && !prev.registered_at) {
    lifecycle.registered_at = now;
  }

  const { error } = await supabase
    .from("projects")
    .update({
      metadata: { ...meta, design_lifecycle: lifecycle },
      updated_at: now,
    })
    .eq("id", parsed.data.project_id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  return { success: true, message: "Cycle dessin & modèle mis à jour." };
}
