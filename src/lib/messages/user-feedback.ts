/** Libellés utilisateur (sans jargon technique worker/stub/mode interne). */

export function formatScanSourceLabel(mode: string): string {
  const m = mode.toLowerCase();
  if (m.includes("ompic") || m.includes("live")) return "base OMPIC";
  if (m.includes("epo")) return "base brevets EPO";
  if (m === "skipped") return "";
  if (m === "error") return "";
  return "recherche PI";
}

export function formatWatchlistScanMessage(
  newAlerts: number,
  mode: string,
  error?: string
): string {
  if (error) return error;

  const source = formatScanSourceLabel(mode);
  const via = source ? ` via ${source}` : "";

  if (newAlerts > 0) {
    return `Scan terminé${via} — ${newAlerts} nouvelle${newAlerts > 1 ? "s" : ""} alerte${newAlerts > 1 ? "s" : ""} créée${newAlerts > 1 ? "s" : ""}. Consultez l'onglet Alertes.`;
  }
  return `Scan terminé${via} — aucune nouvelle similarité détectée pour cet actif.`;
}

export function formatAlertStatusMessage(status: string): string {
  switch (status) {
    case "acknowledged":
      return "Alerte marquée comme vue — à suivre.";
    case "opposition_filed":
      return "Opposition enregistrée dans le dossier.";
    case "dismissed":
      return "Alerte classée comme faux positif.";
    default:
      return "Alerte mise à jour.";
  }
}

export function formatAiSearchCompleteMessage(
  status: string,
  resultsCount: number,
  errorMessage?: string | null
): string | null {
  if (status === "completed") {
    return resultsCount > 0
      ? `Analyse terminée — ${resultsCount} résultat${resultsCount > 1 ? "s" : ""} disponible${resultsCount > 1 ? "s" : ""}.`
      : "Analyse terminée — aucun document d'antériorité trouvé.";
  }
  if (status === "failed") {
    return errorMessage
      ? `Analyse échouée : ${errorMessage.slice(0, 120)}`
      : "Analyse échouée — réessayez ou contactez votre CPI.";
  }
  return null;
}
