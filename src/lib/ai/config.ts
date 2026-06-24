import { formatAiProviderLabelForUi } from "@/lib/messages/ui-labels";

export type AiProviderConfig = {
  epo: { consumerKey: string; consumerSecret: string } | null;
  llm: { apiKey: string; model: string } | null;
};

/** Modèles compatibles router HF /v1/chat/completions (voir docs/AI_PROVIDERS.md) */
export const HF_CHAT_MODELS = [
  "Qwen/Qwen2.5-7B-Instruct",
  "google/gemma-2-2b-it",
] as const;

const DEFAULT_HF_MODEL = HF_CHAT_MODELS[0];

export function getAiProviderConfig(): AiProviderConfig {
  const consumerKey = process.env.EPO_OPS_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.EPO_OPS_CONSUMER_SECRET?.trim();
  const hfKey =
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    process.env.HF_TOKEN?.trim();

  return {
    epo:
      consumerKey && consumerSecret
        ? { consumerKey, consumerSecret }
        : null,
    llm: hfKey
      ? {
          apiKey: hfKey,
          model:
            process.env.HUGGINGFACE_MODEL?.trim() ||
            process.env.HF_MODEL?.trim() ||
            DEFAULT_HF_MODEL,
        }
      : null,
  };
}

export function describeActiveProviders(config: AiProviderConfig): {
  patent: string;
  synthesis: string;
} {
  return {
    patent: config.epo ? "epo-ops" : "stub",
    synthesis: config.llm ? "huggingface" : "template",
  };
}

export function getAiProviderLabel(): string {
  return formatAiProviderLabelForUi();
}
