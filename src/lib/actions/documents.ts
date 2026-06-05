"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { STORAGE_BUCKETS } from "@/config/constants";
import { buildProjectDocumentPath } from "@/lib/storage/paths";
import { uploadDocumentSchema, validateUploadFile } from "@/lib/validations/document";

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
    .select("file_path, bucket_id, title")
    .eq("id", documentId)
    .neq("status", "deleted")
    .single();

  if (!doc) throw new Error("Document introuvable");

  const { data, error } = await supabase.storage
    .from(doc.bucket_id)
    .createSignedUrl(doc.file_path, 3600);

  if (error || !data?.signedUrl) throw new Error(error?.message ?? "URL indisponible");

  return { url: data.signedUrl, title: doc.title };
}
