import { randomUUID } from "crypto";

export function buildProjectDocumentPath(
  projectId: string,
  userId: string,
  fileName: string
): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `${projectId}/${userId}/${randomUUID()}-${safe}`;
}

export function buildAvatarPath(userId: string, extension: string): string {
  return `${userId}/avatar.${extension.replace(".", "")}`;
}
