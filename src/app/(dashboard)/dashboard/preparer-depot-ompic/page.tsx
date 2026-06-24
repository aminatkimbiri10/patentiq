import { requireUser } from "@/lib/auth/require-user";
import { PreparerDepotOmpicContent } from "@/components/guide/preparer-depot-ompic-content";

export const metadata = { title: "Préparer dépôt OMPIC" };

export default async function PreparerDepotOmpicPage() {
  await requireUser();

  return (
    <PreparerDepotOmpicContent
      projectsHref="/dashboard/projects"
      surveillanceHref="/dashboard/surveillance"
    />
  );
}
