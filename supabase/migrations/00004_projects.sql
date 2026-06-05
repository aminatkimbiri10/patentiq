-- =============================================================================
-- PROJECTS
-- =============================================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  invention_summary TEXT,
  need_description TEXT,
  status public.project_status NOT NULL DEFAULT 'draft',
  visibility public.project_visibility NOT NULL DEFAULT 'private',
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  expert_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  category_id UUID,
  reference_code TEXT UNIQUE,
  due_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON public.projects (owner_id);
CREATE INDEX idx_projects_assigned_to ON public.projects (assigned_to);
CREATE INDEX idx_projects_expert_id ON public.projects (expert_id);
CREATE INDEX idx_projects_status ON public.projects (status);
CREATE INDEX idx_projects_last_activity ON public.projects (last_activity_at DESC);

-- =============================================================================
-- PROJECT MEMBERS
-- =============================================================================
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  member_role public.project_member_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_comment BOOLEAN NOT NULL DEFAULT TRUE,
  can_upload BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project ON public.project_members (project_id);
CREATE INDEX idx_project_members_user ON public.project_members (user_id);

-- =============================================================================
-- PROJECT UPDATES (timeline / activité)
-- =============================================================================
CREATE TABLE public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  update_type public.update_type NOT NULL DEFAULT 'system',
  title TEXT,
  content TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_updates_project ON public.project_updates (project_id, created_at DESC);

-- =============================================================================
-- PROJECT COMMENTS
-- =============================================================================
CREATE TABLE public.project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.project_comments (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_legal BOOLEAN NOT NULL DEFAULT FALSE,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_comments_project ON public.project_comments (project_id, created_at DESC);
CREATE INDEX idx_project_comments_parent ON public.project_comments (parent_id);

-- =============================================================================
-- PROJECT TASKS
-- =============================================================================
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'pending',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_tasks_project ON public.project_tasks (project_id);
CREATE INDEX idx_project_tasks_assigned ON public.project_tasks (assigned_to);
CREATE INDEX idx_project_tasks_status ON public.project_tasks (status);
