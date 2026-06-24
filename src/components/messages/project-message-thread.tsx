"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import {
  sendProjectMessage,
  markMessagesRead,
  type MessageActionState,
  type ProjectMessage,
} from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";

function getInitials(name: string | null | undefined, email: string | undefined) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() ?? "?";
}

export function ProjectMessageThread({
  projectId,
  messages,
  currentUserId,
}: {
  projectId: string;
  messages: ProjectMessage[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(sendProjectMessage, {} as MessageActionState);

  useEffect(() => {
    void markMessagesRead(projectId).then(() => router.refresh());
  }, [projectId, router]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Message envoyé");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <div className="space-y-6">
      {messages.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun message"
          description="Posez une question à votre conseiller PI ou partagez une mise à jour sur le dossier."
          className="py-10"
        />
      ) : (
        <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
          {messages.map((m) => {
            const isOwn = m.sender_id === currentUserId;
            return (
              <li
                key={m.id}
                className={`flex gap-3 px-4 py-4 ${isOwn ? "bg-primary/5" : ""}`}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(m.profiles?.full_name, m.profiles?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {isOwn ? "Vous" : m.profiles?.full_name ?? m.profiles?.email ?? "—"}
                    </span>
                    <time className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(m.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </time>
                  </div>
                  <p className="mt-1 break-words whitespace-pre-wrap text-sm text-muted-foreground">
                    {m.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form action={formAction} className="card-elevated space-y-3 p-4">
        <input type="hidden" name="project_id" value={projectId} />
        <Textarea
          name="body"
          rows={3}
          required
          placeholder="Votre message au fil du dossier…"
        />
        <Button type="submit">Envoyer</Button>
      </form>
    </div>
  );
}
