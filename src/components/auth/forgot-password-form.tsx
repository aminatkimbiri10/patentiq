"use client";

import { Mail } from "lucide-react";
import { useFormState } from "react-dom";
import { resetPasswordRequest, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useFormState(resetPasswordRequest, {} as AuthFormState);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
          Vérifiez votre boîte de réception.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="vous@entreprise.com"
        />
      </div>
      {state?.error?._form && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{state.error._form[0]}</p>
        </div>
      )}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
