-- =============================================================================
-- AI SEARCHES (IA-ready — pas d'appel externe côté DB)
-- =============================================================================
CREATE TABLE public.ai_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  search_type public.ai_search_type NOT NULL DEFAULT 'novelty',
  status public.ai_search_status NOT NULL DEFAULT 'pending',
  query TEXT,
  parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
  document_ids UUID[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_searches_project ON public.ai_searches (project_id, created_at DESC);
CREATE INDEX idx_ai_searches_status ON public.ai_searches (status);
CREATE INDEX idx_ai_searches_requested_by ON public.ai_searches (requested_by);

-- =============================================================================
-- AI RESULTS
-- =============================================================================
CREATE TABLE public.ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES public.ai_searches (id) ON DELETE CASCADE,
  result_type TEXT NOT NULL DEFAULT 'generic',
  title TEXT,
  summary TEXT,
  score NUMERIC(8, 4),
  rank INT,
  source_ref TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_results_search ON public.ai_results (search_id);
CREATE INDEX idx_ai_results_rank ON public.ai_results (search_id, rank);
