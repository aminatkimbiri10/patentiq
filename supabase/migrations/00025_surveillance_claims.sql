-- Phase 2 : surveillance PI, alertes, revendications

CREATE TYPE public.ip_asset_type AS ENUM ('trademark', 'patent');

CREATE TYPE public.ip_alert_status AS ENUM (
  'new',
  'acknowledged',
  'opposition_filed',
  'dismissed'
);

-- Actifs enregistrés à surveiller (marques / brevets du client)
CREATE TABLE public.ip_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  asset_type public.ip_asset_type NOT NULL DEFAULT 'trademark',
  title TEXT NOT NULL,
  registration_number TEXT,
  nice_classes TEXT,
  summary TEXT,
  territory TEXT NOT NULL DEFAULT 'MA',
  surveillance_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_scan_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_watchlist_owner ON public.ip_watchlist (owner_id);
CREATE INDEX idx_ip_watchlist_project ON public.ip_watchlist (project_id);
CREATE INDEX idx_ip_watchlist_active ON public.ip_watchlist (surveillance_active)
  WHERE surveillance_active = TRUE;

-- Alertes de similarité (catalogue OMPIC / veille)
CREATE TABLE public.ip_watch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.ip_watchlist (id) ON DELETE CASCADE,
  similarity_score NUMERIC(5, 4),
  matched_title TEXT NOT NULL,
  matched_source TEXT NOT NULL DEFAULT 'ompic_stub',
  matched_ref TEXT,
  summary TEXT,
  status public.ip_alert_status NOT NULL DEFAULT 'new',
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_watch_alerts_watchlist ON public.ip_watch_alerts (watchlist_id, created_at DESC);
CREATE INDEX idx_ip_watch_alerts_status ON public.ip_watch_alerts (status)
  WHERE status = 'new';

-- Revendications brevet (confidentiel)
CREATE TABLE public.patent_claims_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects (id) ON DELETE CASCADE,
  independent_claim TEXT,
  dependent_claims JSONB NOT NULL DEFAULT '[]'::JSONB,
  updated_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patent_claims_project ON public.patent_claims_drafts (project_id);

-- RLS
ALTER TABLE public.ip_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_watch_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patent_claims_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ip_watchlist_select"
  ON public.ip_watchlist FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_admin()
    OR (project_id IS NOT NULL AND public.can_view_project (project_id))
  );

CREATE POLICY "ip_watchlist_insert"
  ON public.ip_watchlist FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      project_id IS NULL
      OR public.can_edit_project (project_id)
      OR public.is_project_cpi (project_id)
      OR public.is_admin ()
    )
  );

CREATE POLICY "ip_watchlist_update"
  ON public.ip_watchlist FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_admin()
    OR (project_id IS NOT NULL AND public.is_project_cpi (project_id))
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR public.is_admin()
    OR (project_id IS NOT NULL AND public.is_project_cpi (project_id))
  );

CREATE POLICY "ip_watchlist_delete"
  ON public.ip_watchlist FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_admin()
    OR (project_id IS NOT NULL AND public.is_project_cpi (project_id))
  );

CREATE POLICY "ip_watch_alerts_select"
  ON public.ip_watch_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.ip_watchlist w
      WHERE w.id = watchlist_id
        AND (
          w.owner_id = auth.uid()
          OR public.is_admin()
          OR (w.project_id IS NOT NULL AND public.can_view_project (w.project_id))
        )
    )
  );

CREATE POLICY "ip_watch_alerts_insert"
  ON public.ip_watch_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ip_watchlist w
      WHERE w.id = watchlist_id
        AND (
          w.owner_id = auth.uid()
          OR public.is_admin()
          OR (w.project_id IS NOT NULL AND public.is_project_cpi (w.project_id))
        )
    )
  );

CREATE POLICY "ip_watch_alerts_update"
  ON public.ip_watch_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.ip_watchlist w
      WHERE w.id = watchlist_id
        AND (
          w.owner_id = auth.uid()
          OR public.is_admin()
          OR (w.project_id IS NOT NULL AND public.is_project_cpi (w.project_id))
        )
    )
  );

CREATE POLICY "patent_claims_select"
  ON public.patent_claims_drafts FOR SELECT
  TO authenticated
  USING (public.can_view_project (project_id));

CREATE POLICY "patent_claims_insert"
  ON public.patent_claims_drafts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  );

CREATE POLICY "patent_claims_update"
  ON public.patent_claims_drafts FOR UPDATE
  TO authenticated
  USING (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  )
  WITH CHECK (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  );
