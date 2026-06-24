import type { IpAssetType } from "@/types/surveillance";
import {
  isDesignCategory,
  isMarqueCategory,
} from "@/lib/workflow/category-slugs";

/** Type d'actif OMPIC pour antériorité / surveillance selon la catégorie dossier. */
export function resolveAssetTypeFromCategory(categorySlug?: string | null): IpAssetType {
  if (isMarqueCategory(categorySlug)) return "trademark";
  if (isDesignCategory(categorySlug)) return "design";
  return "patent";
}

export function locarnoOrClassesLabel(assetType: IpAssetType): string {
  if (assetType === "design") return "Classes Locarno (optionnel)";
  if (assetType === "trademark") return "Classes Nice (optionnel)";
  return "Classes IPC (optionnel)";
}
