export type IpAssetType = "trademark" | "patent" | "design";

export type TechWatchKind = "patent" | "design";

export type IpAlertStatus = "new" | "acknowledged" | "opposition_filed" | "dismissed";

export interface IpWatchlist {
  id: string;
  project_id: string | null;
  owner_id: string;
  asset_type: IpAssetType;
  title: string;
  registration_number: string | null;
  nice_classes: string | null;
  summary: string | null;
  logo_url: string | null;
  registered_at: string | null;
  territory: string;
  surveillance_active: boolean;
  last_scan_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IpWatchAlert {
  id: string;
  watchlist_id: string;
  similarity_score: number | null;
  matched_title: string;
  matched_source: string;
  matched_ref: string | null;
  summary: string | null;
  status: IpAlertStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PatentClaimsDraftRow {
  id: string;
  project_id: string;
  independent_claim: string | null;
  dependent_claims: string[];
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const IP_ALERT_STATUS_LABELS: Record<IpAlertStatus, string> = {
  new: "Nouvelle",
  acknowledged: "Vu — à suivre",
  opposition_filed: "Opposition lancée",
  dismissed: "Faux positif",
};

/** Actions disponibles sur une alerte « nouvelle » */
export const IP_ALERT_ACTIONS: Record<
  Exclude<IpAlertStatus, "new">,
  { label: string; hint: string; variant: "outline" | "default" | "ghost" }
> = {
  acknowledged: {
    label: "Vu — à suivre",
    hint: "Notée, pas d'opposition pour l'instant",
    variant: "outline",
  },
  opposition_filed: {
    label: "Opposition lancée",
    hint: "Procédure OMPIC engagée par le CPI",
    variant: "default",
  },
  dismissed: {
    label: "Faux positif",
    hint: "Similarité sans conflit — archiver",
    variant: "ghost",
  },
};

export const IP_ASSET_TYPE_LABELS: Record<IpAssetType, string> = {
  trademark: "Marque",
  patent: "Brevet",
  design: "Dessin & modèle",
};

export const TECH_WATCH_KIND_LABELS: Record<TechWatchKind, string> = {
  patent: "Brevets (techno)",
  design: "Dessins & modèles",
};
