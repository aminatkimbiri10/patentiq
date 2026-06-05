import { createAdminClient } from "@/lib/supabase/admin";

type CpiCandidate = {
  userId: string;
  fullName: string | null;
  activeAssignments: number;
};

export async function listCpiAdvisors(): Promise<CpiCandidate[]> {
  const admin = createAdminClient();

  const { data: roleRow } = await admin
    .from("roles")
    .select("id")
    .eq("role_name", "cpi_advisor")
    .single();

  if (!roleRow) return [];

  const { data: userRoles, error: urError } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", roleRow.id);

  if (urError) {
    console.error("[workflow] listCpiAdvisors:", urError.message);
    return [];
  }

  const cpiIds = (userRoles ?? []).map((ur) => ur.user_id as string);
  if (!cpiIds.length) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", cpiIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? null])
  );

  const { data: activeProjects } = await admin
    .from("projects")
    .select("assigned_to, status")
    .in("assigned_to", cpiIds);

  const counts = new Map<string, number>();
  for (const id of cpiIds) counts.set(id, 0);
  for (const row of activeProjects ?? []) {
    if (
      row.assigned_to &&
      row.status !== "closed" &&
      row.status !== "rejected"
    ) {
      counts.set(row.assigned_to, (counts.get(row.assigned_to) ?? 0) + 1);
    }
  }

  return cpiIds.map((userId) => ({
    userId,
    fullName: nameById.get(userId) ?? null,
    activeAssignments: counts.get(userId) ?? 0,
  }));
}

/** Choisit le CPI avec le moins de dossiers actifs (ou l'ID par défaut des settings). */
export async function pickCpiAdvisor(preferredUserId?: string | null): Promise<CpiCandidate | null> {
  const candidates = await listCpiAdvisors();
  if (!candidates.length) return null;

  if (preferredUserId) {
    const preferred = candidates.find((c) => c.userId === preferredUserId);
    if (preferred) return preferred;
  }

  return [...candidates].sort((a, b) => a.activeAssignments - b.activeAssignments)[0];
}

export async function assignCpiToProject(
  projectId: string,
  cpiUserId: string,
  invitedBy: string
): Promise<void> {
  const admin = createAdminClient();

  const { error: projectError } = await admin
    .from("projects")
    .update({ assigned_to: cpiUserId })
    .eq("id", projectId);

  if (projectError) throw new Error(projectError.message);

  const { error: memberError } = await admin.from("project_members").upsert(
    {
      project_id: projectId,
      user_id: cpiUserId,
      member_role: "cpi_advisor",
      invited_by: invitedBy,
      can_edit: true,
      can_comment: true,
      can_upload: true,
    },
    { onConflict: "project_id,user_id" }
  );

  if (memberError) throw new Error(memberError.message);
}
