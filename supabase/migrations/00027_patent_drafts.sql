-- Rédaction brevet structurée (sections OMPIC)

CREATE TABLE public.patent_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects (id) ON DELETE CASCADE,
  title TEXT,
  technical_field TEXT,
  background TEXT,
  description TEXT,
  abstract TEXT,
  updated_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patent_drafts_project ON public.patent_drafts (project_id);

ALTER TABLE public.patent_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patent_drafts_select"
  ON public.patent_drafts FOR SELECT
  TO authenticated
  USING (public.can_view_project (project_id));

CREATE POLICY "patent_drafts_insert"
  ON public.patent_drafts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_edit_project (project_id)
    OR public.is_project_cpi (project_id)
    OR public.is_admin ()
  );

CREATE POLICY "patent_drafts_update"
  ON public.patent_drafts FOR UPDATE
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
