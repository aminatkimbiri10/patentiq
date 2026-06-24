import JSZip from "jszip";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AiResult } from "@/types/database";

import { buildReportHtmlForArchive } from "@/lib/ai/build-report-html";

import { STORAGE_BUCKETS } from "@/config/constants";

import { loadPatentDossierForExport } from "@/lib/export/load-patent-dossier";

import { buildAiReportPdfBuffer } from "@/lib/export/build-ai-report-pdf";



function safeFilename(name: string): string {

  return name.replace(/[^\w\s.-]/g, "").replace(/\s+/g, "-").slice(0, 80) || "fichier";

}



async function addAiReportToZip(

  aiFolder: JSZip | null,

  baseName: string,

  reportInput: Parameters<typeof buildReportHtmlForArchive>[0]

): Promise<boolean> {

  if (!aiFolder) return false;



  try {

    const pdfBuffer = await buildAiReportPdfBuffer(reportInput);

    aiFolder.file(`${baseName}.pdf`, pdfBuffer);

    return true;

  } catch {

    aiFolder.file(`${baseName}.html`, buildReportHtmlForArchive(reportInput));

    return true;

  }

}



export async function buildProjectZipBuffer(

  supabase: SupabaseClient,

  projectId: string

): Promise<

  | { ok: true; buffer: Buffer; filename: string }

  | { ok: false; error: string; status: 404 | 400 | 500 }

> {

  const { data: project, error: projectErr } = await supabase

    .from("projects")

    .select(

      "title, reference_code, invention_summary, need_description, status, categories(name, slug)"

    )

    .eq("id", projectId)

    .single();



  if (projectErr || !project) {

    return { ok: false, error: "Projet introuvable", status: 404 };

  }



  const zip = new JSZip();

  const category = project.categories as { name: string; slug: string } | { name: string; slug: string }[] | null;

  const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;

  const categorySlug = Array.isArray(category) ? category[0]?.slug : category?.slug;



  const [{ data: documents }, { data: aiSearches }] = await Promise.all([

    supabase

      .from("documents")

      .select("id, title, file_name, file_path, mime_type, created_at")

      .eq("project_id", projectId)

      .eq("status", "active")

      .order("created_at", { ascending: false }),

    supabase

      .from("ai_searches")

      .select("id, search_type, status, query, created_at, completed_at, error_message, metadata")

      .eq("project_id", projectId)

      .order("created_at", { ascending: false })

      .limit(10),

  ]);



  const hasSummary =

    Boolean((project.invention_summary as string | null)?.trim()) ||

    Boolean((project.need_description as string | null)?.trim());



  if (hasSummary) {

    zip.file(

      "projet-fiche.txt",

      [

        `Projet : ${project.title}`,

        project.reference_code ? `Reference : ${project.reference_code}` : "",

        categoryName ? `Categorie : ${categoryName}` : "",

        "",

        "=== Resume invention ===",

        (project.invention_summary as string | null)?.trim() || "(non renseigne)",

        "",

        "=== Besoin PI ===",

        (project.need_description as string | null)?.trim() || "(non renseigne)",

      ]

        .filter((line, i, arr) => line !== "" || i < arr.length - 1)

        .join("\n")

    );

  }



  zip.file(

    "README.txt",

    [

      "PatentIQ — Export dossier I2PA",

      "================================",

      "",

      `Projet : ${project.title}`,

      project.reference_code ? `Reference : ${project.reference_code}` : "",

      categoryName ? `Categorie : ${categoryName}` : "",

      `Exporte le : ${new Date().toLocaleString("fr-FR")}`,

      "",

      "Contenu :",

      "- manifest.json — metadonnees projet",

      "- projet-fiche.txt — resume et besoin PI (si renseignes)",

      "- dossier-brevet.html — redaction + revendications (si brevet)",

      "- analyses-ia/ — rapports PDF des recherches IA (HTML si PDF indisponible)",

      "- documents/ — pieces jointes du dossier",

      "",

      "Le depot officiel reste sur directompic.ma — ce ZIP est un livrable de preparation CPI.",

    ]

      .filter(Boolean)

      .join("\n")

  );



  zip.file(

    "manifest.json",

    JSON.stringify(

      {

        project_id: projectId,

        title: project.title,

        reference_code: project.reference_code,

        category: categoryName,

        category_slug: categorySlug,

        status: project.status,

        invention_summary: project.invention_summary,

        need_description: project.need_description,

        exported_at: new Date().toISOString(),

        document_count: documents?.length ?? 0,

        ai_search_count: aiSearches?.length ?? 0,

      },

      null,

      2

    )

  );



  const dossier = await loadPatentDossierForExport(supabase, projectId);

  if (dossier.ok) {

    zip.file("dossier-brevet.html", dossier.html);

  }



  let aiReportCount = 0;

  if (aiSearches?.length) {

    const aiFolder = zip.folder("analyses-ia");

    for (const search of aiSearches) {

      if (search.status !== "completed") continue;



      const { data: results } = await supabase

        .from("ai_results")

        .select("title, summary, score, rank, source_ref, payload, result_type")

        .eq("search_id", search.id)

        .order("rank", { ascending: true })

        .limit(20);



      const metadata = search.metadata as { summary?: string } | null;

      const reportInput = {

        projectTitle: project.title as string,

        referenceCode: project.reference_code as string | null,

        categoryName: categoryName ?? null,

        query: search.query as string | null,

        summary: metadata?.summary ?? "Synthese non disponible.",

        results: (results ?? []) as AiResult[],

        generatedAt: (search.completed_at as string) ?? new Date().toISOString(),

        searchType: search.search_type as string,

      };



      const baseName = `${search.search_type}-${search.id.slice(0, 8)}`;

      const added = await addAiReportToZip(aiFolder, baseName, reportInput);

      if (added) aiReportCount += 1;

    }

  }



  let docFileCount = 0;

  if (documents?.length) {

    const docsFolder = zip.folder("documents");

    for (const doc of documents) {

      if (!doc.file_path) continue;

      try {

        const { data: blob, error } = await supabase.storage

          .from(STORAGE_BUCKETS.documents)

          .download(doc.file_path);

        if (error || !blob) continue;

        const buf = Buffer.from(await blob.arrayBuffer());

        docsFolder?.file(safeFilename(doc.file_name ?? doc.title ?? "document"), buf);

        docFileCount += 1;

      } catch {

        /* piece inaccessible — ignorer */

      }

    }

  }



  const hasDossier = dossier.ok;

  const hasDocs = docFileCount > 0;

  const hasAi = aiReportCount > 0;



  if (!hasDossier && !hasDocs && !hasAi && !hasSummary) {

    return {

      ok: false,

      error:

        "Ajoutez des documents, une redaction/revendications, une analyse IA terminee, ou renseignez le resume du projet.",

      status: 400,

    };

  }



  try {

    const buffer = Buffer.from(await zip.generateAsync({ type: "arraybuffer" }));

    const filename = `patentiq-${safeFilename(project.title as string)}.zip`;

    return { ok: true, buffer, filename };

  } catch {

    return {

      ok: false,

      error: "Erreur lors de la compression du dossier ZIP.",

      status: 500,

    };

  }

}


