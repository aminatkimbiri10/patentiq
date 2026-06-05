import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Titre requis (min. 3 caractères)"),
  description: z.string().optional(),
  invention_summary: z.string().optional(),
  need_description: z.string().optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
