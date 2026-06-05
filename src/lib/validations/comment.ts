import { z } from "zod";

export const createCommentSchema = z.object({
  project_id: z.string().uuid(),
  body: z.string().min(1, "Commentaire requis").max(10000),
  parent_id: z.string().uuid().optional(),
  is_legal: z
    .union([
      z.literal("true"),
      z.literal("false"),
      z.literal("on"),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .transform((v) => v === "true" || v === "on"),
});
