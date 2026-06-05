/**
 * Répare les projets soumis sans CPI assigné.
 * Usage: node scripts/repair-submitted.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, key);

async function main() {
  const { data: roleRow } = await admin
    .from("roles")
    .select("id")
    .eq("role_name", "cpi_advisor")
    .single();

  const { data: cpiRoles } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", roleRow.id);

  const cpiId = cpiRoles?.[0]?.user_id;
  if (!cpiId) {
    console.error("No CPI advisor found");
    process.exit(1);
  }

  const { data: stuck } = await admin
    .from("projects")
    .select("id, title, reference_code, owner_id")
    .eq("status", "submitted")
    .is("assigned_to", null);

  console.log(`Found ${stuck?.length ?? 0} project(s) to repair`);

  for (const p of stuck ?? []) {
    const ref = p.reference_code ?? p.id.slice(0, 8);

    await admin
      .from("projects")
      .update({ assigned_to: cpiId, status: "in_review" })
      .eq("id", p.id);

    await admin.from("project_members").upsert(
      {
        project_id: p.id,
        user_id: cpiId,
        member_role: "cpi_advisor",
        invited_by: p.owner_id,
        can_edit: true,
        can_comment: true,
        can_upload: true,
      },
      { onConflict: "project_id,user_id" }
    );

    await admin.from("project_updates").insert({
      project_id: p.id,
      author_id: p.owner_id,
      update_type: "status_change",
      title: "Dossier soumis",
      content: "Assignation CPI automatique (réparation).",
      new_value: { status: "in_review", assigned_to: cpiId },
      metadata: { workflow: "repair" },
    });

    await admin.from("notifications").insert([
      {
        user_id: cpiId,
        project_id: p.id,
        notification_type: "action_required",
        title: "Nouveau dossier à traiter",
        body: `Le projet « ${p.title} » (${ref}) vous est assigné.`,
        action_url: `/cpi/cases/${p.id}`,
      },
      {
        user_id: p.owner_id,
        project_id: p.id,
        notification_type: "success",
        title: "Dossier soumis",
        body: `Votre projet « ${p.title} » a été transmis à votre conseiller PI.`,
        action_url: `/dashboard/projects/${p.id}`,
      },
    ]);

    console.log(`Repaired: ${p.title} (${p.id}) → CPI ${cpiId}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
