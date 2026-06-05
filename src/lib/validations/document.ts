import { z } from "zod";
import { ALLOWED_UPLOAD_MIME, MAX_FILE_SIZE_MB } from "@/config/constants";

const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

export const uploadDocumentSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
});

export function validateUploadFile(file: File) {
  if (!file || file.size === 0) {
    return { ok: false as const, error: "Fichier vide" };
  }
  if (file.size > maxBytes) {
    return { ok: false as const, error: `Taille max ${MAX_FILE_SIZE_MB} Mo` };
  }
  if (!ALLOWED_UPLOAD_MIME.includes(file.type as (typeof ALLOWED_UPLOAD_MIME)[number])) {
    return { ok: false as const, error: "Type de fichier non autorisé" };
  }
  return { ok: true as const };
}
