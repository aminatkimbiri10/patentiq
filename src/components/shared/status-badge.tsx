import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { ProjectStatus } from "@/types/database";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "warning" | "success" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "secondary",
  in_review: "default",
  awaiting_documents: "warning",
  expert_review: "default",
  cpi_review: "default",
  approved: "success",
  rejected: "destructive",
  closed: "secondary",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={statusVariant[status] ?? "outline"}>
      {PROJECT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
