import { getAiProviderConfig } from "@/lib/ai/config";
import { callLLMChat, llmErrorHint } from "@/lib/ai/llm-client";
import type { RichProjectAiContext } from "@/lib/ai/project-chat-context";

export type OmpicResponseDraft = {
  objet: string;
  resume_irregularite: string;
  actions: string[];
  pieces: string[];
  courrier: string;
  delai: string | null;
};

export type OmpicResponseResult = {
  draft: OmpicResponseDraft;
  source: "huggingface" | "template";
  disclaimer: string;
};

const DISCLAIMER =
  "Trame indicative générée par IA — à relire, compléter et valider par un CPI avant tout envoi à l'OMPIC. Ne constitue pas un avis juridique.";

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0)
    .slice(0, 8);
}

export function templateOmpicResponse(
  ctx: RichProjectAiContext,
  notification: string
): OmpicResponseDraft {
  const ref = ctx.referenceCode ? ` (réf. ${ctx.referenceCode})` : "";
  return {
    objet: `Réponse à la notification d'irrégularité — dossier « ${ctx.title} »${ref}`,
    resume_irregularite: clip(notification, 600),
    actions: [
      "Identifier précisément chaque irrégularité soulevée par l'examinateur.",
      "Rassembler les pièces ou corrections demandées (formulaires, traductions, justificatifs).",
      "Préparer une réponse point par point reprenant les références de la notification.",
      "Faire valider la réponse par le CPI avant dépôt sur directompic.ma.",
    ],
    pieces: [
      "Copie de la notification d'irrégularité OMPIC",
      "Pièces corrigées ou manquantes",
      "Pouvoir / mandat si représentant",
    ],
    courrier: [
      "Madame, Monsieur,",
      "",
      `En réponse à votre notification concernant le dossier « ${ctx.title} »${ref}, nous vous prions de bien vouloir trouver ci-après les éléments de régularisation demandés.`,
      "",
      "[Reprendre chaque point de l'irrégularité et y répondre précisément.]",
      "",
      "Nous restons à votre disposition pour tout complément et vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.",
    ].join("\n"),
    delai: "Respecter le délai indiqué sur la notification (souvent court — vérifier la date butoir).",
  };
}

function parseDraft(raw: string, fallback: OmpicResponseDraft): OmpicResponseDraft {
  let data: Record<string, unknown> | null = null;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    data = match ? (JSON.parse(match[0]) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }
  if (!data) return fallback;

  const objet = typeof data.objet === "string" ? data.objet.trim() : "";
  const resume =
    typeof data.resume_irregularite === "string" ? data.resume_irregularite.trim() : "";
  const courrier = typeof data.courrier === "string" ? data.courrier.trim() : "";
  const actions = asStringArray(data.actions);
  const pieces = asStringArray(data.pieces);
  const delai = typeof data.delai === "string" ? data.delai.trim() : null;

  if (!objet && !courrier) return fallback;

  return {
    objet: objet || fallback.objet,
    resume_irregularite: resume || fallback.resume_irregularite,
    actions: actions.length ? actions : fallback.actions,
    pieces: pieces.length ? pieces : fallback.pieces,
    courrier: courrier || fallback.courrier,
    delai: delai || fallback.delai,
  };
}

export async function generateOmpicResponse(
  ctx: RichProjectAiContext,
  notification: string
): Promise<OmpicResponseResult> {
  const config = getAiProviderConfig();
  const fallback = templateOmpicResponse(ctx, notification);

  if (!config.llm) {
    return { draft: fallback, source: "template", disclaimer: DISCLAIMER };
  }

  const system = [
    "Tu es assistant de procédure pour conseillers en propriété industrielle au Maroc (OMPIC).",
    "Un client a reçu une notification d'irrégularité (marque, brevet ou dessin & modèle).",
    "Produis UNIQUEMENT un objet JSON valide (sans markdown) avec ces clés en français :",
    "objet (string), resume_irregularite (string), actions (array de strings),",
    "pieces (array de strings), courrier (string : lettre de réponse formelle), delai (string).",
    "Style : formel, courtois, précis. N'invente aucune référence légale ni article de loi.",
    "Reste prudent : rappelle que la validation d'un CPI est nécessaire.",
  ].join(" ");

  const user = [
    "Contexte du dossier :",
    ctx.contextBlock,
    "",
    "Notification d'irrégularité reçue de l'OMPIC :",
    clip(notification, 2500),
    "",
    "Génère la trame de réponse structurée (JSON).",
  ].join("\n");

  try {
    const raw = await callLLMChat(
      config.llm.apiKey,
      config.llm.model,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { maxTokens: 1200, temperature: 0.3 }
    );
    return {
      draft: parseDraft(raw, fallback),
      source: "huggingface",
      disclaimer: DISCLAIMER,
    };
  } catch (e) {
    return {
      draft: fallback,
      source: "template",
      disclaimer: `${DISCLAIMER} (mode hors-ligne — ${llmErrorHint(e)})`,
    };
  }
}
