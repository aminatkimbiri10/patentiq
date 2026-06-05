-- =============================================================================
-- PROJECTS
-- =============================================================================
CREATE POLICY "projects_select"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.can_view_project(id));

CREATE POLICY "projects_insert_holder"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      public.has_role('project_holder')
      OR public.has_role('admin')
      OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "projects_update"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(id) OR public.is_project_cpi(id))
  WITH CHECK (public.can_edit_project(id) OR public.is_project_cpi(id) OR public.is_admin());

CREATE POLICY "projects_delete_owner_admin"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_project_owner(id) OR public.is_admin());

-- =============================================================================
-- PROJECT_MEMBERS
-- =============================================================================
CREATE POLICY "project_members_select"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "project_members_insert"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR public.is_project_owner(project_id)
    OR public.is_project_cpi(project_id)
  );

CREATE POLICY "project_members_update"
  ON public.project_members FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_project_owner(project_id)
    OR public.is_project_cpi(project_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.is_project_owner(project_id)
    OR public.is_project_cpi(project_id)
  );

CREATE POLICY "project_members_delete"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_project_owner(project_id)
    OR public.is_project_cpi(project_id)
  );

-- =============================================================================
-- PROJECT_UPDATES
-- =============================================================================
CREATE POLICY "project_updates_select"
  ON public.project_updates FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "project_updates_insert"
  ON public.project_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_view_project(project_id)
    AND (author_id = auth.uid() OR author_id IS NULL)
  );

-- =============================================================================
-- PROJECT_COMMENTS
-- =============================================================================
CREATE POLICY "project_comments_select"
  ON public.project_comments FOR SELECT
  TO authenticated
  USING (
    public.can_view_project(project_id)
    AND (
      is_internal = FALSE
      OR public.is_admin()
      OR public.is_project_cpi(project_id)
      OR public.is_project_expert(project_id)
      OR author_id = auth.uid()
    )
  );

CREATE POLICY "project_comments_insert"
  ON public.project_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.can_view_project(project_id)
    AND (
      EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = project_comments.project_id
          AND pm.user_id = auth.uid()
          AND pm.can_comment = TRUE
      )
      OR public.is_project_owner(project_id)
      OR public.is_project_cpi(project_id)
      OR public.is_project_expert(project_id)
      OR public.is_admin()
    )
  );

CREATE POLICY "project_comments_update_own"
  ON public.project_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR public.is_admin())
  WITH CHECK (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "project_comments_delete"
  ON public.project_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR public.is_admin());

-- =============================================================================
-- PROJECT_TASKS
-- =============================================================================
CREATE POLICY "project_tasks_select"
  ON public.project_tasks FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "project_tasks_insert"
  ON public.project_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.can_edit_project(project_id)
      OR public.is_project_cpi(project_id)
      OR public.is_project_expert(project_id)
    )
  );

CREATE POLICY "project_tasks_update"
  ON public.project_tasks FOR UPDATE
  TO authenticated
  USING (
    public.can_edit_project(project_id)
    OR assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    public.can_edit_project(project_id)
    OR assigned_to = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "project_tasks_delete"
  ON public.project_tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.can_edit_project(project_id)
    OR public.is_admin()
  );

-- =============================================================================
-- CATEGORIES & TAGS (lecture tous, écriture admin)
-- =============================================================================
CREATE POLICY "categories_select"
  ON public.categories FOR SELECT
  TO authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "categories_admin"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "tags_select"
  ON public.tags FOR SELECT
  TO authenticated
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "tags_admin"
  ON public.tags FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "project_tags_select"
  ON public.project_tags FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "project_tags_insert"
  ON public.project_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.can_edit_project(project_id));

CREATE POLICY "project_tags_delete"
  ON public.project_tags FOR DELETE
  TO authenticated
  USING (public.can_edit_project(project_id) OR public.is_admin());
