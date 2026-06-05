"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { resendConfirmationEmail, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResendConfirmationForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, formAction, pending] = useFormState(resendConfirmationEmail, {} as AuthFormState);

  if (state?.success && state.message) {
    return (
      <div className="space-y-4 text-center text-sm">
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-800 dark:text-emerald-300">
          {state.message}
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Retour connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="vous@exemple.com"
        />
      </div>
      {state?.error?._form && (
        <p className="text-sm text-destructive">{state.error._form[0]}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "Renvoyer le lien"}
      </Button>
    </form>
  );
}
