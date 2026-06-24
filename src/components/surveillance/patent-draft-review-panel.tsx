"use client";

import { useState, useTransition } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Lightbulb, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  reviewPatentDraftAction,
  type ReviewPatentDraftResult,
} from "@/lib/actions/patent-draft-review";
import type { DraftIssue, DraftIssueSeverity, DraftReview } from "@/lib/ai/patent-draft-review";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const SEVERITY_META: Record<
  DraftIssueSeverity,
  { label: string; icon: typeof AlertTriangle; className: string }
> = {
  blocker: { label: "Bloquant", icon: AlertOctagon, className: "text-destructive" },
  warning: { label: "À corriger", icon: AlertTriangle, className: "text-amber-600" },
  tip: { label: "Conseil", icon: Lightbulb, className: "text-sky-600" },
};

function ScoreBadge({ review }: { review: DraftReview }) {
  const color =
    review.level === "solide"
      ? "text-emerald-600"
      : review.level === "perfectible"
        ? "text-amber-600"
        : "text-destructive";
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("text-3xl font-bold tabular-nums", color)}>{review.score}</span>
      <span className="text-sm text-muted-foreground">/ 100 · {review.level}</span>
    </div>
  );
}

function IssueRow({ issue }: { issue: DraftIssue }) {
  const meta = SEVERITY_META[issue.severity];
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.className)} />
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium">
          {issue.rule}
          <span className={cn("ml-2 text-xs font-normal", meta.className)}>{meta.label}</span>
        </p>
        <p className="text-sm text-muted-foreground">{issue.message}</p>
        <p className="text-xs text-muted-foreground/90">→ {issue.suggestion}</p>
      </div>
    </li>
  );
}

export function PatentDraftReviewPanel({ projectId }: { projectId: string }) {
  const [review, setReview] = useState<DraftReview | null>(null);
  const [pending, startTransition] = useTransition();

  function handleReview() {
    startTransition(async () => {
      const result: ReviewPatentDraftResult = await reviewPatentDraftAction(projectId);
      if (!result.success || !result.review) {
        toast.error(result.error ?? "Pré-examen impossible");
        return;
      }
      setReview(result.review);
      const n = result.review.issues.length;
      toast.success(n === 0 ? "Aucune anomalie détectée." : `${n} point(s) à revoir.`);
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h4 className="text-sm font-semibold">Pré-examen du brouillon</h4>
            <p className="text-xs text-muted-foreground">
              Contrôle automatique des anomalies fréquentes avant revue CPI (clarté, abrégé, base
              d&apos;antériorité, effet technique).
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={handleReview}>
          {pending ? "Analyse…" : "Lancer le pré-examen"}
        </Button>
      </div>

      {review && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-4 py-3">
            <ScoreBadge review={review} />
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="text-destructive">{review.counts.blocker} bloquant(s)</span>
              <span className="text-amber-600">{review.counts.warning} à corriger</span>
              <span className="text-sky-600">{review.counts.tip} conseil(s)</span>
            </div>
          </div>

          {review.issues.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Aucune anomalie détectée par le pré-examen automatique. Une revue CPI reste recommandée.
            </p>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-background">
              {review.issues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">
            Analyse indicative — ne remplace pas l&apos;examen d&apos;un conseiller en propriété
            industrielle.
          </p>
        </div>
      )}
    </div>
  );
}
