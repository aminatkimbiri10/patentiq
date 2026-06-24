import { getAiProviderConfig } from "@/lib/ai/config";
import { callLLM, llmErrorHint, isLlmQuotaError } from "@/lib/ai/llm-client";
import { extractDocumentText } from "@/lib/ai/extract-document-text";
import { generateStubResults } from "@/lib/ai/stub-engine";
import { templateNoveltySummary } from "@/lib/ai/providers/synthesis";
import type { AiRunSearchResult, AiSearchResultItem } from "@/lib/ai/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProjectAiContext = {
  title: string;
  inventionSummary: string | null;
  needDescription: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

function buildProjectContextBlock(ctx: ProjectAiContext): string {
  return [
    `Projet : ${ctx.title}`,
    ctx.categoryName ? `Catégorie : ${ctx.categoryName}` : null,
    ctx.inventionSummary ? `Invention : ${ctx.inventionSummary}` : null,
    ctx.needDescription ? `Besoin PI : ${ctx.needDescription}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseJsonArray(text: string): unknown[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function runSummarization(
  admin: SupabaseClient,
  projectId: string,
  query: string | null,
  documentIds: string[]
): Promise<AiRunSearchResult> {
  const config = getAiProviderConfig();

  const { data: project } = await admin
    .from("projects")
    .select("title, invention_summary, need_description, categories(name, slug)")
    .eq("id", projectId)
    .single();

  const category = project?.categories as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
  const categoryRow = Array.isArray(category) ? category[0] : category;

  const ctx: ProjectAiContext = {
    title: project?.title ?? "Projet",
    inventionSummary: project?.invention_summary,
    needDescription: project?.need_description,
    categoryName: categoryRow?.name ?? null,
    categorySlug: categoryRow?.slug ?? null,
  };

  let sourceLabel = "dossier projet";
  let content = buildProjectContextBlock(ctx);

  if (documentIds.length > 0) {
    const extracted = await extractDocumentText(admin, documentIds[0]);
    if (extracted) {
      sourceLabel = extracted.title;
      content = `${extracted.text}\n\n---\nContexte projet :\n${buildProjectContextBlock(ctx)}`;
    }
  }

  const instruction = query?.trim() || "Synthèse structurée pour un conseiller PI";

  if (!config.llm) {
    const summary = [
      `Résumé (${sourceLabel}) — mode hors-ligne.`,
      content.slice(0, 400) + (content.length > 400 ? "…" : ""),
      "Configurez HUGGINGFACE_API_KEY pour une synthèse IA complète.",
    ].join("\n\n");
    return {
      summary,
      results: [
        {
          result_type: "summary",
          title: "Synthèse",
          summary: summary.slice(0, 500),
          score: 1,
          rank: 1,
          source_ref: sourceLabel,
          payload: { stub: true },
        },
      ],
      providers: { patent: "n/a", synthesis: "template" },
    };
  }

  const summary = await callLLM(
    config.llm.apiKey,
    config.llm.model,
    `Tu es assistant PI. Rédige un résumé en français (max 200 mots) du contenu ci-dessous.
Instruction : ${instruction}

Structure : objet · solution technique · points clés · recommandation CPI.
Reste prudent juridiquement.

Contenu :
${content.slice(0, MAX_SUMMARY_INPUT)}`,
    { maxTokens: 500 }
  );

  return {
    summary,
    results: [
      {
        result_type: "summary",
        title: `Résumé — ${sourceLabel}`,
        summary,
        score: 1,
        rank: 1,
        source_ref: sourceLabel,
        payload: { source: documentIds[0] ?? "project" },
      },
    ],
    providers: { patent: "n/a", synthesis: "huggingface" },
  };
}

const MAX_SUMMARY_INPUT = 10_000;

export async function runClassification(
  admin: SupabaseClient,
  projectId: string,
  query: string | null
): Promise<AiRunSearchResult> {
  const config = getAiProviderConfig();

  const { data: project } = await admin
    .from("projects")
    .select("title, invention_summary, need_description, categories(name, slug)")
    .eq("id", projectId)
    .single();

  const category = project?.categories as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
  const categoryRow = Array.isArray(category) ? category[0] : category;
  const block = buildProjectContextBlock({
    title: project?.title ?? "Projet",
    inventionSummary: project?.invention_summary,
    needDescription: project?.need_description,
    categoryName: categoryRow?.name ?? null,
    categorySlug: categoryRow?.slug ?? null,
  });

  const q = query?.trim() || block;

  if (!config.llm) {
    const stub = generateStubResults(q, "classification");
    return {
      summary: `Classification suggérée (stub) : B01D, C02F — ${stub.summary}`,
      results: [
        {
          result_type: "ipc_class",
          title: "B01D — Traitement séparation",
          summary: "Filtration, membranes (heuristique stub)",
          score: 0.75,
          rank: 1,
          source_ref: "IPC",
          payload: { stub: true, code: "B01D" },
        },
        {
          result_type: "ipc_class",
          title: "C02F — Traitement eaux",
          summary: "Traitement des eaux usées (heuristique stub)",
          score: 0.65,
          rank: 2,
          source_ref: "IPC",
          payload: { stub: true, code: "C02F" },
        },
      ],
      providers: { patent: "n/a", synthesis: "stub" },
    };
  }

  const raw = await callLLM(
    config.llm.apiKey,
    config.llm.model,
    `Tu es expert en classification PI. À partir du dossier ci-dessous, propose une classification.
Réponds UNIQUEMENT avec un JSON array de 3 à 5 objets :
[{"code":"B01D","label":"titre court","rationale":"1 phrase","score":0.8}]
Codes IPC/CPC ou type de protection (brevet, marque, dessin).

Dossier :
${q.slice(0, 4000)}`,
    { maxTokens: 500, temperature: 0.2 }
  );

  const items = parseJsonArray(raw) as Array<{
    code?: string;
    label?: string;
    rationale?: string;
    score?: number;
  }>;

  const results: AiSearchResultItem[] = items.slice(0, 5).map((item, i) => ({
    result_type: "ipc_class",
    title: `${item.code ?? "—"} — ${item.label ?? "Classe"}`,
    summary: item.rationale ?? "",
    score: Math.min(1, Math.max(0, Number(item.score ?? 0.7))),
    rank: i + 1,
    source_ref: item.code ?? "IPC",
    payload: { code: item.code, label: item.label },
  }));

  const summary =
    results.length > 0
      ? `Classification proposée : ${results.map((r) => r.source_ref).join(", ")}. Revue CPI recommandée.`
      : raw.slice(0, 300);

  return {
    summary,
    results: results.length ? results : stubClassificationResults(),
    providers: { patent: "n/a", synthesis: "huggingface" },
  };
}

function stubClassificationResults(): AiSearchResultItem[] {
  return [
    {
      result_type: "ipc_class",
      title: "À affiner",
      summary: "Réponse IA non structurée — revue manuelle",
      score: 0.5,
      rank: 1,
      source_ref: "IPC",
      payload: {},
    },
  ];
}

export async function runTagSuggestion(
  admin: SupabaseClient,
  projectId: string,
  query: string | null
): Promise<AiRunSearchResult> {
  const config = getAiProviderConfig();

  const [{ data: project }, { data: tags }] = await Promise.all([
    admin
      .from("projects")
      .select("title, invention_summary, need_description, status")
      .eq("id", projectId)
      .single(),
    admin.from("tags").select("name, slug").eq("is_active", true).limit(20),
  ]);

  const tagList = (tags ?? []).map((t) => t.slug).join(", ") || "prioritaire, brouillon, expertise";
  const block = [
    `Projet : ${project?.title}`,
    `Statut : ${project?.status}`,
    project?.invention_summary,
    project?.need_description,
    query?.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  if (!config.llm) {
    return {
      summary: "Tags suggérés (stub) : prioritaire, expertise, ia-analyse",
      results: ["prioritaire", "expertise", "ia-analyse"].map((slug, i) => ({
        result_type: "tag",
        title: slug,
        summary: `Tag recommandé pour ce dossier (stub)`,
        score: 0.8 - i * 0.1,
        rank: i + 1,
        source_ref: slug,
        payload: { slug, stub: true },
      })),
      providers: { patent: "n/a", synthesis: "stub" },
    };
  }

  const raw = await callLLM(
    config.llm.apiKey,
    config.llm.model,
    `Suggère 3 à 5 tags pour organiser ce dossier PI.
Tags existants : ${tagList}
Réponds UNIQUEMENT JSON : [{"slug":"xxx","label":"Nom","reason":"1 phrase","score":0.8}]

Dossier :
${block.slice(0, 3000)}`,
    { maxTokens: 400, temperature: 0.4 }
  );

  const items = parseJsonArray(raw) as Array<{
    slug?: string;
    label?: string;
    reason?: string;
    score?: number;
  }>;

  const results: AiSearchResultItem[] = items.slice(0, 5).map((item, i) => ({
    result_type: "tag",
    title: item.label ?? item.slug ?? "Tag",
    summary: item.reason ?? "",
    score: Math.min(1, Math.max(0, Number(item.score ?? 0.7))),
    rank: i + 1,
    source_ref: item.slug ?? "tag",
    payload: { slug: item.slug, label: item.label },
  }));

  return {
    summary:
      results.length > 0
        ? `Tags suggérés : ${results.map((r) => r.title).join(", ")}`
        : "Aucun tag structuré — consultez les résultats bruts",
    results: results.length
      ? results
      : [
          {
            result_type: "tag",
            title: "Expertise requise",
            summary: "Dossier technique nécessitant un avis",
            score: 0.7,
            rank: 1,
            source_ref: "expertise",
            payload: { slug: "expertise" },
          },
        ],
    providers: { patent: "n/a", synthesis: "huggingface" },
  };
}

export async function runSemanticAnalysis(
  query: string,
  patentResults: AiSearchResultItem[],
  patentProvider: string
): Promise<string> {
  const config = getAiProviderConfig();
  if (!config.llm) {
    return templateNoveltySummary(query, patentResults, patentProvider).replace(
      "nouveauté",
      "analyse sémantique"
    );
  }

  const hits = patentResults
    .slice(0, 6)
    .map((r, i) => `${i + 1}. ${r.source_ref} — ${r.title}\n   ${r.summary.slice(0, 150)}`)
    .join("\n");

  return callLLM(
    config.llm.apiKey,
    config.llm.model,
    `Analyse sémantique PI en français (max 150 mots).
Compare les concepts de la requête avec les documents trouvés.
Requête : « ${query} »
Documents :
${hits || "Aucun"}

Indique : concepts communs · écarts · risque de chevauchement conceptuel (prudent).`,
    { maxTokens: 450 }
  );
}

export async function runSimilarityAnalysis(
  query: string,
  inventionSummary: string | null,
  patentResults: AiSearchResultItem[],
  patentProvider: string
): Promise<string> {
  const base = inventionSummary?.trim() || query;
  const config = getAiProviderConfig();

  if (!config.llm) {
    const top = patentResults[0];
    return [
      `Analyse de similarité (${patentProvider}) basée sur le résumé d'invention.`,
      top
        ? `Document le plus proche : ${top.source_ref} (${Math.round((top.score ?? 0) * 100)}%).`
        : "Aucun document brevet trouvé.",
      "Recommandation : revue CPI.",
    ].join(" ");
  }

  const hits = patentResults
    .slice(0, 5)
    .map((r) => `- ${r.source_ref} (${Math.round((r.score ?? 0) * 100)}%) : ${r.title}`)
    .join("\n");

  return callLLM(
    config.llm.apiKey,
    config.llm.model,
    `Évalue la similarité entre l'invention du porteur et les brevets trouvés (max 150 mots, français, prudent).

Invention :
${base.slice(0, 2000)}

Brevets :
${hits || "Aucun"}

Conclus sur le degré de proximité technique (faible/modéré/élevé).`,
    { maxTokens: 450 }
  );
}

