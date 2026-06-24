"use client";

import { useMemo, useState } from "react";
import { createProject } from "@/lib/actions/projects";
import { CategorySelect } from "@/components/dashboard/category-select";
import { getProjectSummaryLabels } from "@/lib/project-summary-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectCreateForm({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  const [categoryId, setCategoryId] = useState("");

  const categorySlug = useMemo(
    () => categories.find((c) => c.id === categoryId)?.slug ?? null,
    [categories, categoryId]
  );

  const labels = getProjectSummaryLabels(categorySlug);

  return (
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
              placeholder={
                categorySlug === "marque"
                  ? "Ex. TechMaroc"
                  : categorySlug === "dessin-modele"
                    ? "Ex. Gourde isotherme Atlas"
                    : "Ex. Système de filtration innovant"
              }
            />
          </div>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
          <div className="space-y-2">
            <Label htmlFor="description">Description courte</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Résumé en quelques lignes…" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{labels.detailsCardTitle}</CardTitle>
          <CardDescription>{labels.detailsCardDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invention_summary">{labels.summaryLabel}</Label>
            <Textarea
              id="invention_summary"
              name="invention_summary"
              rows={4}
              placeholder={labels.summaryPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="need_description">Besoin / objectif PI</Label>
            <Textarea
              id="need_description"
              name="need_description"
              rows={3}
              placeholder={
                categorySlug === "marque"
                  ? "Enregistrement marque, classes Nice, opposition…"
                  : categorySlug === "dessin-modele"
                    ? "Protection apparence, classes Locarno, antériorité visuelle…"
                    : "Brevet, dépôt provisoire, étude de liberté…"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Créer le projet
      </Button>
    </form>
  );
}
