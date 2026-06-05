-- =============================================================================
-- TRIGGER: updated_at automatique
-- =============================================================================
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Appliquer sur toutes les tables avec updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'roles', 'settings', 'projects', 'project_members',
    'project_comments', 'project_tasks', 'documents', 'messages',
    'ai_searches', 'categories', 'tags'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION app.set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- =============================================================================
-- TRIGGER: création profil à l'inscription Supabase Auth
-- =============================================================================
CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION app.handle_new_user();

-- =============================================================================
-- TRIGGER: propriétaire automatique comme membre owner
-- =============================================================================
CREATE OR REPLACE FUNCTION app.add_project_owner_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.project_members (
    project_id, user_id, member_role, can_edit, can_comment, can_upload
  )
  VALUES (NEW.id, NEW.owner_id, 'owner', TRUE, TRUE, TRUE)
  ON CONFLICT (project_id, user_id) DO NOTHING;

  INSERT INTO public.project_updates (
    project_id, author_id, update_type, title, content
  )
  VALUES (NEW.id, NEW.owner_id, 'status_change', 'Projet créé', NEW.title);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_created_add_owner
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION app.add_project_owner_member();

-- =============================================================================
-- TRIGGER: last_activity_at sur projet
-- =============================================================================
CREATE OR REPLACE FUNCTION app.touch_project_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.project_id, OLD.project_id);
  IF pid IS NOT NULL THEN
    UPDATE public.projects SET last_activity_at = NOW() WHERE id = pid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER touch_project_on_comment
  AFTER INSERT ON public.project_comments
  FOR EACH ROW
  EXECUTE FUNCTION app.touch_project_activity();

CREATE TRIGGER touch_project_on_document
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION app.touch_project_activity();

CREATE TRIGGER touch_project_on_task
  AFTER INSERT OR UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION app.touch_project_activity();

-- =============================================================================
-- HELPERS RLS (SECURITY DEFINER, STABLE)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(p_role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.role_name = p_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.get_primary_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.role_name
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid()
    AND ur.is_primary = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = p_project_id
      AND pm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id AND p.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_cpi(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND (
        p.assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p_project_id
            AND pm.user_id = auth.uid()
            AND pm.member_role = 'cpi_advisor'
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_expert(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND (
        p.expert_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p_project_id
            AND pm.user_id = auth.uid()
            AND pm.member_role = 'expert'
        )
      )
  );
$$;

-- Accès lecture projet
CREATE OR REPLACE FUNCTION public.can_view_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.is_project_owner(p_project_id)
    OR public.is_project_member(p_project_id)
    OR public.is_project_cpi(p_project_id)
    OR public.is_project_expert(p_project_id);
$$;

-- Édition projet (owner, membre avec can_edit, admin)
CREATE OR REPLACE FUNCTION public.can_edit_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.is_project_owner(p_project_id)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = p_project_id
        AND pm.user_id = auth.uid()
        AND pm.can_edit = TRUE
    );
$$;

-- Upload documents
CREATE OR REPLACE FUNCTION public.can_upload_to_project(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.is_project_owner(p_project_id)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = p_project_id
        AND pm.user_id = auth.uid()
        AND pm.can_upload = TRUE
    )
    OR public.is_project_cpi(p_project_id)
    OR public.is_project_expert(p_project_id);
$$;

-- Audit log helper (appelé depuis Server Actions avec service role ou insert policy)
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_action public.audit_action,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    actor_id, action, entity_type, entity_id, project_id,
    old_data, new_data, metadata
  )
  VALUES (
    auth.uid(), p_action, p_entity_type, p_entity_id, p_project_id,
    p_old_data, p_new_data, p_metadata
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Référence projet auto-générée
CREATE OR REPLACE FUNCTION app.generate_project_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := 'PRJ-' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_project_reference
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION app.generate_project_reference();

-- Grant execute on helpers to authenticated
GRANT USAGE ON SCHEMA app TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_project(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_project(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_upload_to_project(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.write_audit_log(
  public.audit_action, TEXT, UUID, UUID, JSONB, JSONB, JSONB
) TO authenticated;
