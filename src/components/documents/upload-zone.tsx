"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Upload, CheckCircle2 } from "lucide-react";
import { uploadDocument, type DocumentActionState } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALLOWED_UPLOAD_MIME, MAX_FILE_SIZE_MB } from "@/config/constants";
import { cn } from "@/lib/utils/cn";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Envoi en cours…" : "Uploader le fichier"}
    </Button>
  );
}

export function UploadZone({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(uploadDocument, {} as DocumentActionState);
  const accept = ALLOWED_UPLOAD_MIME.join(",");

  return (
    <form action={formAction} className="card-elevated space-y-5 p-5 sm:p-6">
      <input type="hidden" name="project_id" value={projectId} />
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all sm:p-10",
          state?.success
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-border/80 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        {state?.success ? (
          <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-500" />
        ) : (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
        )}
        <p className="text-sm font-semibold">
          {state?.success ? "Document uploadé avec succès" : "Glissez ou sélectionnez un fichier"}
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          PDF, DOCX, PNG, JPG, CSV — max {MAX_FILE_SIZE_MB} Mo
        </p>
        <Input
          type="file"
          name="file"
          accept={accept}
          required
          className="mt-5 max-w-xs cursor-pointer border-dashed"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Titre affiché (optionnel)</Label>
        <Input id="title" name="title" placeholder="Nom du document dans le dossier" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
