import { ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  extractSourceLinksFromPayload,
  formatAiConfidenceLabel,
  formatSynthesisProviderLabel,
  getAiConfidenceLevel,
  getAiSearchProviders,
} from "@/lib/ai/ai-analysis-meta";
import type { AiResult, AiSearch } from "@/types/database";

const confidenceVariant: Record<
  ReturnType<typeof getAiConfidenceLevel>,
  "success" | "secondary" | "outline"
> = {
  high: "success",
  medium: "secondary",
  low: "outline",
};

export function AiAnalysisMeta({ search }: { search: AiSearch }) {
  if (search.status !== "completed") return null;

  const confidence = getAiConfidenceLevel(search);
  const providers = getAiSearchProviders(search);
  const synthLabel = formatSynthesisProviderLabel(providers.synthesis);

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 bg-muted/10 px-4 py-2">
      <Badge variant={confidenceVariant[confidence]} className="text-[10px]">
        {formatAiConfidenceLabel(confidence)}
      </Badge>
      {synthLabel && (
        <Badge variant="outline" className="text-[10px] font-normal">
          {synthLabel}
        </Badge>
      )}
      {providers.patent && !providers.patent.includes("n/a") && (
        <Badge variant="outline" className="text-[10px] font-normal">
          Brevets : {providers.patent.replace(/-/g, " ")}
        </Badge>
      )}
    </div>
  );
}

export function AiResultSources({ result }: { result: AiResult }) {
  const links = extractSourceLinksFromPayload(result.payload);
  if (!links.length && !result.source_ref) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
      {result.source_ref && result.result_type !== "summary" && (
        <span className="font-mono text-primary">{result.source_ref}</span>
      )}
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary hover:underline"
        >
          {link.label}
          <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
}

export function AiRagHint() {
  return (
    <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      L&apos;assistant peut citer des extraits de vos documents (RAG par mots-clés).
    </p>
  );
}
