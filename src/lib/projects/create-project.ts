import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateProjectInput } from "@/lib/validations/project";
import type { UserContext } from "@/lib/auth/get-user";

function isRlsError(message?: string | null) {
  return (message ?? "").includes("row-level security");
}

function isMissingRpcError(message?: string | null, code?: string | null) {
  if (code === "PGRST202") return true;
  const m = message ?? "";
  return (
    m.includes("Could not find the function") ||
    m.includes("function public.create_project") ||
    m.includes("does not exist")
  );
}

async function assertCanCreateProject(ctx: UserContext) {
  const supabase = await createClient();

  const [{ data: isHolder }, { data: isAdmin }, { count }] = await Promise.all([
    supabase.rpc("has_role", { p_role: "project_holder" }),
    supabase.rpc("has_role", { p_role: "admin" }),
    supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.user.id),
  ]);

  const hasCreatorRole = Boolean(isHolder || isAdmin);
  const hasNoRole = (count ?? 0) === 0;

  if (!hasCreatorRole && !hasNoRole) {
    const roleLabel = ctx.primaryRole ?? "inconnu";
    throw new Error(
      `Votre rôle (${roleLabel}) ne permet pas de créer un projet. Connectez-vous avec le compte « Porteur de projet » ou contactez un administrateur.`
    );
  }
}

async function insertWithAdmin(ctx: UserContext, payload: Record<string, unknown>) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert({
      ...payload,
      owner_id: ctx.user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Erreur lors de la création du projet");
  }

  return data.id;
}

export async function insertProjectForUser(
  ctx: UserContext,
  input: CreateProjectInput
): Promise<string> {
  await assertCanCreateProject(ctx);

  const payload = {
    title: input.title,
    description: input.description ?? null,
    invention_summary: input.invention_summary ?? null,
    need_description: input.need_description ?? null,
    category_id: input.category_id || null,
  };

  const supabase = await createClient();

  const { data: rpcId, error: rpcError } = await supabase.rpc("create_project", {
    p_title: payload.title,
    p_description: payload.description,
    p_invention_summary: payload.invention_summary,
    p_need_description: payload.need_description,
    p_category_id: payload.category_id,
  });

  if (!rpcError && rpcId) {
    return String(rpcId);
  }

  const { data, error: insertError } = await supabase
    .from("projects")
    .insert({
      ...payload,
      owner_id: ctx.user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (!insertError && data?.id) {
    return data.id;
  }

  if (
    isRlsError(insertError?.message) ||
    isRlsError(rpcError?.message) ||
    isMissingRpcError(rpcError?.message, rpcError?.code)
  ) {
    return insertWithAdmin(ctx, payload);
  }

  throw new Error(
    insertError?.message ?? rpcError?.message ?? "Erreur lors de la création du projet"
  );
}
