import type { AiSearch } from "@/types/database";

/** Libellés UI — français métier, sans jargon technique visible. */

const AI_SEARCH_STATUS: Record<string, string> = {
  pending: "En file",
  processing: "En cours",
  completed: "Terminée",
  failed: "Échouée",
  cancelled: "Annulée",
};

export function formatAiSearchStatusLabel(status: string): string {
  return AI_SEARCH_STATUS[status] ?? status;
}

export function formatAiProviderLabelForUi(): string {
  const hasEpo = !!(
    process.env.EPO_OPS_CONSUMER_KEY?.trim() &&
    process.env.EPO_OPS_CONSUMER_SECRET?.trim()
  );
  const hasLlm = !!(
    process.env.HUGGINGFACE_API_KEY?.trim() || process.env.HF_TOKEN?.trim()
  );

  const parts: string[] = [];
  parts.push(hasEpo ? "Brevets EPO + Maroc (gratuit)" : "Mode démo brevets (configurez EPO OPS)");
  parts.push(
    hasLlm ? "Synthèse IA Hugging Face" : "Synthèse automatique hors-ligne"
  );
  return parts.join(" · ");
}

export function formatAiSearchRowSubtitle(search: Pick<AiSearch, "status" | "created_at">): string {
  return formatAiSearchStatusLabel(search.status);
}
