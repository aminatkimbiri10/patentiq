import type { SupabaseClient } from "@supabase/supabase-js";
import { extractDocumentText } from "@/lib/ai/extract-document-text";
import { retrieveRelevantDocumentChunks } from "@/lib/ai/document-rag";
import { parseProjectChecklist, checklistProgress } from "@/lib/checklists/parse";
import { getChecklistTemplate } from "@/lib/checklists/templates";
import type { ProjectAiContext } from "@/lib/ai/run-analysis";

export type RichProjectAiContext = ProjectAiContext & {
  referenceCode: string | null;
  status: string | null;
  contextBlock: string;
};

const MAX_CONTEXT_CHARS = 5_500;

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export async function fetchRichProjectContext(
  admin: SupabaseClient,
  projectId: string,
  ragQuery?: string | null
): Promise<RichProjectAiContext> {
  const { data: project } = await admin
    .from("projects")
    .select(
      "title, reference_code, status, invention_summary, need_description, metadata, owner_id, categories(name, slug)"
    )
    .eq("id", projectId)
    .single();

  const category = project?.categories as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
  const categoryRow = Array.isArray(category) ? category[0] : category;

  const base: ProjectAiContext = {
    title: project?.title ?? "Projet",
    inventionSummary: project?.invention_summary ?? null,
    needDescription: project?.need_description ?? null,
    categoryName: categoryRow?.name ?? null,
    categorySlug: categoryRow?.slug ?? null,
  };

  const sections: string[] = [
    `Projet : ${base.title}`,
    project?.reference_code ? `Référence : ${project.reference_code}` : null,
    project?.status ? `Statut : ${project.status}` : null,
    base.categoryName ? `Catégorie : ${base.categoryName}` : null,
    base.inventionSummary ? `Invention : ${base.inventionSummary}` : null,
    base.needDescription ? `Besoin PI : ${base.needDescription}` : null,
  ].filter((s): s is string => !!s);

  if (categoryRow?.slug) {
    const template = getChecklistTemplate(categoryRow.slug);
    const state = parseProjectChecklist(project?.metadata);
    const prog = checklistProgress(
      template.items.map((i) => i.id),
      state
    );
    const pending = template.items
      .filter((i) => !state.checked[i.id])
      .slice(0, 5)
      .map((i) => i.label);
    sections.push(`Checklist PI : ${prog.percent}% (${prog.done}/${prog.total})`);
    if (pending.length) {
      sections.push(`Points checklist restants : ${pending.join(" · ")}`);
    }
  }

  const { data: tasks } = await admin
    .from("project_tasks")
    .select("title, status, due_at, assigned_to")
    .eq("project_id", projectId)
    .in("status", ["pending", "in_progress"])
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(5);

  if (tasks?.length) {
    sections.push(
      `Tâches ouvertes :\n${tasks.map((t) => `• ${t.title}${t.due_at ? ` (échéance ${new Date(t.due_at).toLocaleDateString("fr-FR")})` : ""}`).join("\n")}`
    );
  }

  const { data: aiSearches } = await admin
    .from("ai_searches")
    .select("search_type, query, metadata, status, created_at")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(3);

  if (aiSearches?.length) {
    const lines = aiSearches.map((s) => {
      const meta = s.metadata as { summary?: string } | null;
      const summary = meta?.summary?.trim();
      const label = s.query ?? s.search_type;
      return summary
        ? `• [${s.search_type}] ${label} : ${clip(summary, 280)}`
        : `• [${s.search_type}] ${label}`;
    });
    sections.push(`Analyses IA récentes :\n${lines.join("\n")}`);
  }

  const { data: expertComments } = await admin
    .from("project_comments")
    .select("body, metadata, created_at")
    .eq("project_id", projectId)
    .contains("metadata", { kind: "expert_recommendation" })
    .order("created_at", { ascending: false })
    .limit(1);

  if (expertComments?.[0]) {
    const row = expertComments[0];
    const meta = row.metadata as {
      feasibility?: string;
      recommendation?: string;
      risks?: string | null;
    };
    const parts = [
      meta?.recommendation ? `Avis : ${meta.recommendation}` : null,
      meta?.feasibility ? `Faisabilité : ${meta.feasibility}` : null,
      meta?.risks ? `Risques : ${meta.risks}` : null,
      row.body ? clip(row.body, 400) : null,
    ].filter(Boolean);
    sections.push(`Dernier avis expert :\n${parts.join("\n")}`);
  }

  const { data: docs } = await admin
    .from("documents")
    .select("id, title, mime_type, metadata")
    .eq("project_id", projectId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  const docSnippets: string[] = [];
  for (const doc of docs ?? []) {
    const meta = doc.metadata as { ocr_text?: string } | null;
    if (meta?.ocr_text) {
      docSnippets.push(`• ${doc.title} (OCR) : ${clip(meta.ocr_text, 500)}`);
      continue;
    }
    if (docSnippets.length >= 1) continue;
    if (
      doc.mime_type === "application/pdf" ||
      doc.mime_type?.startsWith("text/") ||
      doc.mime_type?.startsWith("image/")
    ) {
      const extracted = await extractDocumentText(admin, doc.id);
      if (extracted && extracted.source !== "metadata" && extracted.text.length > 30) {
        docSnippets.push(`• ${extracted.title} : ${clip(extracted.text, 600)}`);
      }
    }
  }
  if (docSnippets.length) {
    sections.push(`Extraits documents :\n${docSnippets.join("\n")}`);
  }

  if (ragQuery?.trim()) {
    const ragChunks = await retrieveRelevantDocumentChunks(admin, projectId, ragQuery, 3);
    if (ragChunks.length) {
      sections.push(
        `Passages pertinents (RAG) :\n${ragChunks
          .map((c) => `• [${c.title}] ${clip(c.excerpt, 500)}`)
          .join("\n")}`
      );
    }
  }

  const contextBlock = clip(sections.join("\n\n"), MAX_CONTEXT_CHARS);

  return {
    ...base,
    referenceCode: project?.reference_code ?? null,
    status: project?.status ?? null,
    contextBlock,
  };
}
