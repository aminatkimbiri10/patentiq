/**
 * Générateur de dénomination de marque — inspiré du service « Création de nom » de Questel,
 * adapté à un dépôt OMPIC. Propose des noms distinctifs à vérifier ensuite sur search.ompic.ma.
 */
import { getAiProviderConfig } from "@/lib/ai/config";
import { callLLMChat, llmErrorHint } from "@/lib/ai/llm-client";
import type { RichProjectAiContext } from "@/lib/ai/project-chat-context";

export type BrandNameSuggestion = {
  name: string;
  rationale: string;
  style: string;
};

export type BrandNameResult = {
  suggestions: BrandNameSuggestion[];
  source: "huggingface" | "template";
  disclaimer: string;
};

const DISCLAIMER =
  "Suggestions indicatives générées par IA — vérifiez la disponibilité sur OMPIC et auprès d'un CPI avant tout dépôt. La distinctivité et la licéité doivent être validées.";

const MAX_SUGGESTIONS = 8;

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`;
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Variantes déterministes dérivées du titre — utilisées en mode hors-ligne. */
export function templateBrandNames(ctx: RichProjectAiContext): BrandNameSuggestion[] {
  const base = (ctx.title || "Marque")
    .replace(/[^a-zA-Zà-ÿ0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 2)
    .map(capitalize);

  const root = base[0] ?? "Nova";
  const second = base[1] ?? "";
  const stem = root.slice(0, Math.max(3, Math.min(5, root.length)));

  const candidates: BrandNameSuggestion[] = [
    { name: `${root}${second}`, rationale: "Combinaison directe des mots-clés du projet.", style: "Descriptif" },
    { name: `${stem}ia`, rationale: "Suffixe court et moderne.", style: "Inventé" },
    { name: `${stem}o`, rationale: "Sonorité ouverte, facile à mémoriser.", style: "Inventé" },
    { name: `${root}Lab`, rationale: "Évoque l'innovation et la R&D.", style: "Évocateur" },
    { name: `${root}Pro`, rationale: "Positionnement professionnel.", style: "Évocateur" },
    { name: `${stem}ify`, rationale: "Style tech contemporain.", style: "Inventé" },
    { name: `Atlas${stem}`, rationale: "Ancrage marocain (référence locale).", style: "Évocateur" },
    { name: `${stem}ka`, rationale: "Terminaison distinctive et brève.", style: "Inventé" },
  ];

  const seen = new Set<string>();
  return candidates
    .filter((c) => {
      const key = c.name.toLowerCase();
      if (!c.name || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_SUGGESTIONS);
}

function parseSuggestions(raw: string): BrandNameSuggestion[] {
  let data: unknown;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    data = JSON.parse(match[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const seen = new Set<string>();
  const out: BrandNameSuggestion[] = [];
  for (const entry of data) {
    const obj = (entry ?? {}) as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({
      name: clip(name, 40),
      rationale: typeof obj.rationale === "string" ? clip(obj.rationale, 180) : "",
      style: typeof obj.style === "string" ? clip(obj.style, 40) : "—",
    });
    if (out.length >= MAX_SUGGESTIONS) break;
  }
  return out;
}

export async function generateBrandNames(
  ctx: RichProjectAiContext
): Promise<BrandNameResult> {
  const config = getAiProviderConfig();
  const fallback = templateBrandNames(ctx);

  if (!config.llm) {
    return { suggestions: fallback, source: "template", disclaimer: DISCLAIMER };
  }

  const system = [
    "Tu es spécialiste en création de noms de marque (naming) pour un dépôt OMPIC au Maroc.",
    "Propose des dénominations distinctives, mémorisables et licites (ni descriptives, ni trompeuses).",
    "Réponds UNIQUEMENT par un tableau JSON (sans markdown) :",
    '[{"name":"...","rationale":"raison courte","style":"Inventé|Évocateur|Descriptif"}]',
    `Donne ${MAX_SUGGESTIONS} propositions variées.`,
  ].join(" ");

  const user = [
    "Contexte du projet :",
    ctx.contextBlock,
    "",
    "Génère le tableau JSON des dénominations.",
  ].join("\n");

  try {
    const raw = await callLLMChat(
      config.llm.apiKey,
      config.llm.model,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { maxTokens: 900, temperature: 0.8 }
    );
    const suggestions = parseSuggestions(raw);
    return suggestions.length
      ? { suggestions, source: "huggingface", disclaimer: DISCLAIMER }
      : { suggestions: fallback, source: "template", disclaimer: DISCLAIMER };
  } catch (e) {
    return {
      suggestions: fallback,
      source: "template",
      disclaimer: `${DISCLAIMER} (mode hors-ligne — ${llmErrorHint(e)})`,
    };
  }
}
