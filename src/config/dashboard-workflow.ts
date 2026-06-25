import type { ProjectStatus } from "@/types/database";
import { PROJECT_STATUS_LABELS } from "@/config/constants";

/** Étapes du parcours PI affichées sur le tableau de bord */
export const WORKFLOW_STAGES: { id: ProjectStatus | "idea"; label: string }[] = [
  { id: "draft", label: "Idée & brouillon" },
  { id: "submitted", label: "Soumission" },
  { id: "in_review", label: "Revue initiale" },
  { id: "awaiting_documents", label: "Documents" },
  { id: "expert_review", label: "Revue expert" },
  { id: "cpi_review", label: "Décision CPI" },
  { id: "approved", label: "Déploiement" },
];

const STAGE_ORDER: (ProjectStatus | "idea")[] = WORKFLOW_STAGES.map((s) => s.id);

const STATUS_INDEX: Record<string, number> = Object.fromEntries(
  STAGE_ORDER.map((id, i) => [id, i])
);

STATUS_INDEX.rejected = STAGE_ORDER.length - 1;
STATUS_INDEX.closed = STAGE_ORDER.length - 1;

export function workflowProgressForStatus(status: ProjectStatus): number {
  const idx = STATUS_INDEX[status] ?? 0;
  if (status === "rejected" || status === "closed") return 100;
  return Math.round((idx / (STAGE_ORDER.length - 1)) * 100);
}

export function workflowStageIndex(status: ProjectStatus): number {
  return STATUS_INDEX[status] ?? 0;
}

const RECOMMENDATIONS: Partial<Record<ProjectStatus, string>> = {
  draft: "Complétez la checklist et soumettez le dossier à votre conseiller CPI.",
  submitted: "Votre dossier est en file d'attente — le CPI va le prendre en charge.",
  in_review: "Répondez aux demandes du CPI et mettez à jour les documents si nécessaire.",
  awaiting_documents: "Des pièces manquent — consultez la checklist et uploadez les fichiers requis.",
  expert_review: "Un expert analyse le dossier — vous serez notifié dès l'avis disponible.",
  cpi_review: "Décision CPI en cours — préparez les éléments de réponse si sollicité.",
  approved: "Dossier approuvé — planifiez le dépôt OMPIC et la surveillance post-enregistrement.",
  rejected: "Consultez les motifs de rejet et les prochaines étapes avec votre CPI.",
  closed: "Dossier clôturé — archivez les documents et consultez l'historique.",
};

export function workflowRecommendation(status: ProjectStatus, role: "holder" | "cpi" | "expert" | "admin"): string {
  if (role === "cpi" && status === "cpi_review") {
    return "Décision requise — validez ou demandez des compléments au porteur.";
  }
  if (role === "expert" && status === "expert_review") {
    return "Analyse attendue — rédigez votre avis structuré pour le CPI.";
  }
  if (role === "cpi" && status === "expert_review") {
    return "Expert en cours de revue — suivez l'avancement et relancez si nécessaire.";
  }
  return RECOMMENDATIONS[status] ?? "Consultez le dossier pour connaître la prochaine action.";
}

export function statusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}
