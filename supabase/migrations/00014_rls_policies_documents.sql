-- =============================================================================
-- DOCUMENTS
-- =============================================================================
CREATE POLICY "documents_select"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    public.can_view_project(project_id)
    AND status <> 'deleted'
  );

CREATE POLICY "documents_insert"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND owner_id = auth.uid()
    AND public.can_upload_to_project(project_id)
  );

CREATE POLICY "documents_update"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    public.can_upload_to_project(project_id)
    OR owner_id = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (public.can_view_project(project_id));

CREATE POLICY "documents_delete"
  ON public.documents FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_project_owner(project_id)
    OR public.is_admin()
  );

-- =============================================================================
-- DOCUMENT_VERSIONS
-- =============================================================================
CREATE POLICY "document_versions_select"
  ON public.document_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_versions.document_id
        AND public.can_view_project(d.project_id)
    )
  );

CREATE POLICY "document_versions_insert"
  ON public.document_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_versions.document_id
        AND public.can_upload_to_project(d.project_id)
    )
  );
