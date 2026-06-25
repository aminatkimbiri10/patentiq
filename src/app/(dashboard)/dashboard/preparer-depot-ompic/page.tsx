import { Landmark } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { PreparerDepotOmpicContent } from "@/components/guide/preparer-depot-ompic-content";

export const metadata = { title: "Préparer dépôt OMPIC" };

export default async function PreparerDepotOmpicPage() {
  await requireUser();

  return (
    <DashboardPageFrame className="mx-auto max-w-4xl">
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={Landmark}
        eyebrow="OMPIC · Maroc"
        title="Préparer un dépôt OMPIC"
        description="Checklists marque et brevet avant le dépôt officiel sur directompic.ma."
      />
      <PreparerDepotOmpicContent
        projectsHref="/dashboard/projects"
        surveillanceHref="/dashboard/surveillance"
      />
    </DashboardPageFrame>
  );
}
