import type { AiSearch } from "@/types/database";

export type AiConfidenceLevel = "high" | "medium" | "low";

export function getAiSearchProviders(search: AiSearch): {
  patent?: string;
  synthesis?: string;
} {
  const meta = search.metadata as { providers?: { patent?: string; synthesis?: string } } | null;
  return meta?.providers ?? {};
}

export function getAiConfidenceLevel(search: AiSearch): AiConfidenceLevel {
  const providers = getAiSearchProviders(search);
  const synthesis = providers.synthesis ?? "";
  const patent = providers.patent ?? "";

  if (
    synthesis.includes("fallback") ||
    synthesis === "stub" ||
    synthesis === "template" ||
    patent.includes("stub")
  ) {
    return "low";
  }

  if (synthesis === "huggingface" && (patent.includes("epo") || patent.includes("ompic"))) {
    return "high";
  }

  if (search.status === "completed") return "medium";
  return "low";
}

export function formatAiConfidenceLabel(level: AiConfidenceLevel): string {
  switch (level) {
    case "high":
      return "Confiance élevée";
    case "medium":
      return "Confiance moyenne";
    default:
      return "Confiance limitée";
  }
}

export function formatSynthesisProviderLabel(provider?: string): string | null {
  if (!provider) return null;
  if (provider.includes("quota")) return "Quota HF — synthèse de secours";
  if (provider.includes("fallback") || provider === "template") return "Synthèse template";
  if (provider === "huggingface") return "Synthèse Hugging Face";
  if (provider === "stub") return "Mode démonstration";
  return null;
}

export type AiSourceLink = {
  label: string;
  href: string;
  kind: "espacenet" | "ompic" | "other";
};

export function extractSourceLinksFromPayload(payload: unknown): AiSourceLink[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  const links: AiSourceLink[] = [];

  if (typeof p.espacenet_url === "string") {
    links.push({ label: "Espacenet", href: p.espacenet_url, kind: "espacenet" });
  }
  if (typeof p.ompic_url === "string") {
    links.push({ label: "OMPIC", href: p.ompic_url, kind: "ompic" });
  }
  if (typeof p.source_url === "string") {
    links.push({ label: "Source", href: p.source_url, kind: "other" });
  }

  return links;
}
