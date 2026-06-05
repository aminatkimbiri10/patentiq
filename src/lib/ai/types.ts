import type { AiSearchType } from "@/types/database";

export type AiProviderRequest = {
  searchId: string;
  projectId: string;
  type: AiSearchType;
  query?: string;
  documentIds?: string[];
  parameters?: Record<string, unknown>;
};

export type AiSearchResultItem = {
  result_type: string;
  title: string;
  summary: string;
  score: number;
  rank: number;
  source_ref: string;
  payload: Record<string, unknown>;
};

export type AiRunSearchResult = {
  summary: string;
  results: AiSearchResultItem[];
  providers: { patent: string; synthesis: string };
};

export type PatentHit = {
  source_ref: string;
  title: string;
  abstract?: string;
  publication_date?: string;
  applicants?: string[];
};

export type AiProviderResult = {
  results: Array<{
    result_type: string;
    title?: string;
    summary?: string;
    score?: number;
    rank?: number;
    source_ref?: string;
    payload?: Record<string, unknown>;
  }>;
};

export type AiProvider = {
  name: string;
  run(request: AiProviderRequest): Promise<AiProviderResult>;
};
