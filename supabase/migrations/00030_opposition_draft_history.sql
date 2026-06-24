-- Historique versions rédaction brevet + fiche opposition sur alertes

CREATE TABLE public.patent_draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  draft_id UUID REFERENCES public.patent_drafts (id) ON DELETE SET NULL,
  title TEXT,
  technical_field TEXT,
  background TEXT,
  description TEXT,
  abstract TEXT,
  saved_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patent_draft_versions_project ON public.patent_draft_versions (project_id, created_at DESC);

ALTER TABLE public.patent_draft_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patent_draft_versions_select"
  ON public.patent_draft_versions FOR SELECT
  TO authenticated
  USING (public.can_view_project (project_id));

CREATE POLICY "patent_draft_versions_insert"
  ON public.patent_draft_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  );

-- Fiche opposition (métadonnées structurées sur alerte marque)
COMMENT ON COLUMN public.ip_watch_alerts.metadata IS
  'JSON: publication_end_at, opposition_eligible, opposition: { notes, deadline_at, status, filed_at }';
