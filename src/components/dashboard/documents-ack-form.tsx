"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  acknowledgeDocuments,
  type AckDocumentsState,
} from "@/lib/actions/project-ack";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";

export function DocumentsAckForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, formAction] = useFormState(acknowledgeDocuments, {} as AckDocumentsState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Accusé enregistré");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="card-elevated flex flex-col gap-3 border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <div className="flex gap-3">
        <FileCheck className="h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Documents demandés par le conseiller PI
          </p>
          <p className="text-sm text-muted-foreground">
            Confirmez que vous avez bien pris connaissance de la demande (ou que les
            pièces ont été déposées).
          </p>
        </div>
      </div>
      <Button type="submit" variant="secondary" className="shrink-0">
        Accuser réception
      </Button>
    </form>
  );
}
