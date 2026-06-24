"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const ok = confirm(
      `Supprimer définitivement le dossier « ${projectTitle} » ?\n\nCette action est irréversible (documents, analyses et échanges inclus).`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Dossier supprimé.");
      router.push("/dashboard/projects");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={pending}
      onClick={handleDelete}
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      {pending ? "Suppression…" : "Supprimer le dossier"}
    </Button>
  );
}
