import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { createProject } from "@/lib/actions/projects";
import { PageHeader } from "@/components/shared/page-header";
import { CategorySelect } from "@/components/dashboard/category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link href="/dashboard/projects">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour aux projets
        </Link>
      </Button>

      <PageHeader
        eyebrow="Nouveau dossier"
        title="Créer un projet"
        description="Décrivez votre invention ou votre besoin en propriété intellectuelle."
      />

      <form action={createProject} className="space-y-6">
        <Card className="card-elevated border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Informations générales</CardTitle>
            <CardDescription>Titre, catégorie et description du projet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ex. Système de filtration innovant"
              />
            </div>
            <CategorySelect categories={categories ?? []} />
            <div className="space-y-2">
              <Label htmlFor="description">Description courte</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Résumé en quelques lignes…" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Détails techniques</CardTitle>
            <CardDescription>Aidez votre CPI et experts à comprendre le projet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invention_summary">Résumé de l&apos;invention</Label>
              <Textarea
                id="invention_summary"
                name="invention_summary"
                rows={4}
                placeholder="Problème résolu, solution technique, avantages…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="need_description">Besoin / objectif PI</Label>
              <Textarea
                id="need_description"
                name="need_description"
                rows={3}
                placeholder="Brevet, marque, dépôt provisoire, étude de liberté…"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Créer le projet
        </Button>
      </form>
    </div>
  );
}
