/**
 * Pré-examen de brevet — inspiré de la « boîte à outils procédures » de Questel,
 * adapté au pré-dépôt OMPIC. Le cœur (analyzeDraftHeuristics) est une fonction pure,
 * déterministe et testable ; l'IA n'est qu'un complément optionnel.
 */

export type DraftIssueSeverity = "blocker" | "warning" | "tip";

export type DraftIssue = {
  id: string;
  severity: DraftIssueSeverity;
  rule: string;
  message: string;
  suggestion: string;
};

export type DraftReviewInput = {
  title?: string | null;
  technical_field?: string | null;
  background?: string | null;
  description?: string | null;
  abstract?: string | null;
  independentClaim?: string | null;
  dependentClaims?: string[];
};

export type DraftReview = {
  score: number;
  level: "à retravailler" | "perfectible" | "solide";
  issues: DraftIssue[];
  counts: { blocker: number; warning: number; tip: number };
};

const SEVERITY_PENALTY: Record<DraftIssueSeverity, number> = {
  blocker: 30,
  warning: 12,
  tip: 5,
};

/** Termes vagues / non bornés problématiques dans des revendications. */
const VAGUE_TERMS = [
  "environ",
  "approximativement",
  "optimal",
  "idéalement",
  "etc",
  "et autres",
  "divers",
  "approprié",
  "appropriée",
  "si nécessaire",
  "le cas échéant",
  "et/ou similaire",
];

const TECHNICAL_EFFECT_HINTS = [
  "effet technique",
  "avantage",
  "permet de",
  "permet d'",
  "améliore",
  "réduit",
  "augmente",
  "optimise",
  "résout",
];

function text(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function wordCount(value: string): number {
  const t = text(value);
  return t ? t.split(/\s+/).length : 0;
}

function findVagueTerms(claimText: string): string[] {
  const lower = claimText.toLowerCase();
  return VAGUE_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-zà-ÿ])${escaped}([^a-zà-ÿ]|$)`, "i").test(lower);
  });
}

/** Vérification simplifiée de la base d'antériorité (« ledit X » sans « un X » avant). */
function findMissingAntecedents(claimText: string): string[] {
  const lower = claimText.toLowerCase();
  const refRegex = /\b(?:ledit|ladite|lesdits|lesdites)\s+([a-zà-ÿ]+)/gi;
  const missing = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = refRegex.exec(lower)) !== null) {
    const noun = match[1];
    const introduced = new RegExp(`\\b(?:un|une|des|le|la|les)\\s+${noun}\\b`).test(
      lower.slice(0, match.index)
    );
    if (!introduced) missing.add(noun);
  }
  return Array.from(missing);
}

/** Analyse déterministe (sans réseau) — base du pré-examen. */
export function analyzeDraftHeuristics(input: DraftReviewInput): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const independent = text(input.independentClaim);
  const dependents = (input.dependentClaims ?? []).map(text).filter(Boolean);
  const allClaims = [independent, ...dependents].filter(Boolean).join("\n");
  const abstract = text(input.abstract);
  const description = text(input.description);
  const background = text(input.background);

  if (!independent) {
    issues.push({
      id: "no-independent-claim",
      severity: "blocker",
      rule: "Revendication indépendante",
      message: "Aucune revendication indépendante n'est renseignée.",
      suggestion:
        "Rédigez au moins une revendication indépendante définissant le périmètre de protection.",
    });
  } else if (!/^\s*1\b|^\s*1\./.test(independent)) {
    issues.push({
      id: "claim-numbering",
      severity: "tip",
      rule: "Numérotation",
      message: "La revendication indépendante ne commence pas par « 1. ».",
      suggestion: "Numérotez les revendications (1, 2, 3…) comme attendu au dépôt.",
    });
  }

  if (allClaims) {
    const vague = findVagueTerms(allClaims);
    if (vague.length > 0) {
      issues.push({
        id: "vague-terms",
        severity: "warning",
        rule: "Termes non bornés",
        message: `Termes vagues détectés dans les revendications : ${vague.join(", ")}.`,
        suggestion:
          "Remplacez les termes imprécis par des valeurs ou des caractéristiques techniques mesurables.",
      });
    }

    const missing = findMissingAntecedents(allClaims);
    if (missing.length > 0) {
      issues.push({
        id: "antecedent-basis",
        severity: "tip",
        rule: "Base d'antériorité",
        message: `Référence « ledit/ladite » sans introduction préalable : ${missing.join(", ")}.`,
        suggestion:
          "Introduisez chaque élément (« un … ») avant d'y faire référence (« ledit … »).",
      });
    }
  }

  if (!abstract) {
    issues.push({
      id: "abstract-missing",
      severity: "warning",
      rule: "Abrégé",
      message: "L'abrégé est vide.",
      suggestion: "Rédigez un abrégé concis (≤ 150 mots) résumant l'invention.",
    });
  } else if (wordCount(abstract) > 150) {
    issues.push({
      id: "abstract-too-long",
      severity: "warning",
      rule: "Abrégé",
      message: `L'abrégé dépasse 150 mots (${wordCount(abstract)} mots).`,
      suggestion: "Raccourcissez l'abrégé à 150 mots maximum (recommandation OMPIC).",
    });
  }

  if (!description) {
    issues.push({
      id: "description-missing",
      severity: "warning",
      rule: "Description",
      message: "La description détaillée est vide.",
      suggestion: "Décrivez au moins un mode de réalisation de l'invention.",
    });
  } else if (wordCount(description) < 80) {
    issues.push({
      id: "description-short",
      severity: "tip",
      rule: "Description",
      message: "La description détaillée semble très courte.",
      suggestion: "Étoffez la description (modes de réalisation, variantes, exemples).",
    });
  }

  const effectCorpus = `${description}\n${background}`.toLowerCase();
  if (description && !TECHNICAL_EFFECT_HINTS.some((h) => effectCorpus.includes(h))) {
    issues.push({
      id: "no-technical-effect",
      severity: "tip",
      rule: "Effet technique",
      message: "Aucun effet technique ou avantage n'est explicitement énoncé.",
      suggestion:
        "Précisez l'effet technique / l'avantage par rapport à l'état de la technique (clé de l'activité inventive).",
    });
  }

  if (text(input.title).length > 200) {
    issues.push({
      id: "title-long",
      severity: "tip",
      rule: "Titre",
      message: "Le titre est très long.",
      suggestion: "Privilégiez un titre concis et technique.",
    });
  }

  return issues;
}

export function scoreDraftReview(issues: DraftIssue[]): DraftReview {
  const counts = { blocker: 0, warning: 0, tip: 0 };
  let penalty = 0;
  for (const issue of issues) {
    counts[issue.severity]++;
    penalty += SEVERITY_PENALTY[issue.severity];
  }
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const level: DraftReview["level"] =
    counts.blocker > 0 || score < 50 ? "à retravailler" : score < 80 ? "perfectible" : "solide";
  return { score, level, issues, counts };
}

/** Pré-examen complet (heuristique). Point d'entrée principal. */
export function reviewPatentDraft(input: DraftReviewInput): DraftReview {
  return scoreDraftReview(analyzeDraftHeuristics(input));
}
