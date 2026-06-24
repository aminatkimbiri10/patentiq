import { getAiProviderConfig } from "@/lib/ai/config";
import { callLLMChat, llmErrorHint } from "@/lib/ai/llm-client";
import type { RichProjectAiContext } from "@/lib/ai/project-chat-context";

export type PatentDraftSections = {
  title: string;
  technical_field: string;
  background: string;
  description: string;
  abstract: string;
};

export type PatentDraftGenerateResult = {
  sections: PatentDraftSections;
  source: "huggingface" | "template";
  disclaimer: string;
};

const DISCLAIMER =
  "Brouillon généré par IA — à valider et adapter par un CPI avant tout dépôt OMPIC. Ne constitue pas un avis juridique.";

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function templatePatentDraft(
  ctx: RichProjectAiContext,
  claimsHint?: string | null
): PatentDraftSections {
  const inv = ctx.inventionSummary?.trim() || ctx.title;
  const need = ctx.needDescription?.trim();
  const domain = ctx.categoryName ?? "propriété industrielle";

  return {
    title: clip(`Dispositif et procédé : ${ctx.title}`, 200),
    technical_field: `La présente invention concerne le domaine de ${domain}. Elle porte notamment sur ${clip(inv, 300)}.`,
    background: [
      "L'état de la technique connu présente des limites en termes d'efficacité, de coût ou de simplicité d'usage.",
      need ? `Besoin identifié : ${need}` : null,
      claimsHint
        ? "Les revendications en cours de rédaction visent à couvrir les aspects techniques distinctifs du dossier."
        : null,
    ]
      .filter(Boolean)
      .join("\n\n"),
    description: [
      inv,
      "",
      "Modes de réalisation : l'invention peut être mise en œuvre selon différentes variantes compatibles avec l'enseignement ci-dessus.",
      "Effets techniques : amélioration par rapport aux solutions connues (à préciser avec le CPI).",
    ].join("\n\n"),
    abstract: clip(
      `${ctx.title}. ${inv}${need ? ` Application : ${need}` : ""}`,
      450
    ),
  };
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence?.[1]) return JSON.parse(fence[1].trim());
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("JSON invalide dans la réponse IA");
  }
}

function parseDraftSections(data: unknown): PatentDraftSections {
  if (!data || typeof data !== "object") {
    throw new Error("Structure JSON invalide");
  }
  const o = data as Record<string, unknown>;
  const pick = (key: keyof PatentDraftSections) => {
    const v = o[key];
    return typeof v === "string" ? v.trim() : "";
  };
  const sections: PatentDraftSections = {
    title: pick("title"),
    technical_field: pick("technical_field"),
    background: pick("background"),
    description: pick("description"),
    abstract: pick("abstract"),
  };
  if (!sections.title && !sections.description) {
    throw new Error("Réponse IA incomplète");
  }
  return sections;
}

export async function generatePatentDraftSections(
  ctx: RichProjectAiContext,
  options?: { independentClaim?: string | null }
): Promise<PatentDraftGenerateResult> {
  const config = getAiProviderConfig();
  const claimsHint = options?.independentClaim?.trim() || null;

  if (!config.llm) {
    return {
      sections: templatePatentDraft(ctx, claimsHint),
      source: "template",
      disclaimer: DISCLAIMER,
    };
  }

  const system = [
    "Tu es assistant rédaction brevet pour conseillers en PI au Maroc (OMPIC).",
    "Produis UNIQUEMENT un objet JSON valide (sans markdown) avec exactement ces clés en français :",
    "title, technical_field, background, description, abstract.",
    "Style : formel, technique, brouillon de demande de brevet.",
    "Ne invente pas de références légales. Reste factuel à partir du contexte.",
  ].join(" ");

  const user = [
    "Contexte dossier :",
    ctx.contextBlock,
    claimsHint ? `\nRevendication indépendante (brouillon) :\n${clip(claimsHint, 800)}` : "",
    "\nGénère les 5 sections du brouillon OMPIC.",
  ].join("\n");

  try {
    const raw = await callLLMChat(
      config.llm.apiKey,
      config.llm.model,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { maxTokens: 1400, temperature: 0.35 }
    );

    const sections = parseDraftSections(extractJsonObject(raw));
    return { sections, source: "huggingface", disclaimer: DISCLAIMER };
  } catch (e) {
    console.warn("[ai] patent draft HF failed:", llmErrorHint(e));
    return {
      sections: templatePatentDraft(ctx, claimsHint),
      source: "template",
      disclaimer: `${DISCLAIMER} (mode hors-ligne — ${llmErrorHint(e)})`,
    };
  }
}
