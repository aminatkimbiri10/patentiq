export function isMarqueCategory(slug?: string | null): boolean {
  return slug === "marque";
}

export function isBrevetCategory(slug?: string | null): boolean {
  return slug === "brevet" || slug === "modele-utilite";
}

export function isDesignCategory(slug?: string | null): boolean {
  return slug === "dessin-modele";
}
