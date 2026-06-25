import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCreateForm } from "@/components/dashboard/project-create-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Nouveau projet" };

export default async function NewProjectPage() {
  const ctx = await requireUser();
  if (
    ctx.primaryRole &&
    ctx.primaryRole !== "project_holder" &&
    ctx.primaryRole !== "admin"
  ) {
    redirect("/dashboard/projects?error=role");
  }

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="dash-page mx-auto w-full min-w-0 max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link href="/dashboard/projects">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour aux projets
        </Link>
      </Button>

      <PageHeader
        icon={FilePlus2}
        eyebrow="Nouveau dossier"
        title="Créer un projet"
        description="Décrivez votre projet et votre besoin en propriété intellectuelle."
      />

      <ProjectCreateForm categories={categories ?? []} />
    </div>
  );
}
