import { createClient } from "@/lib/supabase/server";
import { getCpiProjectFilter } from "@/lib/cpi/queries";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { ProjectStatus } from "@/types/database";

export type PortfolioBucket = { key: string; label: string; value: number };

export type PortfolioStats = {
  total: number;
  active: number;
  decided: number;
  draft: number;
  byStatus: PortfolioBucket[];
  byCategory: PortfolioBucket[];
};

const ACTIVE_STATUSES: ProjectStatus[] = [
  "submitted",
  "in_review",
  "awaiting_documents",
  "expert_review",
  "cpi_review",
];
const DECIDED_STATUSES: ProjectStatus[] = ["approved", "rejected", "closed"];

type PortfolioRow = {
  status: ProjectStatus;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

/** Agrégats du portefeuille CPI : répartition par statut et par catégorie. */
export async function getCpiPortfolioStats(userId: string): Promise<PortfolioStats> {
  const supabase = await createClient();
  const filter = await getCpiProjectFilter(userId);

  const { data, error } = await supabase
    .from("projects")
    .select("status, categories(name, slug)")
    .or(filter);

  if (error) {
    console.error("[cpi] getCpiPortfolioStats:", error.message);
  }

  const rows = (data ?? []) as PortfolioRow[];

  const statusCounts = new Map<string, number>();
  const categoryCounts = new Map<string, string>();
  const categoryValues = new Map<string, number>();

  let active = 0;
  let decided = 0;
  let draft = 0;

  for (const row of rows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
    if (ACTIVE_STATUSES.includes(row.status)) active++;
    if (DECIDED_STATUSES.includes(row.status)) decided++;
    if (row.status === "draft") draft++;

    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const slug = category?.slug ?? "autre";
    const name = category?.name ?? "Non catégorisé";
    categoryCounts.set(slug, name);
    categoryValues.set(slug, (categoryValues.get(slug) ?? 0) + 1);
  }

  const byStatus: PortfolioBucket[] = Array.from(statusCounts.entries())
    .map(([key, value]) => ({
      key,
      label: PROJECT_STATUS_LABELS[key as ProjectStatus] ?? key,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const byCategory: PortfolioBucket[] = Array.from(categoryValues.entries())
    .map(([key, value]) => ({ key, label: categoryCounts.get(key) ?? key, value }))
    .sort((a, b) => b.value - a.value);

  return {
    total: rows.length,
    active,
    decided,
    draft,
    byStatus,
    byCategory,
  };
}
