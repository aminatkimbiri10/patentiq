export type ProjectMainTab = "overview" | "documents" | "parcours" | "echanges" | "search";

export type EchangesSection = "comments" | "messages" | "tasks";
export type SearchSection = "new" | "history";

const MAIN_TABS = new Set<ProjectMainTab>([
  "overview",
  "documents",
  "parcours",
  "echanges",
  "search",
]);

const PI_LEGACY_SECTIONS = new Set([
  "redaction",
  "revendications",
  "marque-cycle",
  "brevet-cycle",
  "parcours-pi",
  "parcours",
  "denomination",
  "irregularite",
]);

const LEGACY_TAB_MAP: Record<string, { tab: ProjectMainTab; section?: string }> = {
  dossier: { tab: "overview" },
  overview: { tab: "overview" },
  documents: { tab: "documents" },
  "parcours-pi": { tab: "parcours" },
  parcours: { tab: "parcours" },
  revendications: { tab: "parcours", section: "revendications" },
  redaction: { tab: "parcours", section: "redaction" },
  "marque-cycle": { tab: "parcours", section: "cycle" },
  "brevet-cycle": { tab: "parcours", section: "cycle" },
  checklist: { tab: "overview" },
  comments: { tab: "echanges", section: "comments" },
  messages: { tab: "echanges", section: "messages" },
  tasks: { tab: "echanges", section: "tasks" },
  echanges: { tab: "echanges", section: "comments" },
  search: { tab: "search" },
  ia: { tab: "search" },
  activity: { tab: "overview" },
  valorisation: { tab: "parcours" },
};

export function resolveProjectTab(
  tabParam: string | null,
  sectionParam?: string | null
): {
  tab: ProjectMainTab;
  echangesSection: EchangesSection;
  searchSection: SearchSection;
  piSection: string | null;
} {
  if (!tabParam) {
    return {
      tab: "overview",
      echangesSection: "comments",
      searchSection: "new",
      piSection: null,
    };
  }

  const mapped = LEGACY_TAB_MAP[tabParam];
  if (mapped) {
    let tab = mapped.tab;
    if (tabParam === "dossier" && sectionParam) {
      if (sectionParam === "documents") tab = "documents";
      else if (sectionParam === "checklist") tab = "overview";
      else if (PI_LEGACY_SECTIONS.has(sectionParam) || sectionParam === "parcours-pi")
        tab = "parcours";
    }
    return {
      tab,
      echangesSection:
        tab === "echanges"
          ? (["comments", "messages", "tasks"].includes(sectionParam ?? mapped.section ?? "")
              ? ((sectionParam ?? mapped.section) as EchangesSection)
              : "comments")
          : "comments",
      searchSection: tab === "search" && sectionParam === "history" ? "history" : "new",
      piSection:
        tab === "parcours"
          ? sectionParam ?? mapped.section ?? null
          : sectionParam && PI_LEGACY_SECTIONS.has(sectionParam)
            ? sectionParam
            : null,
    };
  }

  if (MAIN_TABS.has(tabParam as ProjectMainTab)) {
    return {
      tab: tabParam as ProjectMainTab,
      echangesSection: (["comments", "messages", "tasks"].includes(sectionParam ?? "")
        ? sectionParam
        : "comments") as EchangesSection,
      searchSection: tabParam === "search" && sectionParam === "history" ? "history" : "new",
      piSection: tabParam === "parcours" ? (sectionParam ?? null) : null,
    };
  }

  return {
    tab: "overview",
    echangesSection: "comments",
    searchSection: "new",
    piSection: null,
  };
}

export function projectTabQuery(
  tab: ProjectMainTab,
  section?: EchangesSection | SearchSection | string
): string {
  if (tab === "search") {
    return section === "history" ? "?tab=search&section=history" : "?tab=search";
  }
  if (section) {
    return `?tab=${tab}&section=${section}`;
  }
  return `?tab=${tab}`;
}

/** @deprecated utiliser ProjectMainTab */
export type DossierSection = "documents" | "checklist" | "parcours-pi";
