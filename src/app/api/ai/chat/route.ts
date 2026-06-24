import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAssistantChatReply } from "@/lib/ai/run-assistant-chat";

async function assertProjectAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
) {
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  return null;
}

/** GET — dernière session + messages de l'utilisateur sur le projet */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const sessionId = searchParams.get("sessionId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const accessError = await assertProjectAccess(supabase, projectId);
  if (accessError) return accessError;

  let sessionQuery = supabase
    .from("ai_chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (sessionId) {
    sessionQuery = supabase
      .from("ai_chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("id", sessionId)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .limit(1);
  }

  const { data: sessions } = await sessionQuery;
  const session = sessions?.[0] ?? null;

  if (!session) {
    return NextResponse.json({ session: null, messages: [] });
  }

  const { data: messages } = await supabase
    .from("ai_chat_messages")
    .select("id, role, content, created_at, metadata")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ session, messages: messages ?? [] });
}

/** POST — envoyer un message et recevoir la réponse assistant (synchrone) */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, sessionId, message, newSession } = body as {
    projectId?: string;
    sessionId?: string;
    message?: string;
    newSession?: boolean;
  };

  if (!projectId || !message?.trim()) {
    return NextResponse.json({ error: "projectId et message requis" }, { status: 400 });
  }

  const accessError = await assertProjectAccess(supabase, projectId);
  if (accessError) return accessError;

  let activeSessionId = sessionId as string | undefined;

  if (newSession || !activeSessionId) {
    const { data: created, error: createError } = await supabase
      .from("ai_chat_sessions")
      .insert({
        project_id: projectId,
        user_id: user.id,
        title: message.trim().slice(0, 80),
      })
      .select("id")
      .single();

    if (createError || !created) {
      return NextResponse.json(
        { error: createError?.message ?? "Impossible de créer la session" },
        { status: 400 }
      );
    }
    activeSessionId = created.id;
  } else {
    const { data: existing } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("id", activeSessionId)
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }
  }

  const { error: userInsertError } = await supabase.from("ai_chat_messages").insert({
    session_id: activeSessionId,
    role: "user",
    content: message.trim(),
  });

  if (userInsertError) {
    return NextResponse.json({ error: userInsertError.message }, { status: 400 });
  }

  const { data: priorMessages } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("session_id", activeSessionId)
    .order("created_at", { ascending: true });

  const history = (priorMessages ?? [])
    .slice(0, -1)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const admin = createAdminClient();
  const reply = await generateAssistantChatReply(
    admin,
    projectId,
    history,
    message.trim()
  );

  const { data: assistantRow, error: assistantError } = await supabase
    .from("ai_chat_messages")
    .insert({
      session_id: activeSessionId,
      role: "assistant",
      content: reply.content,
      metadata: {
        synthesis: reply.synthesis,
        stub: reply.stub ?? false,
        llm_error: reply.llm_error ?? false,
      },
    })
    .select("id, role, content, created_at, metadata")
    .single();

  if (assistantError) {
    return NextResponse.json({ error: assistantError.message }, { status: 400 });
  }

  await supabase
    .from("ai_chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", activeSessionId);

  return NextResponse.json({
    sessionId: activeSessionId,
    message: assistantRow,
  });
}
