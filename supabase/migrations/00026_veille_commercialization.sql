-- Veille technologique + commercialisation

CREATE TYPE public.commercial_status AS ENUM (
  'not_exploited',
  'in_development',
  'in_negotiation',
  'licensed',
  'direct_exploitation'
);

CREATE TABLE public.project_commercialization (
  project_id UUID PRIMARY KEY REFERENCES public.projects (id) ON DELETE CASCADE,
  commercial_status public.commercial_status NOT NULL DEFAULT 'not_exploited',
  market_target TEXT,
  sector TEXT,
  trl_level SMALLINT,
  exploitation_notes TEXT,
  licensing_notes TEXT,
  updated_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ip_tech_watch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  keywords TEXT NOT NULL,
  ipc_classes TEXT,
  territory TEXT NOT NULL DEFAULT 'MA+EP',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_scan_at TIMESTAMPTZ,
  last_report_summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_tech_watch_owner ON public.ip_tech_watch (owner_id);
CREATE INDEX idx_ip_tech_watch_active ON public.ip_tech_watch (is_active) WHERE is_active = TRUE;

ALTER TABLE public.project_commercialization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_tech_watch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_commercialization_select"
  ON public.project_commercialization FOR SELECT
  TO authenticated
  USING (public.can_view_project (project_id));

CREATE POLICY "project_commercialization_upsert"
  ON public.project_commercialization FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  );

CREATE POLICY "project_commercialization_update"
  ON public.project_commercialization FOR UPDATE
  TO authenticated
  USING (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  );

CREATE POLICY "ip_tech_watch_select"
  ON public.ip_tech_watch FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_admin()
    OR (project_id IS NOT NULL AND public.can_view_project (project_id))
  );

CREATE POLICY "ip_tech_watch_insert"
  ON public.ip_tech_watch FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      project_id IS NULL
      OR public.can_edit_project (project_id)
      OR public.is_project_cpi (project_id)
    )
  );

CREATE POLICY "ip_tech_watch_update"
  ON public.ip_tech_watch FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_project_cpi (project_id) OR public.is_admin ());

CREATE POLICY "ip_tech_watch_delete"
  ON public.ip_tech_watch FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin ());
