import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Mot de passe oublié"
      description={`Recevez un lien de réinitialisation par email pour ${siteConfig.productLabel}.`}
    >
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthCard>
  );
}
