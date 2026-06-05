"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signIn, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, SocialLoginButtons } from "@/components/auth/social-login-buttons";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useFormState(signIn, initialState);

  return (
    <div className="space-y-1">
      <SocialLoginButtons />
      <AuthDivider />
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@entreprise.com"
        />
        {state?.error?.email && (
          <p className="text-sm text-destructive">{state.error.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Oublié ?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {state?.error?.password && (
          <p className="text-sm text-destructive">{state.error.password[0]}</p>
        )}
      </div>
      {state?.error?._form && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-2">
          <p className="text-sm text-destructive">{state.error._form[0]}</p>
          {state.error._form[0]?.includes("non confirmé") && (
            <Link href="/auth/check-email" className="text-sm font-medium text-primary hover:underline block">
              Renvoyer l&apos;email de confirmation →
            </Link>
          )}
        </div>
      )}
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Pas de compte ?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </form>
    </div>
  );
}
