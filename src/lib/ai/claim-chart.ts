/**
 * Cartographie des revendications (claim chart) — inspiré de la « Cartographie de brevet par IA »
 * de Questel, adaptée au pré-dépôt OMPIC. Croise les éléments de revendication avec les
 * antériorités trouvées pour visualiser le risque de chevauchement.
 */
import { getAiProviderConfig } from "@/lib/ai/config";
import { callLLMChat, llmErrorHint } from "@/lib/ai/llm-client";

export type ClaimChartAssessment = "disclosed" | "partial" | "not_disclosed" | "unknown";

export type ClaimChartCell = {
  ref: string;
  assessment: ClaimChartAssessment;
  note?: string;
};

export type ClaimChartRow = {
  element: string;
  cells: ClaimChartCell[];
};

export type ClaimChartPriorArt = {
  ref: string;
  title: string;
  summary?: string;
};

export type ClaimChart = {
  priorArt: Array<{ ref: string; title: string }>;
  rows: ClaimChartRow[];
  source: "huggingface" | "template";
  summary: string;
  disclaimer: string;
};

const DISCLAIMER =
  "Cartographie indicative générée automatiquement — l'évaluation de la nouveauté et de l'activité inventive relève d'un CPI.";

const MAX_ELEMENTS = 8;
const MAX_PRIOR_ART = 5;

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`;
}

/** Découpe une revendication indépendante + dépendantes en éléments analysables. */
export function splitClaimElements(
  independentClaim: string | null | undefined,
  dependentClaims: string[] = []
): string[] {
  const elements: string[] = [];
  const independent = (independentClaim ?? "").trim();

  if (independent) {
    // Retire un éventuel préambule « 1. … comprenant : » avant le découpage.
    const body = independent.replace(/^\s*\d+\.?\s*/, "");
    const afterPreamble = body.split(/comprenant|caractéris[ée] en ce que|consistant à/i).pop() ?? body;
    const parts = afterPreamble
      .split(/;|\n|•|·|(?:,\s*et\s+)/)
      .map((p) => p.trim().replace(/[.;,]+$/, ""))
      .filter((p) => p.length >= 4);

    if (parts.length > 1) {
      elements.push(...parts);
    } else {
      elements.push(clip(body, 200));
    }
  }

  for (const dep of dependentClaims) {
    const d = dep.trim().replace(/^\s*\d+\.?\s*/, "");
    if (d.length >= 4) elements.push(clip(d, 200));
  }

  return elements.slice(0, MAX_ELEMENTS);
}

function templateChart(
  elements: string[],
  priorArt: ClaimChartPriorArt[]
): ClaimChartRow[] {
  return elements.map((element) => ({
    element,
    cells: priorArt.map((pa) => ({ ref: pa.ref, assessment: "unknown" as const })),
  }));
}

function normalizeAssessment(value: unknown): ClaimChartAssessment {
  const v = String(value ?? "").toLowerCase();
  if (v.includes("disclos") || v === "oui" || v.includes("divulg")) {
    return v.includes("part") ? "partial" : "disclosed";
  }
  if (v.includes("part")) return "partial";
  if (v.includes("not") || v === "non" || v.includes("absent")) return "not_disclosed";
  return "unknown";
}

function parseChartRows(
  raw: string,
  elements: string[],
  priorArt: ClaimChartPriorArt[]
): ClaimChartRow[] | null {
  let data: unknown;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return null;
    data = JSON.parse(match[0]);
  } catch {
    return null;
  }
  if (!Array.isArray(data)) return null;

  const refs = priorArt.map((p) => p.ref);

  const rows: ClaimChartRow[] = data.slice(0, elements.length).map((entry, i) => {
    const obj = (entry ?? {}) as Record<string, unknown>;
    const element = typeof obj.element === "string" && obj.element.trim() ? obj.element.trim() : elements[i];
    const rawCells = Array.isArray(obj.cells) ? obj.cells : [];
    const cells: ClaimChartCell[] = refs.map((ref, j) => {
      const cell = (rawCells[j] ?? {}) as Record<string, unknown>;
      const cellRef = typeof cell.ref === "string" && cell.ref.trim() ? cell.ref.trim() : ref;
      return {
        ref: cellRef,
        assessment: normalizeAssessment(cell.assessment),
        note: typeof cell.note === "string" ? clip(cell.note, 160) : undefined,
      };
    });
    return { element, cells };
  });

  return rows.length ? rows : null;
}

export async function generateClaimChart(
  independentClaim: string | null,
  dependentClaims: string[],
  priorArtInput: ClaimChartPriorArt[]
): Promise<ClaimChart> {
  const elements = splitClaimElements(independentClaim, dependentClaims);
  const priorArt = priorArtInput.slice(0, MAX_PRIOR_ART);
  const priorArtMeta = priorArt.map((p) => ({ ref: p.ref, title: p.title }));

  if (elements.length === 0) {
    return {
      priorArt: priorArtMeta,
      rows: [],
      source: "template",
      summary: "Renseignez au moins une revendication indépendante pour générer la cartographie.",
      disclaimer: DISCLAIMER,
    };
  }

  const config = getAiProviderConfig();
  if (!config.llm || priorArt.length === 0) {
    return {
      priorArt: priorArtMeta,
      rows: templateChart(elements, priorArt),
      source: "template",
      summary:
        priorArt.length === 0
          ? "Aucune antériorité disponible — lancez une analyse Nouveauté ou FTO d'abord."
          : "Cartographie en mode hors-ligne : évaluez manuellement chaque croisement.",
      disclaimer: DISCLAIMER,
    };
  }

  const system = [
    "Tu es examinateur brevet. Pour chaque élément de revendication, évalue s'il est divulgué",
    "par chaque antériorité. Réponds UNIQUEMENT par un tableau JSON (sans markdown) :",
    '[{"element":"...","cells":[{"ref":"...","assessment":"disclosed|partial|not_disclosed","note":"courte justification"}]}]',
    "assessment ∈ {disclosed, partial, not_disclosed}. Reste prudent et factuel.",
  ].join(" ");

  const user = [
    "Éléments de revendication :",
    elements.map((e, i) => `E${i + 1}. ${e}`).join("\n"),
    "",
    "Antériorités :",
    priorArt.map((p) => `[${p.ref}] ${p.title}${p.summary ? ` — ${clip(p.summary, 200)}` : ""}`).join("\n"),
    "",
    "Génère le tableau JSON (un objet par élément, dans l'ordre).",
  ].join("\n");

  try {
    const raw = await callLLMChat(
      config.llm.apiKey,
      config.llm.model,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { maxTokens: 1500, temperature: 0.2 }
    );
    const rows = parseChartRows(raw, elements, priorArt) ?? templateChart(elements, priorArt);
    const disclosedCount = rows
      .flatMap((r) => r.cells)
      .filter((c) => c.assessment === "disclosed").length;
    return {
      priorArt: priorArtMeta,
      rows,
      source: "huggingface",
      summary: `${elements.length} élément(s) croisé(s) avec ${priorArt.length} antériorité(s). ${disclosedCount} chevauchement(s) potentiel(s) signalé(s) — à valider par un CPI.`,
      disclaimer: DISCLAIMER,
    };
  } catch (e) {
    return {
      priorArt: priorArtMeta,
      rows: templateChart(elements, priorArt),
      source: "template",
      summary: `Cartographie en mode hors-ligne (${llmErrorHint(e)}).`,
      disclaimer: DISCLAIMER,
    };
  }
}
