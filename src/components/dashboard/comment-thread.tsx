"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Scale } from "lucide-react";
import { addComment } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils/cn";

export type CommentWithAuthor = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  is_legal?: boolean;
  profiles?: { full_name: string | null; email: string } | null;
};

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

export function CommentThread({
  projectId,
  comments,
  canPostLegal = false,
  legalOnly = false,
}: {
  projectId: string;
  comments: CommentWithAuthor[];
  canPostLegal?: boolean;
  legalOnly?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "legal">(legalOnly ? "legal" : "all");
  const [isLegal, setIsLegal] = useState(legalOnly);

  const filtered =
    filter === "legal" ? comments.filter((c) => c.is_legal) : comments;

  const legalCount = comments.filter((c) => c.is_legal).length;

  return (
    <div className="space-y-6">
      {(canPostLegal || legalCount > 0) && !legalOnly && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Tous ({comments.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filter === "legal" ? "default" : "outline"}
            onClick={() => setFilter("legal")}
          >
            <Scale className="mr-1 h-3.5 w-3.5" />
            Juridiques ({legalCount})
          </Button>
        </div>
      )}

      <form action={addComment} className="card-elevated space-y-4 p-5">
        <input type="hidden" name="project_id" value={projectId} />
        {legalOnly && <input type="hidden" name="is_legal" value="true" />}
        <Textarea
          name="body"
          placeholder={
            isLegal || legalOnly
              ? "Commentaire juridique CPI — revue, antériorité, stratégie de dépôt…"
              : "Ajouter un commentaire…"
          }
          rows={3}
          required
          className="resize-none"
        />
        {canPostLegal && !legalOnly && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_legal"
              checked={isLegal}
              onCheckedChange={(v) => setIsLegal(v === true)}
            />
            <Label htmlFor="is_legal" className="cursor-pointer text-sm font-normal">
              Commentaire juridique (visible comme avis CPI)
            </Label>
            {isLegal && <input type="hidden" name="is_legal" value="true" />}
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            {isLegal || legalOnly ? "Publier l'avis juridique" : "Publier"}
          </Button>
        </div>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          icon={filter === "legal" ? Scale : MessageSquare}
          title={filter === "legal" ? "Aucun avis juridique" : "Aucun commentaire"}
          description={
            filter === "legal"
              ? "Les commentaires juridiques CPI apparaîtront ici."
              : "Lancez la discussion avec votre CPI ou expert."
          }
          className="py-12"
        />
      ) : (
        <ul className="space-y-4">
          {filtered.map((c) => {
            const authorName = c.profiles?.full_name ?? c.profiles?.email ?? "Utilisateur";
            return (
              <li
                key={c.id}
                className={cn(
                  "card-elevated flex gap-4 p-5",
                  c.is_legal && "border-primary/30 bg-primary/[0.03]"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold",
                      c.is_legal ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"
                    )}
                  >
                    {getInitials(c.profiles?.full_name, c.profiles?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{authorName}</span>
                      {c.is_legal && (
                        <Badge variant="default" className="gap-1 text-[10px]">
                          <Scale className="h-3 w-3" />
                          Juridique CPI
                        </Badge>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </time>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
