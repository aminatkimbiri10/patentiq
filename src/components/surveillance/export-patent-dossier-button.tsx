"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { patentDossierPrintUrl } from "@/lib/checklists/patent-drafting";
import type { ProjectViewerRole } from "@/lib/project-routes";

export function ExportPatentDossierButton({
  projectId,
  disabled = false,
  variant = "outline" as const,
  size = "sm" as const,
  viewerRole = "holder",
}: {
  projectId: string;
  disabled?: boolean;
  variant?: "outline" | "secondary" | "default";
  size?: "sm" | "default";
  viewerRole?: ProjectViewerRole;
}) {
  return (
    <Button variant={variant} size={size} disabled={disabled} asChild>
      <a
        href={patentDossierPrintUrl(projectId, viewerRole)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FileDown className="mr-1.5 h-4 w-4" />
        Exporter PDF (dossier OMPIC)
      </a>
    </Button>
  );
}
