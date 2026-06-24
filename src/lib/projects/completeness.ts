/**
 * Score de complétude d'un dossier PI — inspiré du « docketing » (Anaqua / Alt Legal),
 * adapté au parcours OMPIC. Fonction pure (testable) : pas d'accès base ni réseau.
 */

export type CompletenessItem = {
  id: string;
  label: string;
  done: boolean;
  /** Pondération relative dans le score global. */
  weight: number;
  /** Progression fractionnaire (0..1) pour les éléments graduels (ex. checklist). */
  ratio?: number;
  hint?: string;
};

export type CompletenessLevel = "incomplet" | "en_cours" | "presque" | "complet";

export type ProjectCompleteness = {
  percent: number;
  level: CompletenessLevel;
  levelLabel: string;
  items: CompletenessItem[];
  /** Premier conseil actionnable (élément non terminé le plus prioritaire). */
  nextAction: string | null;
};

export type CompletenessInput = {
  inventionSummary?: string | null;
  needDescription?: string | null;
  categorySlug?: string | null;
  documentCount: number;
  checklistDone: number;
  checklistTotal: number;
};

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length >= 10;
}

function levelFor(percent: number): { level: CompletenessLevel; label: string } {
  if (percent >= 100) return { level: "complet", label: "Prêt à instruire" };
  if (percent >= 67) return { level: "presque", label: "Presque complet" };
  if (percent >= 34) return { level: "en_cours", label: "En cours" };
  return { level: "incomplet", label: "À compléter" };
}

/** Calcule un score pondéré (0..100) et le détail des points manquants. */
export function computeProjectCompleteness(input: CompletenessInput): ProjectCompleteness {
  const hasSummary = hasText(input.inventionSummary) || hasText(input.needDescription);
  const hasCategory = !!input.categorySlug;
  const hasDocuments = input.documentCount > 0;
  const checklistRatio =
    input.checklistTotal > 0
      ? Math.min(1, Math.max(0, input.checklistDone / input.checklistTotal))
      : 0;

  const items: CompletenessItem[] = [
    {
      id: "objet",
      label: "Objet du dossier décrit",
      done: hasSummary,
      weight: 2,
      hint: "Renseignez le résumé / la description (au moins quelques phrases).",
    },
    {
      id: "categorie",
      label: "Type de protection défini",
      done: hasCategory,
      weight: 1,
      hint: "Sélectionnez une catégorie (brevet, marque, dessin & modèle…).",
    },
    {
      id: "documents",
      label: "Au moins un document ajouté",
      done: hasDocuments,
      weight: 2,
      hint: "Téléversez un document de support (descriptif, visuel, justificatif).",
    },
    {
      id: "checklist",
      label: `Checklist PI complétée (${input.checklistDone}/${input.checklistTotal})`,
      done: input.checklistTotal > 0 && checklistRatio >= 1,
      weight: 5,
      ratio: checklistRatio,
      hint: "Cochez les étapes restantes de la checklist du dossier.",
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const score = items.reduce((sum, item) => {
    const contribution = item.ratio != null ? item.ratio : item.done ? 1 : 0;
    return sum + contribution * item.weight;
  }, 0);

  const percent = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  const { level, label } = levelFor(percent);

  const pending = items.find((item) => !item.done);

  return {
    percent,
    level,
    levelLabel: label,
    items,
    nextAction: pending?.hint ?? null,
  };
}
