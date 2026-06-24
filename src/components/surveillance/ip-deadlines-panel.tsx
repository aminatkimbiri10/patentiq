import Link from "next/link";
import { AlertTriangle, CalendarClock } from "lucide-react";
import type { IpDeadline } from "@/lib/workflow/ip-deadlines";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const URGENCY_BADGE: Record<
  IpDeadline["urgency"],
  "destructive" | "secondary" | "outline"
> = {
  overdue: "destructive",
  critical: "destructive",
  soon: "secondary",
  ok: "outline",
};

function urgencyLabel(d: IpDeadline): string {
  if (d.daysRemaining < 0) return `Retard ${Math.abs(d.daysRemaining)} j`;
  if (d.daysRemaining === 0) return "Aujourd'hui";
  if (d.daysRemaining === 1) return "Demain";
  return `J-${d.daysRemaining}`;
}

function projectHref(deadline: IpDeadline, viewer: "holder" | "cpi"): string {
  const base =
    viewer === "cpi"
      ? `/cpi/cases/${deadline.projectId}`
      : `/dashboard/projects/${deadline.projectId}`;
  return `${base}?tab=dossier&section=parcours-pi&pi=cycle`;
}

export function IpDeadlinesPanel({
  deadlines,
  viewer = "holder",
  compact = false,
}: {
  deadlines: IpDeadline[];
  viewer?: "holder" | "cpi";
  compact?: boolean;
}) {
  const urgent = deadlines.filter((d) => d.urgency !== "ok");

  if (!deadlines.length) {
    if (compact) return null;
    return (
      <div className="enterprise-panel overflow-hidden">
        <div className="enterprise-panel-header bg-muted/30">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Échéances PI</h3>
          </div>
        </div>
        <p className="px-5 py-4 text-sm text-muted-foreground">
          Aucune échéance OMPIC en cours. Renseignez le cycle marque ou brevet dans vos dossiers.
        </p>
      </div>
    );
  }

  if (compact && !urgent.length) return null;

  const list = compact ? urgent : deadlines;

  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header bg-muted/30">
        <div className="flex items-center gap-2">
          {urgent.length > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="text-sm font-semibold">Échéances PI</h3>
        </div>
        {urgent.length > 0 && (
          <Badge variant="destructive" className="font-normal">
            {urgent.length}
          </Badge>
        )}
      </div>
      <table className="enterprise-table">
        <thead>
          <tr>
            <th>Dossier</th>
            <th className="w-[120px]">Échéance</th>
            <th className="w-[90px] text-right">Délai</th>
          </tr>
        </thead>
        <tbody>
          {list.map((d) => (
            <tr key={`${d.projectId}-${d.kind}`} className="hover:bg-muted/30">
              <td>
                <Link
                  href={projectHref(d, viewer)}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {d.projectTitle}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.label}</p>
              </td>
              <td className="text-xs text-muted-foreground">
                {new Date(d.deadlineAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="text-right">
                <Badge
                  variant={URGENCY_BADGE[d.urgency]}
                  className={cn(
                    "font-normal",
                    d.urgency === "critical" && "bg-amber-100 text-amber-900 hover:bg-amber-100"
                  )}
                >
                  {urgencyLabel(d)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
