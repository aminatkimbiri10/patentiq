/** Lien mailto fiable (encodage + domaine en minuscules pour les clients mail). */
export function mailtoHref(
  email: string,
  options?: { subject?: string; body?: string }
): string {
  const address = email.trim().toLowerCase();
  const params = new URLSearchParams();
  if (options?.subject) params.set("subject", options.subject);
  if (options?.body) params.set("body", options.body);
  const qs = params.toString();
  return qs ? `mailto:${address}?${qs}` : `mailto:${address}`;
}
