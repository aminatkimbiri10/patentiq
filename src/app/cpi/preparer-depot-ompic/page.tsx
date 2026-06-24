import { requireUser } from "@/lib/auth/require-user";
import { PreparerDepotOmpicContent } from "@/components/guide/preparer-depot-ompic-content";

export const metadata = { title: "Préparer dépôt OMPIC — CPI" };

export default async function CpiPreparerDepotPage() {
  await requireUser();

  return (
    <PreparerDepotOmpicContent
      projectsHref="/cpi/cases"
      surveillanceHref="/cpi/surveillance"
    />
  );
}
