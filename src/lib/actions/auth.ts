"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validations/auth";
import { getHomePathForRole } from "@/lib/auth/redirect-by-role";
import { parseRoleFromJoin } from "@/lib/auth/parse-role";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import type { AppRole } from "@/types/roles";

export type AuthFormState = {
  error?: Record<string, string[] | undefined>;
  success?: boolean;
  needsEmailConfirmation?: boolean;
  message?: string;
};

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Email non confirmé. Vérifiez votre boîte mail (et les spams) ou renvoyez le lien de confirmation.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  return message;
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: { _form: [mapAuthError(error.message)] } };
  }

  redirect(await resolvePostAuthPath(supabase));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${appUrl}/auth/callback?next=/onboarding/role`,
    },
  });

  if (error) {
    return { error: { _form: [mapAuthError(error.message)] } };
  }

  if (data.user) {
    try {
      await ensureProfile({
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      });
    } catch (e) {
      return {
        error: {
          _form: [
            e instanceof Error
              ? e.message
              : "Profil non créé — vérifiez que les migrations Supabase sont appliquées.",
          ],
        },
      };
    }
  }

  // Confirmation email activée → pas de session tant que l'email n'est pas validé
  if (data.user && !data.session) {
    return {
      success: true,
      needsEmailConfirmation: true,
      message:
        "Compte créé. Un email de confirmation a été envoyé (vérifiez aussi les spams). Cliquez sur le lien pour activer votre compte, puis connectez-vous.",
    };
  }

  if (data.session) {
    redirect("/onboarding/role");
  }

  return {
    success: true,
    message: "Inscription enregistrée. Vous pouvez vous connecter.",
  };
}

export async function resendConfirmationEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: { email: ["Email requis"] } };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/onboarding/role`,
    },
  });

  if (error) {
    return { error: { _form: [mapAuthError(error.message)] } };
  }

  return {
    success: true,
    message: "Si un compte existe pour cet email, un nouveau lien de confirmation a été envoyé.",
  };
}

export async function signInWithOAuth(formData: FormData) {
  const provider = formData.get("provider");
  if (provider !== "google" && provider !== "github") {
    redirect(
      `/auth/login?error=${encodeURIComponent("Fournisseur OAuth invalide")}`
    );
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/onboarding/role`,
      ...(provider === "google"
        ? { queryParams: { access_type: "offline", prompt: "consent" } }
        : {}),
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(mapAuthError(error.message))}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect(
    `/auth/login?error=${encodeURIComponent("Impossible de démarrer la connexion sociale")}`
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function resetPasswordRequest(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/reset-password`,
  });

  if (error) return { error: { _form: [error.message] } };

  return { success: true, message: "Email de réinitialisation envoyé si le compte existe." };
}

async function resolvePostAuthPath(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/auth/login";

  await ensureProfile({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("is_primary, roles(role_name)")
    .eq("user_id", user.id);

  const primary = roles?.find((r) => r.is_primary);
  const roleName = parseRoleFromJoin(
    primary?.roles as { role_name: AppRole } | { role_name: AppRole }[] | null
  );

  return getHomePathForRole(roleName, profile?.onboarding_completed ?? false);
}
