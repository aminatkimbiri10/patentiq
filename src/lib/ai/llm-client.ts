import { HF_CHAT_MODELS } from "@/lib/ai/config";

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

export type LlmCallOptions = {
  maxTokens?: number;
  temperature?: number;
};

export type LlmChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function isModelConfigError(status: number, body: string): boolean {
  if (status !== 400) return false;
  return /not a chat model|not supported by any provider/i.test(body);
}

function modelsToTry(preferred: string): string[] {
  const ordered = [preferred, ...HF_CHAT_MODELS.filter((m) => m !== preferred)];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const m of ordered) {
    if (seen.has(m)) continue;
    seen.add(m);
    unique.push(m);
  }
  return unique;
}

function isRetryableModelError(message: string): boolean {
  return (
    /\(400\):/.test(message) &&
    /not a chat model|not supported by any provider/i.test(message)
  );
}

export async function callLLM(
  apiKey: string,
  model: string,
  prompt: string,
  options?: LlmCallOptions
): Promise<string> {
  return callLLMChat(apiKey, model, [{ role: "user", content: prompt }], options);
}

export async function callLLMChat(
  apiKey: string,
  model: string,
  messages: LlmChatMessage[],
  options?: LlmCallOptions
): Promise<string> {
  const candidates = modelsToTry(model);
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      return await callLLMWithMessages(apiKey, candidate, messages, options);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (!isRetryableModelError(lastError.message) || candidate === candidates[candidates.length - 1]) {
        throw lastError;
      }
      console.warn(`[ai] HF model ${candidate} unavailable, trying fallback…`);
    }
  }

  throw lastError ?? new Error("Hugging Face: échec après plusieurs tentatives");
}

async function callLLMWithMessages(
  apiKey: string,
  model: string,
  messages: LlmChatMessage[],
  options?: LlmCallOptions
): Promise<string> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens ?? 600,
        temperature: options?.temperature ?? 0.3,
      }),
    });

    if (res.status === 503 && attempt < maxAttempts) {
      await sleep(8000);
      continue;
    }

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      lastError = new Error(`Hugging Face (${res.status}): ${err.slice(0, 240)}`);
      if (isModelConfigError(res.status, err)) {
        throw lastError;
      }
      if ((res.status === 429 || res.status === 503) && attempt < maxAttempts) {
        await sleep(res.status === 429 ? 5000 : 8000);
        continue;
      }
      throw lastError;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: string;
    };

    if (data.error) {
      throw new Error(`Hugging Face: ${data.error.slice(0, 200)}`);
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Hugging Face: réponse vide");
    return text;
  }

  throw lastError ?? new Error("Hugging Face: échec après plusieurs tentatives");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isLlmQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("429") || /quota|rate limit/i.test(msg);
}

/** Synthèse template + message utilisateur après échec HF. */
export function applyLlmSynthesisFallback(
  templateSummary: string,
  error: unknown,
  providers: { synthesis: string }
): string {
  providers.synthesis = isLlmQuotaError(error) ? "quota-fallback" : "template-fallback";
  return `${templateSummary}\n\nNote : ${llmErrorHint(error)}`;
}

export function llmErrorHint(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (isLlmQuotaError(error)) {
    return "Quota Hugging Face dépassé — réessayez plus tard ou vérifiez votre token sur huggingface.co/settings/tokens.";
  }

  if (/not a chat model/i.test(msg)) {
    return `Modèle incompatible avec l'API chat. Définissez HUGGINGFACE_MODEL=${HF_CHAT_MODELS[0]} dans .env.local.`;
  }

  if (/not supported by any provider/i.test(msg)) {
    return "Aucun fournisseur HF activé pour ce modèle — activez Inference Providers sur huggingface.co/settings/inference-providers ou changez HUGGINGFACE_MODEL.";
  }

  return error instanceof Error ? error.message.slice(0, 160) : "Erreur Hugging Face";
}
