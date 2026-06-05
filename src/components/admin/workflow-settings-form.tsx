"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateWorkflowSettings,
  type WorkflowSettingsState,
} from "@/lib/actions/admin-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CpiOption = { id: string; label: string };

export function WorkflowSettingsForm({
  values,
  cpiOptions,
}: {
  values: {
    autoAssignCpi: boolean;
    autoMoveToInReview: boolean;
    defaultCpiUserId: string | null;
  };
  cpiOptions: CpiOption[];
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateWorkflowSettings, {} as WorkflowSettingsState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Paramètres enregistrés");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="auto_assign_cpi"
            name="auto_assign_cpi"
            defaultChecked={values.autoAssignCpi}
            className="mt-1 h-4 w-4 rounded border border-input"
          />
          <div className="space-y-1">
            <Label htmlFor="auto_assign_cpi" className="cursor-pointer">
              Assignation automatique du CPI à la soumission
            </Label>
            <p className="text-xs text-muted-foreground">
              Répartit le dossier au conseiller le moins chargé (ou au CPI par défaut).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="auto_move_to_in_review"
            name="auto_move_to_in_review"
            defaultChecked={values.autoMoveToInReview}
            className="mt-1 h-4 w-4 rounded border border-input"
          />
          <div className="space-y-1">
            <Label htmlFor="auto_move_to_in_review" className="cursor-pointer">
              Passage automatique en « En revue »
            </Label>
            <p className="text-xs text-muted-foreground">
              Après soumission, le statut devient in_review une fois le CPI assigné.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_cpi_user_id">CPI par défaut (optionnel)</Label>
          <select
            id="default_cpi_user_id"
            name="default_cpi_user_id"
            defaultValue={values.defaultCpiUserId ?? ""}
            className="flex h-11 w-full max-w-md rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— Répartition automatique —</option>
            {cpiOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
