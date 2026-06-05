-- =============================================================================
-- AI_SEARCHES
-- =============================================================================
CREATE POLICY "ai_searches_select"
  ON public.ai_searches FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "ai_searches_insert"
  ON public.ai_searches FOR INSERT
  TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND public.can_view_project(project_id)
    AND (
      public.is_project_owner(project_id)
      OR public.has_role('project_holder')
      OR public.can_edit_project(project_id)
    )
  );

CREATE POLICY "ai_searches_update"
  ON public.ai_searches FOR UPDATE
  TO authenticated
  USING (
    requested_by = auth.uid()
    OR public.is_admin()
    OR public.is_project_cpi(project_id)
  )
  WITH CHECK (public.can_view_project(project_id));

-- =============================================================================
-- AI_RESULTS
-- =============================================================================
CREATE POLICY "ai_results_select"
  ON public.ai_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_searches s
      WHERE s.id = ai_results.search_id
        AND public.can_view_project(s.project_id)
    )
  );

CREATE POLICY "ai_results_insert"
  ON public.ai_results FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ai_searches s
      WHERE s.id = ai_results.search_id
        AND s.requested_by = auth.uid()
    )
  );

-- Service role / workers IA inséreront via service_role (bypass RLS)

-- =============================================================================
-- AUDIT_LOGS
-- =============================================================================
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "audit_logs_select_own_actor"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid());

CREATE POLICY "audit_logs_select_project"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    project_id IS NOT NULL
    AND public.can_view_project(project_id)
    AND public.is_project_cpi(project_id)
  );

CREATE POLICY "audit_logs_insert"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);