function buildAssistantFallback(
  query: string,
  ctx: ProjectAiContext,
  reason: string
): string {
  const lines = [
    `Question : ${query}`,
    "",
    `⚠️ ${reason}`,
    "",
    "Réponse indicative (mode hors-ligne) :",
  ];

  if (ctx.inventionSummary) {
    lines.push(`• Votre dossier décrit : ${ctx.inventionSummary.slice(0, 280)}${ctx.inventionSummary.length > 280 ? "…" : ""}`);
  }
  if (ctx.needDescription) {
    lines.push(`• Besoin PI : ${ctx.needDescription.slice(0, 200)}`);
  }
  if (ctx.categoryName) {
    lines.push(`• Type de protection visé : ${ctx.categoryName}`);
  }

  lines.push(
    "",
    "Étapes usuelles : documenter l'invention → recherche d'antériorité (onglet Nouveauté) → revue par un CPI → dépôt si la voie est libre.",
    "Ceci ne remplace pas un conseil juridique personnalisé."
  );

  return lines.join("\n");
}

function assistantResult(
  answer: string,
  query: string,
  synthesis: string,
  extra?: Record<string, unknown>
): AiRunSearchResult {
  return {
    summary: answer,
    results: [
      {
        result_type: "assistant",
        title: "Réponse assistant PI",
        summary: answer,
        score: 1,
        rank: 1,
        source_ref: "assistant",
        payload: { question: query, ...extra },
      },
    ],
    providers: { patent: "n/a", synthesis },
  };
}

