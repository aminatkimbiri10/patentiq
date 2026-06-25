"use client";

import { useMemo, useState } from "react";
import { createProject } from "@/lib/actions/projects";
import { CategorySelect } from "@/components/dashboard/category-select";
import { getProjectSummaryLabels } from "@/lib/project-summary-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header bg-muted/25">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

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
      <FormSection title="Informations générales" description="Titre, catégorie et description">
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
        <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
        <div className="space-y-2">
          <Label htmlFor="description">Description courte</Label>
          <Textarea id="description" name="description" rows={3} placeholder="Résumé en quelques lignes…" />
        </div>
      </FormSection>

      <FormSection
        title={labels.detailsCardTitle}
        description={labels.detailsCardDescription}
      >
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
      </FormSection>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Créer le projet
      </Button>
    </form>
  );
}
