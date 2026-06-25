import { Landmark } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { PreparerDepotOmpicContent } from "@/components/guide/preparer-depot-ompic-content";

export const metadata = { title: "Préparer dépôt OMPIC — CPI" };

export default async function CpiPreparerDepotPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={Landmark}
        eyebrow="OMPIC · Maroc"
        title="Préparer un dépôt OMPIC"
        description="Checklists client avant dépôt officiel — à valider avec le porteur."
      />
      <PreparerDepotOmpicContent
        projectsHref="/cpi/cases"
        surveillanceHref="/cpi/surveillance"
      />
    </div>
  );
}
