"use client";

import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { useFormState } from "react-dom";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, SocialLoginButtons } from "@/components/auth/social-login-buttons";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useFormState(signUp, initialState);

  if (state?.needsEmailConfirmation || (state?.success && state?.message)) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold text-foreground">Vérifiez votre email</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">{state.message}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Pas d&apos;email reçu ? Configurez SMTP dans Supabase ou désactivez
          &quot;Confirm email&quot; en développement (voir docs/SUPABASE_SETUP.md).
        </p>
        <Button variant="outline" asChild className="h-11 w-full">
          <Link href="/auth/check-email">Renvoyer le lien de confirmation</Link>
        </Button>
        <Button asChild className="h-11 w-full">
          <Link href="/auth/login">Aller à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <SocialLoginButtons />
      <AuthDivider />
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input id="fullName" name="fullName" required placeholder="Jean Dupont" />
        {state?.error?.fullName && (
          <p className="text-sm text-destructive">{state.error.fullName[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email professionnel</Label>
        <Input id="email" name="email" type="email" required placeholder="vous@entreprise.com" />
        {state?.error?.email && (
          <p className="text-sm text-destructive">{state.error.email[0]}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
      </div>
      {state?.error?.confirmPassword && (
        <p className="text-sm text-destructive">{state.error.confirmPassword[0]}</p>
      )}
      {state?.error?._form && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{state.error._form[0]}</p>
        </div>
      )}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? (
          "Création…"
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Créer un compte
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Connexion
        </Link>
      </p>
    </form>
    </div>
  );
}
