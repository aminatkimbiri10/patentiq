import { getAiProviderConfig } from "@/lib/ai/config";
import {
  callLLMChat,
  isLlmQuotaError,
  llmErrorHint,
  type LlmChatMessage,
} from "@/lib/ai/llm-client";
import { fetchRichProjectContext, type RichProjectAiContext } from "@/lib/ai/project-chat-context";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 14;

function buildSystemPrompt(ctx: RichProjectAiContext): string {
  return `Tu es un assistant PI pour porteurs de projet en France. Réponds en français, de façon claire et structurée (tu peux utiliser **gras** et des listes numérotées).
Règles : conseils généraux uniquement, pas d'avis juridique contraignant, mentionne quand une revue CPI est nécessaire.
Tu peux t'appuyer sur l'historique de la conversation et le contexte dossier ci-dessous (documents, analyses IA, checklist, tâches, avis expert).

Contexte dossier :
${ctx.contextBlock}`;
}

function buildChatFallback(
  userMessage: string,
  ctx: RichProjectAiContext,
  reason: string
): string {
  const lines = [
    `⚠️ ${reason}`,
    "",
    "Réponse indicative (mode hors-ligne) :",
  ];

  if (ctx.inventionSummary) {
    lines.push(
      `• Votre dossier décrit : ${ctx.inventionSummary.slice(0, 200)}${ctx.inventionSummary.length > 200 ? "…" : ""}`
    );
  }

  lines.push(
    "",
    `Concernant « ${userMessage.slice(0, 120)}${userMessage.length > 120 ? "…" : ""} » : documentez l'invention, lancez une recherche d'antériorité (onglet Nouveauté), puis faites valider par un CPI avant dépôt.`,
    "Ceci ne remplace pas un conseil juridique personnalisé."
  );

  return lines.join("\n");
}

export async function generateAssistantChatReply(
  admin: import("@supabase/supabase-js").SupabaseClient,
  projectId: string,
  history: ChatTurn[],
  userMessage: string
): Promise<{ content: string; synthesis: string; stub?: boolean; llm_error?: boolean }> {
  const trimmed = userMessage.trim();
  const config = getAiProviderConfig();
  const ctx = await fetchRichProjectContext(admin, projectId, trimmed);

  if (!trimmed) {
    return {
      content: "Saisissez un message pour démarrer la conversation.",
      synthesis: "template",
    };
  }

  if (!config.llm) {
    return {
      content: buildChatFallback(
        trimmed,
        ctx,
        "HUGGINGFACE_API_KEY non configurée — mode hors-ligne."
      ),
      synthesis: "template",
      stub: true,
    };
  }

  const messages: LlmChatMessage[] = [
    { role: "system", content: buildSystemPrompt(ctx) },
    ...history.slice(-MAX_HISTORY).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: trimmed },
  ];

  try {
    const content = await callLLMChat(
      config.llm.apiKey,
      config.llm.model,
      messages,
      { maxTokens: 700, temperature: 0.4 }
    );
    return { content, synthesis: "huggingface" };
  } catch (e) {
    console.error("[ai] assistant chat failed:", e);
    return {
      content: buildChatFallback(trimmed, ctx, llmErrorHint(e)),
      synthesis: isLlmQuotaError(e) ? "quota-fallback" : "error-fallback",
      stub: true,
      llm_error: true,
    };
  }
}
