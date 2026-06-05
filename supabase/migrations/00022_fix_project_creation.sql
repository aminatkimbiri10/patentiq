-- Corrige la création de projet (RLS INSERT + RPC fiable)
-- Cause : la politique INSERT sur projects ne passait pas malgré has_role() = true

CREATE OR REPLACE FUNCTION public.can_create_project()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.role_name IN ('project_holder'::public.app_role, 'admin'::public.app_role)
  ) THEN
    RETURN TRUE;
  END IF;

  -- Onboarding sans rôle encore assigné
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_create_project() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_primary_role() TO authenticated;

DROP POLICY IF EXISTS "projects_insert_holder" ON public.projects;

CREATE POLICY "projects_insert_holder"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND public.can_create_project()
  );

CREATE OR REPLACE FUNCTION public.create_project(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_invention_summary TEXT DEFAULT NULL,
  p_need_description TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  IF NOT public.can_create_project() THEN
    RAISE EXCEPTION 'Votre rôle ne permet pas de créer un projet';
  END IF;

  INSERT INTO public.projects (
    title,
    description,
    invention_summary,
    need_description,
    category_id,
    owner_id,
    status
  )
  VALUES (
    p_title,
    p_description,
    p_invention_summary,
    p_need_description,
    p_category_id,
    v_uid,
    'draft'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_project(TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
