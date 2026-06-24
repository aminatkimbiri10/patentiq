import {
  User,
  ClipboardCheck,
  Brain,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import type { ProjectStatus } from "@/types/database";
import { cn } from "@/lib/utils/cn";

type KpiItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  muted?: boolean;
  alert?: boolean;
};

export function ProjectStatusBanner({
  status,
  cpiName,
  partyLabel = "Conseil CPI",
  partyName,
  checklistPercent,
  pendingTasks,
  pendingAi,
  unreadMessages,
}: {
  status: ProjectStatus;
  /** @deprecated Utiliser partyLabel + partyName */
  cpiName?: string | null;
  partyLabel?: string;
  partyName?: string | null;
  checklistPercent: number;
  pendingTasks: number;
  pendingAi: number;
  unreadMessages: number;
}) {
  const contactName = partyName ?? cpiName;
  const items: KpiItem[] = [
    {
      icon: User,
      label: partyLabel,
      value: contactName ?? "Non renseigné",
      muted: !contactName,
    },
    {
      icon: ClipboardCheck,
      label: "Checklist",
      value: `${checklistPercent} %`,
      alert: checklistPercent < 50,
    },
    {
      icon: ListChecks,
      label: "Tâches ouvertes",
      value: pendingTasks > 0 ? String(pendingTasks) : "Aucune",
      alert: pendingTasks > 0,
    },
    {
      icon: Brain,
      label: "Analyses IA",
      value: pendingAi > 0 ? `${pendingAi} en cours` : "À jour",
      alert: pendingAi > 0,
    },
    {
      icon: MessageSquare,
      label: "Messages non lus",
      value: unreadMessages > 0 ? String(unreadMessages) : "Aucun",
      alert: unreadMessages > 0,
    },
  ];

  return (
    <section
      className="overflow-hidden rounded-lg border bg-card shadow-sm"
      aria-label="Indicateurs du dossier"
    >
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Statut du dossier
          </span>
          <ProjectStatusBadge status={status} />
        </div>
      </div>
      <dl className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y lg:grid-cols-5 lg:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <item.icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                item.alert ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </dt>
              <dd
                className={cn(
                  "mt-0.5 truncate text-sm font-medium",
                  item.muted && "text-muted-foreground",
                  item.alert && "text-primary"
                )}
              >
                {item.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
