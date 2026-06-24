import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadPatentDossierForExport } from "@/lib/export/load-patent-dossier";
import { PatentDossierPrintClient } from "@/components/surveillance/patent-dossier-print-client";

export const metadata = { title: "Export dossier brevet — CPI" };

export default async function CpiExportDossierPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const loaded = await loadPatentDossierForExport(supabase, params.id);
  if (!loaded.ok) {
    if (loaded.status === 404) notFound();
    redirect(`/cpi/cases/${params.id}?tab=dossier&section=parcours-pi&pi=redaction`);
  }

  return (
    <PatentDossierPrintClient
      projectTitle={loaded.input.projectTitle}
      html={loaded.html}
    />
  );
}
