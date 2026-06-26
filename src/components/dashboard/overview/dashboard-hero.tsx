import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/types/roles";
import type { AppRole } from "@/types/roles";
import type { DashboardHeroHighlight } from "@/lib/dashboard/overview-data";
import { cn } from "@/lib/utils/cn";

export function DashboardHero({
  firstName,
  role,
  statusLine,
  highlights,
  action,
  compact = false,
}: {
  firstName?: string;
  role: AppRole;
  statusLine: string;
  highlights: DashboardHeroHighlight[];
  action?: React.ReactNode;
  /** Accueil allégé — pas de cartes KPI dupliquées */
  compact?: boolean;
}) {
  const greeting = firstName ? `Bonjour, ${firstName}` : "Bonjour";

  return (
    <section className={cn("dashboard-hero animate-fade-in", compact && "p-5 sm:p-6")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-eyebrow">Accueil</p>
            <Badge variant="secondary" className="font-normal">
              {ROLE_LABELS[role]}
            </Badge>
          </div>
          <h1 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {greeting}
          </h1>
          <p className="max-w-2xl break-words text-sm leading-relaxed text-muted-foreground">
            {statusLine}
          </p>
        </div>
        {action && (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            {action}
          </div>
        )}
      </div>

      {!compact && highlights.length > 0 && (
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {h.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{h.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export function SettingsShortcuts() {
  const links = [
    { href: "/dashboard/profile", label: "Profil" },
    { href: "/dashboard/notifications", label: "Notifications" },
    { href: "/dashboard/security", label: "Sécurité" },
  ];

  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header bg-muted/25">
        <h2 className="text-sm font-semibold">Raccourcis compte</h2>
      </div>
      <ul className="divide-y divide-border/60">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
            >
              {link.label}
              <span className="text-xs text-primary">Ouvrir</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
