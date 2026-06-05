import { createAdminClient } from "@/lib/supabase/admin";

type ExpertCandidate = {
  userId: string;
  fullName: string | null;
  activeAssignments: number;
};

export async function listExperts(): Promise<ExpertCandidate[]> {
  const admin = createAdminClient();

  const { data: roleRow } = await admin
    .from("roles")
    .select("id")
    .eq("role_name", "expert")
    .single();

  if (!roleRow) return [];

  const { data: userRoles, error } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", roleRow.id);

  if (error || !userRoles?.length) return [];

  const expertIds = userRoles.map((ur) => ur.user_id as string);

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", expertIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? null])
  );

  const { data: activeProjects } = await admin
    .from("projects")
    .select("expert_id, status")
    .in("expert_id", expertIds);

  const counts = new Map<string, number>();
  for (const id of expertIds) counts.set(id, 0);
  for (const row of activeProjects ?? []) {
    if (
      row.expert_id &&
      row.status !== "closed" &&
      row.status !== "rejected"
    ) {
      counts.set(row.expert_id, (counts.get(row.expert_id) ?? 0) + 1);
    }
  }

  return expertIds.map((userId) => ({
    userId,
    fullName: nameById.get(userId) ?? null,
    activeAssignments: counts.get(userId) ?? 0,
  }));
}

export async function pickExpert(): Promise<ExpertCandidate | null> {
  const candidates = await listExperts();
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => a.activeAssignments - b.activeAssignments)[0];
}
