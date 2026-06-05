export type AiProviderConfig = {
  epo: { consumerKey: string; consumerSecret: string } | null;
  gemini: { apiKey: string; model: string } | null;
};

export function getAiProviderConfig(): AiProviderConfig {
  const consumerKey = process.env.EPO_OPS_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.EPO_OPS_CONSUMER_SECRET?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  return {
    epo:
      consumerKey && consumerSecret
        ? { consumerKey, consumerSecret }
        : null,
    gemini: geminiKey
      ? {
          apiKey: geminiKey,
          model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
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
    synthesis: config.gemini ? "gemini" : "template",
  };
}

export function getAiProviderLabel(): string {
  const config = getAiProviderConfig();
  const parts: string[] = [];

  if (config.epo) {
    parts.push("brevets EPO OPS (gratuit)");
  } else {
    parts.push("brevets simulés (stub)");
  }

  if (config.gemini) {
    parts.push("synthèse Gemini (gratuit)");
  } else {
    parts.push("synthèse automatique");
  }

  return parts.join(" · ");
}
