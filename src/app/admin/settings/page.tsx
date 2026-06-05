import { PageHeader } from "@/components/shared/page-header";
import { WorkflowSettingsForm } from "@/components/admin/workflow-settings-form";
import { getWorkflowSettingsForAdmin } from "@/lib/actions/admin-settings";
import { listCpiAdvisors } from "@/lib/workflow/assign-cpi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  const [values, cpiCandidates] = await Promise.all([
    getWorkflowSettingsForAdmin(),
    listCpiAdvisors(),
  ]);

  const cpiOptions = cpiCandidates.map((c) => ({
    id: c.userId,
    label: c.fullName ?? c.userId.slice(0, 8),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres globaux"
        description="Workflow métier et comportement à la soumission des dossiers."
      />

      <Card className="card-elevated border-0 shadow-none">
        <CardHeader>
          <CardTitle>Workflow</CardTitle>
          <CardDescription>
            Contrôle l&apos;assignation automatique CPI et le passage en revue à la soumission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowSettingsForm values={values} cpiOptions={cpiOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
