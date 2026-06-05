-- Rôles applicatifs (alignés avec la matrice produit)
CREATE TYPE public.app_role AS ENUM (
  'project_holder',
  'cpi_advisor',
  'expert',
  'admin'
);

CREATE TYPE public.project_status AS ENUM (
  'draft',
  'submitted',
  'in_review',
  'awaiting_documents',
  'expert_review',
  'cpi_review',
  'approved',
  'rejected',
  'closed'
);

CREATE TYPE public.project_visibility AS ENUM (
  'private',
  'team',
  'internal'
);

CREATE TYPE public.project_member_role AS ENUM (
  'owner',
  'cpi_advisor',
  'expert',
  'viewer'
);

CREATE TYPE public.document_status AS ENUM (
  'uploading',
  'active',
  'archived',
  'deleted'
);

CREATE TYPE public.task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE public.task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE public.notification_type AS ENUM (
  'info',
  'warning',
  'action_required',
  'success',
  'error'
);

CREATE TYPE public.message_type AS ENUM (
  'direct',
  'project_thread',
  'system'
);

CREATE TYPE public.ai_search_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE public.ai_search_type AS ENUM (
  'novelty',
  'semantic',
  'similarity',
  'summarization',
  'classification',
  'tag_suggestion',
  'assistant',
  'report'
);

CREATE TYPE public.audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'upload',
  'download',
  'assign',
  'validate',
  'reject',
  'comment',
  'search',
  'settings_change'
);

CREATE TYPE public.update_type AS ENUM (
  'status_change',
  'assignment',
  'document',
  'comment',
  'task',
  'ai_search',
  'validation',
  'system'
);
