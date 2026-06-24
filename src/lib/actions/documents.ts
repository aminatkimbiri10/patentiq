"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { STORAGE_BUCKETS } from "@/config/constants";
import { buildProjectDocumentPath } from "@/lib/storage/paths";
import { uploadDocumentSchema, validateUploadFile } from "@/lib/validations/document";
import { logAction } from "@/lib/audit/log-action";
import type { Document, DocumentVersion } from "@/types/database";

export type DocumentActionState = {
  error?: string;
  success?: boolean;
};

export async function uploadDocument(
  _prev: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const ctx = await requireUser();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Fichier manquant" };
  }

  const parsed = uploadDocumentSchema.safeParse({
    project_id: formData.get("project_id"),
    title: formData.get("title") || file.name,
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const fileCheck = validateUploadFile(file);
  if (!fileCheck.ok) return { error: fileCheck.error };

  const supabase = await createClient();
  const filePath = buildProjectDocumentPath(
    parsed.data.project_id,
    ctx.user.id,
    file.name
  );
  const title = parsed.data.title ?? file.name;

  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      project_id: parsed.data.project_id,
      owner_id: ctx.user.id,
      uploaded_by: ctx.user.id,
      title,
      file_name: file.name,
      file_path: filePath,
      bucket_id: STORAGE_BUCKETS.documents,
      mime_type: file.type,
      file_size: file.size,
      status: "uploading",
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.documents)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    await supabase.from("documents").delete().eq("id", doc.id);
    return { error: uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("documents")
    .update({ status: "active" })
    .eq("id", doc.id);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath("/dashboard/documents");
  return { success: true };
}

export async function deleteDocument(documentId: string, projectId: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path, bucket_id, owner_id")
    .eq("id", documentId)
    .single();

  if (!doc) throw new Error("Document introuvable");

  await supabase.storage.from(doc.bucket_id).remove([doc.file_path]);

  const { error } = await supabase
    .from("documents")
    .update({ status: "deleted" })
    .eq("id", documentId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/documents");
}

export async function getDocumentSignedUrl(documentId: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path, bucket_id, title, mime_type, project_id")
    .eq("id", documentId)
    .neq("status", "deleted")
    .single();

  if (!doc) throw new Error("Document introuvable");

  const { data, error } = await supabase.storage
    .from(doc.bucket_id)
    .createSignedUrl(doc.file_path, 3600);

  if (error || !data?.signedUrl) throw new Error(error?.message ?? "URL indisponible");

  return {
    url: data.signedUrl,
    title: doc.title,
    mimeType: doc.mime_type as string | null,
    projectId: doc.project_id as string,
  };
}

export async function saveDocumentOcrText(
  documentId: string,
  projectId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);
  if (!canView) return { success: false, error: "Accès refusé" };

  const trimmed = text.trim().slice(0, 12_000);
  if (trimmed.length < 10) {
    return { success: false, error: "Texte OCR trop court — vérifiez la qualité du scan." };
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("metadata")
    .eq("id", documentId)
    .eq("project_id", projectId)
    .single();

  const base =
    doc?.metadata && typeof doc.metadata === "object"
      ? { ...(doc.metadata as Record<string, unknown>) }
      : {};

  const { error } = await supabase
    .from("documents")
    .update({
      metadata: {
        ...base,
        ocr_text: trimmed,
        ocr_at: new Date().toISOString(),
        ocr_by: ctx.user.id,
        ocr_source: "browser_tesseract",
      },
    })
    .eq("id", documentId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/cpi/cases/${projectId}`);
  return { success: true };
}

export type DocumentVersionRow = DocumentVersion & {
  profiles?: { full_name: string | null } | null;
};

export type DocumentVersionHistory = {
  current: Pick<
    Document,
    | "id"
    | "title"
    | "version_number"
    | "file_name"
    | "file_size"
    | "uploaded_by"
    | "updated_at"
    | "created_at"
  >;
  versions: DocumentVersionRow[];
};

export async function getDocumentVersionHistory(
  documentId: string
): Promise<DocumentVersionHistory | null> {
  await requireUser();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("id, title, version_number, file_name, file_size, uploaded_by, updated_at, created_at, project_id")
    .eq("id", documentId)
    .neq("status", "deleted")
    .single();

  if (!doc) return null;

  const { data: versions } = await supabase
    .from("document_versions")
    .select("*, profiles:uploaded_by(full_name)")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false });

  const mapped = (versions ?? []).map((v) => {
    const row = v as DocumentVersionRow & {
      profiles: DocumentVersionRow["profiles"] | NonNullable<DocumentVersionRow["profiles"]>[];
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return { ...row, profiles: profile ?? null };
  });

  return { current: doc, versions: mapped };
}

export async function getDocumentVersionSignedUrl(
  documentId: string,
  versionNumber: number
) {
  await requireUser();
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path, bucket_id, title, version_number, project_id")
    .eq("id", documentId)
    .neq("status", "deleted")
    .single();

  if (!doc) throw new Error("Document introuvable");

  let filePath = doc.file_path;
  let bucketId = doc.bucket_id;
  let label = `${doc.title} v${doc.version_number}`;

  if (versionNumber !== doc.version_number) {
    const { data: version } = await supabase
      .from("document_versions")
      .select("file_path, bucket_id, file_name, version_number")
      .eq("document_id", documentId)
      .eq("version_number", versionNumber)
      .single();

    if (!version) throw new Error("Version introuvable");
    filePath = version.file_path;
    bucketId = version.bucket_id;
    label = `${doc.title} v${version.version_number}`;
  }

  const { data, error } = await supabase.storage
    .from(bucketId)
    .createSignedUrl(filePath, 3600);

  if (error || !data?.signedUrl) throw new Error(error?.message ?? "URL indisponible");

  return { url: data.signedUrl, title: label };
}

const uploadVersionSchema = z.object({
  document_id: z.string().uuid(),
  project_id: z.string().uuid(),
  change_note: z.string().max(500).optional(),
});

export async function uploadDocumentVersion(
  _prev: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const ctx = await requireUser();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Fichier manquant" };
  }

  const parsed = uploadVersionSchema.safeParse({
    document_id: formData.get("document_id"),
    project_id: formData.get("project_id"),
    change_note: formData.get("change_note") || undefined,
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const fileCheck = validateUploadFile(file);
  if (!fileCheck.ok) return { error: fileCheck.error };

  const supabase = await createClient();

  const { data: canUpload } = await supabase.rpc("can_upload_to_project", {
    p_project_id: parsed.data.project_id,
  } as never);
  if (!canUpload) return { error: "Vous ne pouvez pas modifier ce document" };

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", parsed.data.document_id)
    .eq("project_id", parsed.data.project_id)
    .neq("status", "deleted")
    .single();

  if (fetchError || !doc) {
    return { error: fetchError?.message ?? "Document introuvable" };
  }

  const { error: archiveError } = await supabase.from("document_versions").insert({
    document_id: doc.id,
    version_number: doc.version_number,
    file_name: doc.file_name,
    file_path: doc.file_path,
    bucket_id: doc.bucket_id,
    mime_type: doc.mime_type,
    file_size: doc.file_size,
    uploaded_by: doc.uploaded_by,
    change_note: null,
  });

  if (archiveError) return { error: archiveError.message };

  const newPath = buildProjectDocumentPath(
    parsed.data.project_id,
    ctx.user.id,
    file.name
  );
  const newVersion = doc.version_number + 1;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.documents)
    .upload(newPath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      file_name: file.name,
      file_path: newPath,
      mime_type: file.type,
      file_size: file.size,
      version_number: newVersion,
      uploaded_by: ctx.user.id,
      updated_at: new Date().toISOString(),
      status: "active",
      metadata: {
        ...(typeof doc.metadata === "object" && doc.metadata ? doc.metadata : {}),
        last_change_note: parsed.data.change_note ?? null,
      },
    })
    .eq("id", doc.id);

  if (updateError) {
    await supabase.storage.from(STORAGE_BUCKETS.documents).remove([newPath]);
    return { error: updateError.message };
  }

  await logAction({
    action: "upload",
    entityType: "document",
    entityId: doc.id,
    projectId: parsed.data.project_id,
    oldData: { version_number: doc.version_number, file_name: doc.file_name },
    newData: {
      version_number: newVersion,
      file_name: file.name,
      change_note: parsed.data.change_note ?? null,
    },
  });

  await supabase.from("project_updates").insert({
    project_id: parsed.data.project_id,
    author_id: ctx.user.id,
    update_type: "system",
    title: `Nouvelle version — ${doc.title}`,
    content: `Version ${newVersion}${parsed.data.change_note ? ` : ${parsed.data.change_note}` : ""}`,
    metadata: { document_id: doc.id, version_number: newVersion },
  });

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  revalidatePath("/dashboard/documents");

  return { success: true };
}
