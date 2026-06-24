export type ChecklistItem = {
  id: string;
  label: string;
  hint?: string;
};

export type ChecklistTemplate = {
  slug: string;
  title: string;
  description: string;
  items: ChecklistItem[];
};

const BREVET: ChecklistItem[] = [
  { id: "desc-technique", label: "Description technique complète", hint: "Problème, solution, effet technique" },
  { id: "figures", label: "Figures / schémas annotés" },
  { id: "revendications", label: "Ébauche de revendications", hint: "Parcours PI → Revendications (confidentiel) + export dossier OMPIC." },
  { id: "anteriorite", label: "Recherche d'antériorité documentée", hint: "Lancez une analyse « Nouveauté » (IA) puis téléchargez le rapport PDF — le CPI valide." },
  { id: "ipc", label: "Classes IPC / CPC identifiées" },
  { id: "territoires", label: "Territoires de dépôt définis" },
  { id: "budget", label: "Budget et calendrier validés" },
  { id: "inventeurs", label: "Liste des inventeurs et ayants droit" },
];

const MODELE_UTILITE: ChecklistItem[] = [
  { id: "desc-technique", label: "Description de l'innovation technique" },
  { id: "figures", label: "Représentations graphiques" },
  { id: "nouveaute", label: "Argument de nouveauté industrielle" },
  { id: "anteriorite", label: "Recherche d'antériorité", hint: "Analyse IA Nouveauté + rapport archivé dans l'historique du dossier." },
  { id: "territoires", label: "Pays cibles (durée 10 ans max.)" },
];

const MARQUE: ChecklistItem[] = [
  { id: "signe", label: "Signe / logo / dénomination finalisés" },
  { id: "classes-nice", label: "Classes de Nice sélectionnées" },
  { id: "anteriorite-marque", label: "Recherche d'antériorité marques", hint: "Analyse IA + OMPIC live (search.ompic.ma) — classes Nice documentées." },
  { id: "surveillance-portefeuille", label: "Surveillance post-dépôt activée", hint: "Ajoutez la marque au portefeuille (onglet Surveillance) — scans OMPIC hebdomadaires." },
  { id: "usage", label: "Usage réel ou projet d'usage documenté" },
  { id: "territoires", label: "Territoires de protection" },
  { id: "mandataire", label: "Mandataire / représentant désigné" },
];

const DESSIN_MODELE: ChecklistItem[] = [
  { id: "representations", label: "Vues du produit (face, profil, perspective)" },
  { id: "nouveaute-apparence", label: "Caractère distinctif de l'apparence" },
  { id: "anteriorite-design", label: "Recherche designs antérieurs", hint: "Analyse IA Similarité + recherche visuelle documentée." },
  { id: "surveillance-portefeuille", label: "Surveillance post-dépôt activée", hint: "Ajoutez le dessin au portefeuille (Surveillance) — scans EPO hebdomadaires." },
  { id: "produit", label: "Lien avec le produit / article défini" },
  { id: "territoires", label: "Territoires de dépôt" },
];

const SECRET: ChecklistItem[] = [
  { id: "inventaire", label: "Inventaire des informations confidentielles" },
  { id: "nda", label: "Accords de confidentialité (NDA) signés" },
  { id: "acces", label: "Contrôle des accès et traçabilité" },
  { id: "marquage", label: "Documents marqués « confidentiel »" },
  { id: "formation", label: "Sensibilisation des collaborateurs" },
];

const VEILLE: ChecklistItem[] = [
  { id: "perimetre", label: "Périmètre technique / produit défini" },
  { id: "mots-cles", label: "Mots-clés et classes IPC retenus" },
  { id: "bases", label: "Bases consultées (EPO, INPI, WIPO…)" },
  { id: "fto", label: "Analyse liberté d'exploitation (FTO)", hint: "Lancez l'analyse FTO (IA) — EPO + brevets MA (OMPIC via EPO)." },
  { id: "synthese", label: "Synthèse des risques et recommandations" },
];

const AUTRE: ChecklistItem[] = [
  { id: "besoin", label: "Besoin PI clairement formulé" },
  { id: "docs", label: "Documents de support rassemblés" },
  { id: "echeance", label: "Échéances et jalons identifiés" },
  { id: "interlocuteur", label: "Interlocuteur CPI / conseil identifié" },
];

export const CHECKLIST_TEMPLATES: Record<string, ChecklistTemplate> = {
  brevet: {
    slug: "brevet",
    title: "Checklist — Brevet d'invention",
    description: "Étapes clés avant dépôt et instruction d'un brevet.",
    items: BREVET,
  },
  "modele-utilite": {
    slug: "modele-utilite",
    title: "Checklist — Modèle d'utilité",
    description: "Protection par modèle d'utilité (innovation technique).",
    items: MODELE_UTILITE,
  },
  marque: {
    slug: "marque",
    title: "Checklist — Marque",
    description: "Dépôt et défense d'un signe distinctif.",
    items: MARQUE,
  },
  "dessin-modele": {
    slug: "dessin-modele",
    title: "Checklist — Dessin & modèle",
    description: "Protection de l'apparence d'un produit.",
    items: DESSIN_MODELE,
  },
  "secret-affaires": {
    slug: "secret-affaires",
    title: "Checklist — Secret d'affaires",
    description: "Mesures de protection du savoir-faire.",
    items: SECRET,
  },
  veille: {
    slug: "veille",
    title: "Checklist — Veille & liberté d'exploitation",
    description: "Recherche d'antériorité et analyse FTO.",
    items: VEILLE,
  },
  autre: {
    slug: "autre",
    title: "Checklist — Dossier PI",
    description: "Étapes générales pour tout type de besoin PI.",
    items: AUTRE,
  },
};

export function getChecklistTemplate(categorySlug: string | null | undefined): ChecklistTemplate {
  if (categorySlug && CHECKLIST_TEMPLATES[categorySlug]) {
    return CHECKLIST_TEMPLATES[categorySlug];
  }
  return CHECKLIST_TEMPLATES.autre;
}
