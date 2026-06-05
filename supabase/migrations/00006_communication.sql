-- =============================================================================
-- MESSAGES
-- =============================================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
  message_type public.message_type NOT NULL DEFAULT 'direct',
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  parent_id UUID REFERENCES public.messages (id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT messages_recipient_or_project CHECK (
    recipient_id IS NOT NULL OR project_id IS NOT NULL
  )
);

CREATE INDEX idx_messages_sender ON public.messages (sender_id);
CREATE INDEX idx_messages_recipient ON public.messages (recipient_id);
CREATE INDEX idx_messages_project ON public.messages (project_id, created_at DESC);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects (id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id, is_read)
  WHERE is_read = FALSE;
