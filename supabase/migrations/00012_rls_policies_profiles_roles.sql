-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_select_project_collaborators"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_members pm1
      JOIN public.project_members pm2 ON pm2.project_id = pm1.project_id
      WHERE pm1.user_id = auth.uid()
        AND pm2.user_id = profiles.id
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Insert géré par trigger handle_new_user (service definer)
CREATE POLICY "profiles_insert_service"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =============================================================================
-- ROLES (lecture pour tous authentifiés, écriture admin)
-- =============================================================================
CREATE POLICY "roles_select_authenticated"
  ON public.roles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "roles_admin_all"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- USER_ROLES
-- =============================================================================
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_admin_insert"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_update"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Permettre à l'utilisateur de définir son rôle primaire à l'onboarding (une fois)
CREATE POLICY "user_roles_self_onboarding_insert"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
    )
  );

CREATE POLICY "user_roles_self_onboarding_update_primary"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- SETTINGS
-- =============================================================================
CREATE POLICY "settings_select_public_or_admin"
  ON public.settings FOR SELECT
  TO authenticated
  USING (is_public = TRUE OR public.is_admin());

CREATE POLICY "settings_admin_write"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Lecture settings publics pour anon (landing) — optionnel
CREATE POLICY "settings_select_public_anon"
  ON public.settings FOR SELECT
  TO anon
  USING (is_public = TRUE);
