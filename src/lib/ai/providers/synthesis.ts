import { callLLM } from "@/lib/ai/llm-client";
import type { AiSearchResultItem } from "@/lib/ai/types";

export async function synthesizeNoveltyReport(
  apiKey: string,
  model: string,
  query: string,
  results: AiSearchResultItem[]
): Promise<string> {
  const hitsText = results
    .slice(0, 6)
    .map(
      (r, i) =>
        `${i + 1}. ${r.source_ref} — ${r.title} (score ${Math.round((r.score ?? 0) * 100)}%)\n   ${r.summary.slice(0, 200)}`
    )
    .join("\n");

  const prompt = `Tu es un assistant en propriété intellectuelle. Rédige une synthèse courte en français (max 120 mots) pour une recherche de nouveauté.

Requête du porteur de projet : « ${query} »

Antériorités trouvées (données EPO OPS) :
${hitsText || "Aucun document trouvé."}

Structure attendue :
- 1 phrase sur le périmètre analysé
- 1 phrase sur le niveau de risque d'antériorité (faible / modéré / élevé) avec prudence
- 1 phrase de recommandation (revue CPI, affinage des classes IPC, etc.)

Ne invente pas de numéros de brevets. Reste factuel et prudent juridiquement.`;

  return callLLM(apiKey, model, prompt, { maxTokens: 400, temperature: 0.3 });
}

export async function synthesizeFtoReport(
  apiKey: string,
  model: string,
  query: string,
  results: AiSearchResultItem[]
): Promise<string> {
  const hitsText = results
    .slice(0, 6)
    .map(
      (r, i) =>
        `${i + 1}. ${r.source_ref} — ${r.title} (score ${Math.round((r.score ?? 0) * 100)}%)\n   ${r.summary.slice(0, 200)}`
    )
    .join("\n");

  const prompt = `Tu es un assistant en propriété intellectuelle. Rédige une synthèse FTO (Freedom to Operate / liberté d'exploitation) courte en français (max 130 mots).

Technologie ou produit analysé : « ${query} »

Brevets et actifs PI identifiés (EPO + OMPIC Maroc) :
${hitsText || "Aucun document bloquant identifié dans les bases consultées."}

Structure attendue :
- 1 phrase sur le périmètre FTO (Maroc + international si pertinent)
- 1 phrase sur le risque d'exploitation (faible / modéré / élevé) — prudence juridique
- 1 phrase de recommandation (revue CPI, claims mapping, territoires)

Ne invente pas de numéros. Rappelle que l'analyse automatisée ne remplace pas un avis juridique.`;

  return callLLM(apiKey, model, prompt, { maxTokens: 450, temperature: 0.3 });
}

export function templateFtoSummary(
  query: string,
  results: AiSearchResultItem[],
  patentProvider: string
): string {
  if (!results.length) {
    return `Analyse FTO pour « ${query} » (${patentProvider}) : aucun brevet ou actif PI bloquant détecté dans les bases consultées. Une revue CPI reste recommandée avant commercialisation.`;
  }

  const top = results[0];
  const avgScore =
    results.reduce((s, r) => s + (r.score ?? 0), 0) / Math.max(results.length, 1);
  const risk =
    avgScore >= 0.7 ? "modéré à élevé" : avgScore >= 0.45 ? "modéré" : "relativement faible";

  const ompicCount = results.filter(
    (r) => r.payload?.ompic || String(r.payload?.provider ?? "").includes("ompic")
  ).length;

  return [
    `Analyse FTO (liberté d'exploitation) pour « ${query} » — sources : ${patentProvider}.`,
    `${results.length} document(s) potentiellement bloquant(s)${ompicCount > 0 ? ` (${ompicCount} OMPIC Maroc)` : ""}.`,
    `Référence la plus proche : ${top.source_ref} — ${top.title} (${Math.round((top.score ?? 0) * 100)}%).`,
    `Risque d'exploitation estimé : ${risk} (heuristique, non contractuel).`,
    "Recommandation : mapping des revendications et avis CPI avant mise sur le marché.",
  ].join(" ");
}

export function templateNoveltySummary(
  query: string,
  results: AiSearchResultItem[],
  patentProvider: string
): string {
  if (!results.length) {
    return `Recherche « ${query} » via ${patentProvider} : aucun document d'antériorité trouvé. Affinez les mots-clés ou consultez un conseiller PI.`;
  }

  const top = results[0];
  const avgScore =
    results.reduce((s, r) => s + (r.score ?? 0), 0) / Math.max(results.length, 1);

  const risk =
    avgScore >= 0.75 ? "modéré à élevé" : avgScore >= 0.5 ? "modéré" : "relativement faible";

  return [
    `Analyse de nouveauté pour « ${query} » (${patentProvider}).`,
    `${results.length} document(s) d'antériorité identifié(s).`,
    `Référence la plus proche : ${top.source_ref} — ${top.title} (${Math.round((top.score ?? 0) * 100)}%).`,
    `Niveau de proximité global : ${risk} (heuristique, non contractuel).`,
    "Recommandation : revue manuelle par un conseiller PI avant dépôt.",
  ].join(" ");
}
