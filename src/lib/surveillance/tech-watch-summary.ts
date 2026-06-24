import { getAiProviderConfig } from "@/lib/ai/config";
import { callLLM, isLlmQuotaError } from "@/lib/ai/llm-client";

type TechWatchHit = { title: string; ref: string; summary?: string };

/** Résumé hebdo veille — LLM si HF configuré, sinon template. */
export async function buildTechWatchReportSummary(
  watchTitle: string,
  keywords: string,
  hits: TechWatchHit[],
  assetLabel: string
): Promise<{ summary: string; provider: "huggingface" | "template" }> {
  const titles = hits.map((h) => h.title).filter(Boolean);

  if (!titles.length) {
    return {
      summary: `Veille « ${watchTitle} » : aucun ${assetLabel} proche pour « ${keywords} ».`,
      provider: "template",
    };
  }

  const config = getAiProviderConfig();
  if (!config.llm) {
    return {
      summary: `Veille « ${watchTitle} » : ${hits.length} ${assetLabel} — ex. ${titles.slice(0, 2).join(" ; ")}`,
      provider: "template",
    };
  }

  const bulletList = hits
    .slice(0, 6)
    .map((h) => `- ${h.title} (${h.ref})${h.summary ? ` : ${h.summary}` : ""}`)
    .join("\n");

  try {
    const text = await callLLM(
      config.llm.apiKey,
      config.llm.model,
      `Rédige un résumé hebdomadaire de veille PI en 2-3 phrases en français, ton professionnel CPI.
Veille : ${watchTitle}
Mots-clés : ${keywords}
Résultats :
${bulletList}
Mentionne le nombre de documents et l'action suggérée (analyser / surveiller / aucune urgence).`,
      { maxTokens: 220, temperature: 0.3 }
    );
    const trimmed = text.trim();
    if (trimmed.length > 40) {
      return { summary: trimmed, provider: "huggingface" };
    }
  } catch (e) {
    if (!isLlmQuotaError(e)) {
      /* fall through to template */
    }
  }

  return {
    summary: `Veille « ${watchTitle} » : ${hits.length} ${assetLabel} — ex. ${titles.slice(0, 2).join(" ; ")}`,
    provider: "template",
  };
}
