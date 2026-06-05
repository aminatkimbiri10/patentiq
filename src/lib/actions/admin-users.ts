"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { logAction } from "@/lib/audit/log-action";
import { APP_ROLES, type AppRole } from "@/types/roles";

const assignRoleSchema = z.object({
  user_id: z.string().uuid(),
  role_name: z.enum(APP_ROLES),
});

async function requireAdmin() {
  const ctx = await requireUser();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("has_role", { p_role: "admin" });
  if (!isAdmin) throw new Error("Accès administrateur requis");
  return { ctx, supabase };
}

export type AdminRoleActionState = { success?: boolean; error?: string; message?: string };

export async function assignUserPrimaryRole(
  _prev: AdminRoleActionState,
  formData: FormData
): Promise<AdminRoleActionState> {
  const parsed = assignRoleSchema.safeParse({
    user_id: formData.get("user_id"),
    role_name: formData.get("role_name"),
  });

  if (!parsed.success) return { error: "Données invalides" };

  try {
    const { ctx, supabase } = await requireAdmin();

    const { data: roleRow, error: roleErr } = await supabase
      .from("roles")
      .select("id")
      .eq("role_name", parsed.data.role_name)
      .single();

    if (roleErr || !roleRow) return { error: "Rôle introuvable" };

    const { data: existing } = await supabase
      .from("user_roles")
      .select("id, role_id, is_primary")
      .eq("user_id", parsed.data.user_id);

    const hasTarget = (existing ?? []).some((ur) => ur.role_id === roleRow.id);

    if (!hasTarget) {
      const { error: insertErr } = await supabase.from("user_roles").insert({
        user_id: parsed.data.user_id,
        role_id: roleRow.id,
        is_primary: true,
        assigned_by: ctx.user.id,
      });
      if (insertErr) return { error: insertErr.message };
    }

    for (const ur of existing ?? []) {
      const shouldBePrimary = ur.role_id === roleRow.id;
      if (ur.is_primary !== shouldBePrimary) {
        const { error: updErr } = await supabase
          .from("user_roles")
          .update({ is_primary: shouldBePrimary })
          .eq("id", ur.id);
        if (updErr) return { error: updErr.message };
      }
    }

    await logAction({
      action: "role_assign",
      entityType: "user",
      entityId: parsed.data.user_id,
      newData: { role_name: parsed.data.role_name, is_primary: true },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Rôle principal mis à jour." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur" };
  }
}

export type AdminUserWithRoles = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  created_at: string;
  primaryRole: AppRole | null;
  roles: AppRole[];
};

export async function listAdminUsers(): Promise<AdminUserWithRoles[]> {
  const { supabase } = await requireAdmin();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, company, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!profiles?.length) return [];

  const userIds = profiles.map((p) => p.id as string);
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, is_primary, roles(role_name)")
    .in("user_id", userIds);

  const rolesByUser = new Map<string, { roles: AppRole[]; primary: AppRole | null }>();

  for (const ur of userRoles ?? []) {
    const uid = ur.user_id as string;
    const roleJoin = ur.roles as { role_name: AppRole } | { role_name: AppRole }[] | null;
    const roleName = Array.isArray(roleJoin) ? roleJoin[0]?.role_name : roleJoin?.role_name;
    if (!roleName) continue;

    const entry = rolesByUser.get(uid) ?? { roles: [], primary: null };
    entry.roles.push(roleName);
    if (ur.is_primary) entry.primary = roleName;
    rolesByUser.set(uid, entry);
  }

  return profiles.map((p) => {
    const r = rolesByUser.get(p.id as string);
    return {
      id: p.id as string,
      email: p.email as string,
      full_name: (p.full_name as string | null) ?? null,
      company: (p.company as string | null) ?? null,
      created_at: p.created_at as string,
      primaryRole: r?.primary ?? r?.roles[0] ?? null,
      roles: r?.roles ?? [],
    };
  });
}
