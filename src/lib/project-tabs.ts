export type ProjectMainTab = "dossier" | "echanges" | "search";

export type DossierSection = "documents" | "checklist" | "parcours-pi";

/** Sections historiques → parcours PI unifié */
const PI_LEGACY_SECTIONS = new Set([
  "redaction",
  "revendications",
  "marque-cycle",
  "brevet-cycle",
  "parcours-pi",
]);

export type EchangesSection = "comments" | "messages" | "tasks";
export type SearchSection = "new" | "history";

const MAIN_TABS = new Set<ProjectMainTab>(["dossier", "echanges", "search"]);

function normalizeDossierSection(section: string | null | undefined): DossierSection {
  if (section === "checklist") return "checklist";
  if (section && PI_LEGACY_SECTIONS.has(section)) return "parcours-pi";
  return "documents";
}

const LEGACY_TAB_MAP: Record<string, { tab: ProjectMainTab; section?: string }> = {
  documents: { tab: "dossier", section: "documents" },
  checklist: { tab: "dossier", section: "checklist" },
  "parcours-pi": { tab: "dossier", section: "parcours-pi" },
  revendications: { tab: "dossier", section: "revendications" },
  redaction: { tab: "dossier", section: "redaction" },
  "marque-cycle": { tab: "dossier", section: "marque-cycle" },
  "brevet-cycle": { tab: "dossier", section: "brevet-cycle" },
  valorisation: { tab: "dossier", section: "parcours-pi" },
  comments: { tab: "echanges", section: "comments" },
  messages: { tab: "echanges", section: "messages" },
  tasks: { tab: "echanges", section: "tasks" },
  activity: { tab: "dossier" },
  overview: { tab: "dossier" },
  search: { tab: "search" },
  dossier: { tab: "dossier", section: "documents" },
  echanges: { tab: "echanges", section: "comments" },
};

export function resolveProjectTab(
  tabParam: string | null,
  sectionParam?: string | null
): {
  tab: ProjectMainTab;
  dossierSection: DossierSection;
  echangesSection: EchangesSection;
  searchSection: SearchSection;
} {
  if (!tabParam) {
    return {
      tab: "dossier",
      dossierSection: "documents",
      echangesSection: "comments",
      searchSection: "new",
    };
  }

  const mapped = LEGACY_TAB_MAP[tabParam];
  if (mapped) {
    const tab = mapped.tab;
    return {
      tab,
      dossierSection:
        tab === "dossier"
          ? normalizeDossierSection(sectionParam ?? mapped.section)
          : "documents",
      echangesSection:
        tab === "echanges"
          ? ["comments", "messages", "tasks"].includes(sectionParam ?? mapped.section ?? "")
            ? ((sectionParam ?? mapped.section) as EchangesSection)
            : "comments"
          : "comments",
      searchSection: tab === "search" && sectionParam === "history" ? "history" : "new",
    };
  }

  if (MAIN_TABS.has(tabParam as ProjectMainTab)) {
    return {
      tab: tabParam as ProjectMainTab,
      dossierSection:
        tabParam === "dossier" ? normalizeDossierSection(sectionParam) : "documents",
      echangesSection: (["comments", "messages", "tasks"].includes(sectionParam ?? "")
        ? sectionParam
        : "comments") as EchangesSection,
      searchSection: tabParam === "search" && sectionParam === "history" ? "history" : "new",
    };
  }

  return {
    tab: "dossier",
    dossierSection: "documents",
    echangesSection: "comments",
    searchSection: "new",
  };
}

export function projectTabQuery(
  tab: ProjectMainTab,
  section?: DossierSection | EchangesSection | SearchSection
): string {
  if (tab === "search") {
    return section === "history" ? "?tab=search&section=history" : "?tab=search";
  }
  if (section) {
    return `?tab=${tab}&section=${section}`;
  }
  return `?tab=${tab}`;
}
