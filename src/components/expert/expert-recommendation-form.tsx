"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  submitExpertRecommendation,
  type ExpertOpinionState,
} from "@/lib/actions/expert-opinion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ExpertRecommendationForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, formAction] = useFormState(submitExpertRecommendation, {} as ExpertOpinionState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Recommandation enregistrée");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <Card className="card-elevated border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Recommandation finale</CardTitle>
        <CardDescription>
          Synthèse structurée transmise au conseiller PI (sans changement de statut).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="project_id" value={projectId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="feasibility">Faisabilité technique</Label>
              <select
                id="feasibility"
                name="feasibility"
                required
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                defaultValue="unknown"
              >
                <option value="high">Élevée</option>
                <option value="medium">Modérée</option>
                <option value="low">Faible</option>
                <option value="unknown">À approfondir</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendation">Recommandation</Label>
              <select
                id="recommendation"
                name="recommendation"
                required
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                defaultValue="caution"
              >
                <option value="proceed">Favorable — poursuivre</option>
                <option value="caution">Réserves — précautions</option>
                <option value="reject">Défavorable</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risks">Risques / points de vigilance</Label>
            <Textarea
              id="risks"
              name="risks"
              rows={3}
              placeholder="Contraintes techniques, antériorités connues, maturité TRL…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Analyse détaillée *</Label>
            <Textarea
              id="body"
              name="body"
              rows={6}
              required
              placeholder="Décrivez votre analyse technique, les éléments nouveaux, la faisabilité de mise en œuvre…"
            />
          </div>

          <Button type="submit">Publier la recommandation</Button>
        </form>
      </CardContent>
    </Card>
  );
}
