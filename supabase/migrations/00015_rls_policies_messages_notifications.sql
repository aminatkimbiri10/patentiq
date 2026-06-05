-- =============================================================================
-- MESSAGES
-- =============================================================================
CREATE POLICY "messages_select"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR (
      project_id IS NOT NULL
      AND public.can_view_project(project_id)
    )
    OR public.is_admin()
  );

CREATE POLICY "messages_insert"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      (recipient_id IS NOT NULL AND recipient_id <> auth.uid())
      OR (project_id IS NOT NULL AND public.can_view_project(project_id))
    )
  );

CREATE POLICY "messages_update_read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid() OR sender_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid() OR sender_id = auth.uid());

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      -- Membres du projet peuvent notifier d'autres membres (workflow simplifié)
      project_id IS NOT NULL
      AND public.can_view_project(project_id)
    )
  );

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
