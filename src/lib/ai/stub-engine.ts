import type { AiSearchType } from "@/types/database";

export type StubAiResult = {
  result_type: string;
  title: string;
  summary: string;
  score: number;
  rank: number;
  source_ref: string;
  payload: Record<string, unknown>;
};

const SAMPLE_PATENTS = [
  { ref: "EP3847291A1", title: "Système de filtration membranaire modulaire" },
  { ref: "US20230145892", title: "Water purification apparatus with smart sensors" },
  { ref: "WO2022156789", title: "Modular filter cartridge assembly" },
  { ref: "FR3078912", title: "Dispositif de traitement des effluents industriels" },
  { ref: "CN114582301A", title: "Composite membrane filtration module" },
];

/**
 * Moteur stub — simule une recherche de nouveauté sans appel LLM externe.
 * Remplaçable par un vrai provider (OpenAI, Questel API, etc.).
 */
export function generateStubResults(
  query: string | null,
  searchType: AiSearchType
): { summary: string; results: StubAiResult[] } {
  const q = query?.trim() || "analyse générale";
  const keywords = q.split(/\s+/).filter(Boolean).slice(0, 5);

  const results: StubAiResult[] = SAMPLE_PATENTS.slice(0, 4).map((p, i) => {
    const relevance = Math.max(0.42, 0.92 - i * 0.12 + (keywords.length > 2 ? 0.05 : 0));
    const matched = keywords.length
      ? keywords.slice(0, 2).join(", ")
      : "terme technique";

    return {
      result_type: searchType === "novelty" ? "prior_art" : "generic",
      title: p.title,
      summary: `Antériorité potentielle (${Math.round(relevance * 100)}% pertinence) — correspondance sur « ${matched} ». Revue manuelle recommandée.`,
      score: Math.round(relevance * 10000) / 10000,
      rank: i + 1,
      source_ref: p.ref,
      payload: {
        stub: true,
        query: q,
        search_type: searchType,
        ipc_suggestion: ["B01D", "C02F"],
        reviewer_note: "Résultat généré par le worker stub — non contractuel.",
      },
    };
  });

  const summary = [
    `Analyse ${searchType} terminée pour : « ${q} ».`,
    `${results.length} documents d'antériorité simulés identifiés.`,
    `Score max : ${Math.round((results[0]?.score ?? 0) * 100)}%.`,
    "Connectez un provider LLM/brevets pour des résultats réels.",
  ].join(" ");

  return { summary, results };
}
