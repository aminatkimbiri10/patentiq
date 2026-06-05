-- =============================================================================
-- STORAGE POLICIES — project-documents
-- =============================================================================

CREATE POLICY "project_documents_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND public.storage_can_access_project_file(bucket_id, name)
  );

CREATE POLICY "project_documents_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents'
    AND public.storage_can_upload_project_file(bucket_id, name)
  );

CREATE POLICY "project_documents_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND public.storage_can_upload_project_file(bucket_id, name)
  )
  WITH CHECK (
    bucket_id = 'project-documents'
    AND public.storage_can_upload_project_file(bucket_id, name)
  );

CREATE POLICY "project_documents_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-documents'
    AND (
      public.is_admin()
      OR (
        split_part(name, '/', 2) = auth.uid()::TEXT
        AND public.can_upload_to_project(public.storage_project_id_from_path(name))
      )
      OR public.is_project_owner(public.storage_project_id_from_path(name))
    )
  );

-- =============================================================================
-- STORAGE POLICIES — avatars
-- =============================================================================

CREATE POLICY "avatars_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      split_part(name, '/', 1) = auth.uid()::TEXT
      OR public.is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.project_members pm1
        JOIN public.project_members pm2 ON pm2.project_id = pm1.project_id
        WHERE pm1.user_id = auth.uid()
          AND pm2.user_id::TEXT = split_part(name, '/', 1)
      )
    )
  );

CREATE POLICY "avatars_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND split_part(name, '/', 1) = auth.uid()::TEXT
  );

CREATE POLICY "avatars_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND split_part(name, '/', 1) = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND split_part(name, '/', 1) = auth.uid()::TEXT
  );

CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (
      split_part(name, '/', 1) = auth.uid()::TEXT
      OR public.is_admin()
    )
  );
