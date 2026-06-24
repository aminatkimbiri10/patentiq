import {
  isBrevetCategory,
  isDesignCategory,
  isMarqueCategory,
} from "@/lib/workflow/category-slugs";

export type ProjectSummaryLabels = {
  summaryLabel: string;
  summaryPlaceholder: string;
  detailsCardTitle: string;
  detailsCardDescription: string;
  pageDescription: string;
};

export function getProjectSummaryLabels(categorySlug?: string | null): ProjectSummaryLabels {
  if (isMarqueCategory(categorySlug)) {
    return {
      summaryLabel: "Description de la marque",
      summaryPlaceholder:
        "Signe distinctif, produits ou services couverts, éléments verbaux ou visuels…",
      detailsCardTitle: "Informations marque",
      detailsCardDescription: "Décrivez le signe et votre objectif de protection",
      pageDescription: "Décrivez votre marque et votre besoin en propriété intellectuelle.",
    };
  }

  if (isDesignCategory(categorySlug)) {
    return {
      summaryLabel: "Description du dessin & modèle",
      summaryPlaceholder: "Apparence, vues, produit concerné, classes Locarno visées…",
      detailsCardTitle: "Informations dessin & modèle",
      detailsCardDescription: "Décrivez l'apparence protégée et le contexte du dépôt",
      pageDescription: "Décrivez votre dessin ou modèle et votre besoin en propriété intellectuelle.",
    };
  }

  if (isBrevetCategory(categorySlug)) {
    return {
      summaryLabel: "Résumé de l'invention",
      summaryPlaceholder: "Problème résolu, solution technique, avantages…",
      detailsCardTitle: "Détails techniques",
      detailsCardDescription: "Aidez votre CPI et experts à comprendre l'invention",
      pageDescription: "Décrivez votre invention et votre besoin en propriété intellectuelle.",
    };
  }

  return {
    summaryLabel: "Résumé du projet",
    summaryPlaceholder: "Contexte, objectifs, éléments clés…",
    detailsCardTitle: "Détails du dossier",
    detailsCardDescription: "Aidez votre CPI à comprendre le besoin",
    pageDescription: "Décrivez votre projet et votre besoin en propriété intellectuelle.",
  };
}

/** Libellé court pour les messages IA (similarité, requête vide, etc.) */
export function getProjectSummaryFieldLabel(categorySlug?: string | null): string {
  return getProjectSummaryLabels(categorySlug).summaryLabel.toLowerCase();
}
