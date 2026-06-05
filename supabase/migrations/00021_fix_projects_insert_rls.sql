-- Corrige la création de projet : autoriser le rôle primaire project_holder/admin
-- (has_role seul pouvait échouer si is_primary ou jointure incohérente)

DROP POLICY IF EXISTS "projects_insert_holder" ON public.projects;

CREATE POLICY "projects_insert_holder"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      public.get_primary_role() IN ('project_holder', 'admin')
      OR public.has_role('project_holder')
      OR public.has_role('admin')
      OR NOT EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
      )
    )
  );
