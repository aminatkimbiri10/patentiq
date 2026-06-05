-- =============================================================================
-- BUCKETS STORAGE (privés)
-- Convention chemins:
--   project-documents: {project_id}/{user_id}/{filename}
--   avatars:           {user_id}/avatar.{ext}
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  FALSE,
  52428800, -- 50 Mo
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/csv',
    'application/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  FALSE,
  5242880, -- 5 Mo
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Helpers Storage (schéma storage)
CREATE OR REPLACE FUNCTION public.storage_project_id_from_path(p_path TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(p_path, '/', 1), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION public.storage_user_id_from_path(p_path TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(p_path, '/', 1), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION public.storage_can_access_project_file(p_bucket TEXT, p_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_bucket = 'project-documents'
    AND public.can_view_project(public.storage_project_id_from_path(p_path));
$$;

CREATE OR REPLACE FUNCTION public.storage_can_upload_project_file(p_bucket TEXT, p_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_bucket = 'project-documents'
    AND split_part(p_path, '/', 2) = auth.uid()::TEXT
    AND public.can_upload_to_project(public.storage_project_id_from_path(p_path));
$$;

GRANT EXECUTE ON FUNCTION public.storage_can_access_project_file(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.storage_can_upload_project_file(TEXT, TEXT) TO authenticated;
