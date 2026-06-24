import type { AiSearchType } from "@/types/database";

export type AiSearchTypeConfig = {
  value: AiSearchType;
  label: string;
  description: string;
  placeholder: string;
  needsQuery: boolean;
  needsDocument?: boolean;
  usesPatentSearch: boolean;
};

/** Types exposés dans l'UI projet (hors report généré séparément) */
export const PROJECT_AI_SEARCH_TYPES: AiSearchTypeConfig[] = [
  {
    value: "novelty",
    label: "Nouveauté",
    description: "Antériorité brevets (EPO + OMPIC MA) et marques OMPIC",
    placeholder: "Mots-clés, description technique, classes IPC…",
    needsQuery: true,
    usesPatentSearch: true,
  },
  {
    value: "fto",
    label: "Liberté d'exploitation (FTO)",
    description: "Brevets actifs pouvant bloquer l'exploitation (EPO + OMPIC MA)",
    placeholder: "Produit, procédé ou technologie à commercialiser…",
    needsQuery: true,
    usesPatentSearch: true,
  },
  {
    value: "semantic",
    label: "Analyse sémantique",
    description: "Comparaison conceptuelle avec l'état de l'art",
    placeholder: "Concepts clés, problème technique, solution…",
    needsQuery: true,
    usesPatentSearch: true,
  },
  {
    value: "similarity",
    label: "Similarité",
    description: "Proximité avec le résumé d'invention du projet",
    placeholder: "Complément optionnel à la description du projet",
    needsQuery: false,
    usesPatentSearch: true,
  },
  {
    value: "summarization",
    label: "Résumé document",
    description: "Synthèse d'un document uploadé ou du dossier",
    placeholder: "Instructions optionnelles pour le résumé",
    needsQuery: false,
    needsDocument: false,
    usesPatentSearch: false,
  },
  {
    value: "classification",
    label: "Classification PI",
    description: "Classes IPC/CPC et type de protection suggérés",
    placeholder: "Domaine technique ou mots-clés",
    needsQuery: false,
    usesPatentSearch: false,
  },
  {
    value: "tag_suggestion",
    label: "Tags suggérés",
    description: "Étiquettes recommandées pour organiser le dossier",
    placeholder: "Contexte optionnel",
    needsQuery: false,
    usesPatentSearch: false,
  },
];

export function getSearchTypeLabel(type: string): string {
  return PROJECT_AI_SEARCH_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getSearchTypeConfig(type: AiSearchType): AiSearchTypeConfig | undefined {
  return PROJECT_AI_SEARCH_TYPES.find((t) => t.value === type);
}
