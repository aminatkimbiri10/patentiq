"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bot,
  Loader2,
  MessageSquarePlus,
  Minus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AiFormattedText } from "@/components/shared/ai-formatted-text";
import { AiRagHint } from "@/components/ai/ai-analysis-meta";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

const QUICK_REPLIES = [
  "Quelles étapes avant un dépôt ?",
  "Comment faire une recherche d'antériorité ?",
  "Brevet ou secret industriel ?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border/60 bg-background px-4 py-3 shadow-sm">
      <span className="chat-typing-dot h-2 w-2 rounded-full bg-muted-foreground/70" />
      <span className="chat-typing-dot h-2 w-2 rounded-full bg-muted-foreground/70" />
      <span className="chat-typing-dot h-2 w-2 rounded-full bg-muted-foreground/70" />
    </div>
  );
}

function AssistantAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-primary-foreground shadow-sm",
        className
      )}
    >
      <Bot className="h-4 w-4" />
    </div>
  );
}

export function AiAssistantChat({
  projectId,
  providerLabel,
  variant = "embedded",
  enabled = true,
  onClose,
}: {
  projectId: string;
  providerLabel?: string;
  variant?: "embedded" | "floating";
  enabled?: boolean;
  onClose?: () => void;
}) {
  const isFloating = variant === "floating";
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const loadChat = useCallback(async () => {
    setBootstrapping(true);
    try {
      const res = await fetch(`/api/ai/chat?projectId=${projectId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur chargement");
      setSessionId(data.session?.id ?? null);
      setMessages(data.messages ?? []);
      setHasLoaded(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de charger le chat");
    } finally {
      setBootstrapping(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (enabled && !hasLoaded) {
      void loadChat();
    }
  }, [enabled, hasLoaded, loadChat]);

  useEffect(() => {
    if (enabled && isFloating) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [enabled, isFloating]);

  useEffect(() => {
    if (messages.length || loading) scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  async function sendMessage(text?: string, newSession = false) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const optimisticUser: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    if (!text) setInput("");
    setMessages((prev) => [...prev, optimisticUser]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sessionId: newSession ? undefined : sessionId ?? undefined,
          message: content,
          newSession,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur envoi");

      setSessionId(data.sessionId);
      setHasLoaded(true);
      setMessages((prev) => {
        const withoutTmp = prev.filter((m) => m.id !== optimisticUser.id);
        return [
          ...withoutTmp,
          { ...optimisticUser, id: `user-${data.sessionId}-${withoutTmp.length}` },
          data.message as ChatMessage,
        ];
      });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      if (!text) setInput(content);
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function startNewConversation() {
    setSessionId(null);
    setMessages([]);
    setInput("");
    setHasLoaded(true);
    inputRef.current?.focus();
  }

  const isFirstMessage = !sessionId && messages.length === 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        !isFloating && "card-elevated"
      )}
    >
      {/* En-tête */}
      <div
        className={cn(
          "relative shrink-0 px-4 py-3.5",
          isFloating
            ? "bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-primary-foreground"
            : "border-b border-border/60"
        )}
      >
        <div className="flex items-center gap-3">
          <AssistantAvatar
            className={cn(isFloating && "ring-2 ring-primary-foreground/25")}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn("truncate text-sm font-semibold", !isFloating && "text-foreground")}>
                Assistant PI
              </p>
              {isFloating && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  En ligne
                </span>
              )}
            </div>
            <p
              className={cn(
                "truncate text-xs",
                isFloating ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {isFloating
                ? "Conseils généraux — pas avis juridique"
                : providerLabel ?? "Conseils généraux (pas avis juridique)"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isFloating
                  ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  : ""
              )}
              onClick={startNewConversation}
              disabled={loading || (!messages.length && !sessionId)}
              title="Nouvelle conversation"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  isFloating
                    ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                    : ""
                )}
                onClick={onClose}
                title={isFloating ? "Réduire" : "Fermer"}
              >
                {isFloating ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 scrollbar-thin",
          isFloating
            ? "bg-gradient-to-b from-muted/30 to-muted/10"
            : "max-h-[min(28rem,50vh)] min-h-[14rem] bg-muted/10"
        )}
      >
        {!enabled || bootstrapping ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement de la conversation…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex gap-2.5">
              <AssistantAvatar />
              <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border/50 bg-background px-3.5 py-3 shadow-sm">
                <p className="text-sm leading-relaxed text-foreground">
                  Bonjour ! Je peux vous aider sur les étapes de dépôt, la recherche
                  d&apos;antériorité ou le choix du type de protection.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-10">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(q, isFirstMessage)}
                  className="rounded-full border border-primary/25 bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
              >
                {!isUser && <AssistantAvatar className="mt-0.5" />}
                <div
                  className={cn(
                    "max-w-[82%]",
                    isUser ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3.5 py-2.5",
                      isUser
                        ? "rounded-2xl rounded-br-md bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-primary-foreground shadow-md shadow-primary/20"
                        : "rounded-2xl rounded-tl-md border border-border/50 bg-background shadow-sm"
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    ) : (
                      <AiFormattedText
                        text={m.content}
                        className="text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground"
                      />
                    )}
                  </div>
                  <time className="mt-1 block px-1 text-[10px] text-muted-foreground/80">
                    {formatDistanceToNow(new Date(m.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}
        {loading && (
          <div className="flex gap-2.5">
            <AssistantAvatar className="mt-0.5" />
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div
        className={cn(
          "shrink-0 border-t border-border/60 bg-background px-4 py-3",
          isFloating && "shadow-[0_-4px_20px_hsl(210_40%_10%_/_0.04)]"
        )}
      >
        <form
          className="flex items-end gap-2 rounded-2xl border border-border/80 bg-muted/30 p-1.5 pl-3 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(undefined, isFirstMessage);
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Écrivez votre message…"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(undefined, isFirstMessage);
              }
            }}
            className="max-h-24 min-h-[2.25rem] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/70"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="h-9 w-9 shrink-0 rounded-xl shadow-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="mt-2 space-y-1">
          <AiRagHint />
          {isFloating && (
            <p className="text-center text-[10px] text-muted-foreground/70">
              <Sparkles className="mr-1 inline h-3 w-3" />
              IA indicative — consultez un CPI pour tout avis juridique
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
