import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPanel, ListPanelItem } from "@/components/shared/list-panel";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import type { AuditLog } from "@/types/database";

export const metadata = { title: "Audit" };

export default async function AuditLogsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (logs ?? []) as AuditLog[];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Journal d'audit"
        description="Traçabilité des actions sensibles sur la plateforme."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucun log"
          description="Les événements d'audit apparaîtront ici."
        />
      ) : (
        <ListPanel>
          {items.map((log) => (
            <ListPanelItem key={log.id} className="items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {log.action}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{log.entity_type}</span>
                </div>
                {log.entity_id && (
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {log.entity_id}
                  </p>
                )}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(log.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </time>
            </ListPanelItem>
          ))}
        </ListPanel>
      )}
    </div>
  );
}
