-- =============================================================================
-- Assistant PI — conversations multi-tours
-- =============================================================================
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_sessions_project_user
  ON public.ai_chat_sessions (project_id, user_id, updated_at DESC);

CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_messages_session
  ON public.ai_chat_messages (session_id, created_at ASC);

CREATE TRIGGER set_ai_chat_sessions_updated_at
  BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_chat_sessions_select"
  ON public.ai_chat_sessions FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "ai_chat_sessions_insert"
  ON public.ai_chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_view_project(project_id)
    AND (
      public.is_project_owner(project_id)
      OR public.has_role('project_holder')
      OR public.can_edit_project(project_id)
    )
  );

CREATE POLICY "ai_chat_sessions_update"
  ON public.ai_chat_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_chat_messages_select"
  ON public.ai_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_chat_sessions s
      WHERE s.id = ai_chat_messages.session_id
        AND public.can_view_project(s.project_id)
    )
  );

CREATE POLICY "ai_chat_messages_insert"
  ON public.ai_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_chat_sessions s
      WHERE s.id = ai_chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );
