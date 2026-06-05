import type { ProjectStatus } from "@/types/database";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  in_review: "En revue",
  awaiting_documents: "Documents attendus",
  expert_review: "Revue expert",
  cpi_review: "Revue CPI",
  approved: "Approuvé",
  rejected: "Rejeté",
  closed: "Clôturé",
};

export const ALLOWED_UPLOAD_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "text/csv",
] as const;

export const MAX_FILE_SIZE_MB = 50;

export const STORAGE_BUCKETS = {
  documents: "project-documents",
  avatars: "avatars",
} as const;
