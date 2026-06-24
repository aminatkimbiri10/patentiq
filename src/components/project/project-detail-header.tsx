import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";

export function ProjectDetailHeader({
  backHref,
  backLabel,
  category,
  title,
  referenceCode,
  lastActivityAt,
  partyLabel,
  partyName,
  children,
  className,
}: {
  backHref: string;
  backLabel: string;
  category?: string | null;
  title: string;
  referenceCode?: string | null;
  lastActivityAt?: string | null;
  partyLabel?: string;
  partyName?: string | null;
  children?: React.ReactNode;
  className?: string;
}) {
  const activityLabel =
    lastActivityAt &&
    formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true, locale: fr });

  return (
    <header className={cn("space-y-4", className)}>
      <nav
        className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Fil d'Ariane"
      >
        <Link href={backHref} className="shrink-0 transition-colors hover:text-foreground">
          {backLabel}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        <span className="truncate font-medium text-foreground">{title}</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          {category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {category}
            </p>
          )}
          <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {partyLabel && (
              <span>
                {partyLabel}{" "}
                <span className="font-medium text-foreground">{partyName ?? "—"}</span>
              </span>
            )}
            {referenceCode && (
              <span>
                Référence{" "}
                <span className="font-medium tabular-nums text-foreground">{referenceCode}</span>
              </span>
            )}
            {activityLabel && <span>Dernière activité {activityLabel}</span>}
          </div>
        </div>
        {children && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </header>
  );
}
