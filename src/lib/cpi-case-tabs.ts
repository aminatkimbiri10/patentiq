export type CpiCaseTab = "dossier" | "ia" | "echanges";
export type CpiIaSection = "new" | "history";

const CPI_TABS = new Set<CpiCaseTab>(["dossier", "ia", "echanges"]);

export function resolveCpiCaseTab(
  tabParam: string | null,
  sectionParam?: string | null
): { tab: CpiCaseTab; iaSection: CpiIaSection } {
  if (tabParam === "search") {
    return {
      tab: "ia",
      iaSection: sectionParam === "history" ? "history" : "new",
    };
  }

  if (tabParam && CPI_TABS.has(tabParam as CpiCaseTab)) {
    return {
      tab: tabParam as CpiCaseTab,
      iaSection: sectionParam === "history" ? "history" : "new",
    };
  }

  return { tab: "dossier", iaSection: "new" };
}