export async function runAssistant(
  admin: SupabaseClient,
  projectId: string,
  query: string
): Promise<AiRunSearchResult> {
  const config = getAiProviderConfig();
  const ctx = await fetchProjectContext(admin, projectId);
  const block = buildProjectContextBlock(ctx);
  const q = query.trim();

  if (!q) {
    return {
      summary: "Saisissez une question pour l'assistant PI.",
      results: [],
      providers: { patent: "n/a", synthesis: "template" },
    };
  }

  if (!config.llm) {
    const answer = buildAssistantFallback(
      q,
      ctx,
      "HUGGINGFACE_API_KEY non configurée — mode hors-ligne."
    );
    return assistantResult(answer, q, "template", { stub: true });
  }

  try {
    const answer = await callLLM(
      config.llm.apiKey,
      config.llm.model,
      `Tu es un assistant PI pour porteurs de projet en France. Réponds en français (max 250 mots).
Règles : conseils généraux uniquement, pas d'avis juridique contraignant, mentionne quand une revue CPI est nécessaire.

Dossier :
${block.slice(0, 3500)}

Question : ${q}`,
      { maxTokens: 600, temperature: 0.4 }
    );

    return assistantResult(answer, q, "huggingface");
  } catch (e) {
    console.error("[ai] assistant HF failed:", e);
    const hint = llmErrorHint(e);
    const answer = buildAssistantFallback(q, ctx, hint);
    return assistantResult(answer, q, isLlmQuotaError(e) ? "quota-fallback" : "error-fallback", {
      llm_error: true,
      quota: isLlmQuotaError(e),
    });
  }
}

export async function fetchProjectContext(
  admin: SupabaseClient,
  projectId: string
): Promise<ProjectAiContext & { similarityQuery: string }> {
  const { data: project } = await admin
    .from("projects")
    .select("title, invention_summary, need_description, categories(name, slug)")
    .eq("id", projectId)
    .single();

  const category = project?.categories as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
  const categoryRow = Array.isArray(category) ? category[0] : category;
  const categoryName = categoryRow?.name ?? null;
  const categorySlug = categoryRow?.slug ?? null;

  const inventionSummary = project?.invention_summary ?? null;
  const similarityQuery =
    inventionSummary?.trim() ||
    [project?.title, project?.need_description].filter(Boolean).join(" — ") ||
    "analyse similarité";

  return {
    title: project?.title ?? "Projet",
    inventionSummary,
    needDescription: project?.need_description ?? null,
    categoryName,
    categorySlug,
    similarityQuery,
  };
}
