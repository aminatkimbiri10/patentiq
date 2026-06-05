-- =============================================================================
-- DOCUMENTS
-- =============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL DEFAULT 'project-documents',
  mime_type TEXT,
  file_size BIGINT,
  status public.document_status NOT NULL DEFAULT 'uploading',
  version_number INT NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT TRUE,
  tags_cache TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_project ON public.documents (project_id);
CREATE INDEX idx_documents_owner ON public.documents (owner_id);
CREATE INDEX idx_documents_status ON public.documents (status);
CREATE INDEX idx_documents_latest ON public.documents (project_id, is_latest)
  WHERE is_latest = TRUE;

-- =============================================================================
-- DOCUMENT VERSIONS
-- =============================================================================
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL DEFAULT 'project-documents',
  mime_type TEXT,
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  change_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, version_number)
);

CREATE INDEX idx_document_versions_document ON public.document_versions (document_id);
