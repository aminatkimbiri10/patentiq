import { Settings } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { WorkflowSettingsForm } from "@/components/admin/workflow-settings-form";
import { getWorkflowSettingsForAdmin } from "@/lib/actions/admin-settings";
import { listCpiAdvisors } from "@/lib/workflow/assign-cpi";

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
    <div className="dash-page mx-auto w-full min-w-0 max-w-2xl space-y-6">
      <PageHeader
        icon={Settings}
        eyebrow="Administration"
        title="Paramètres globaux"
        description="Workflow métier et comportement à la soumission des dossiers."
      />

      <DashboardPanel
        title="Workflow"
        description="Contrôle l'assignation automatique CPI et le passage en revue à la soumission."
        icon={Settings}
      >
        <div className="p-5 pt-0">
          <WorkflowSettingsForm values={values} cpiOptions={cpiOptions} />
        </div>
      </DashboardPanel>
    </div>
  );
}
