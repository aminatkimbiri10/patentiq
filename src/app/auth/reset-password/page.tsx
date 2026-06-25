import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Nouveau mot de passe"
      description={`Si vous avez cliqué sur le lien reçu par email, vous serez connecté automatiquement. Sinon, demandez un nouveau lien depuis la page « Mot de passe oublié ».`}
    >
      <div className="space-y-4 text-center text-sm text-muted-foreground">
        <p>
          Besoin d&apos;aide ? Contactez{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="font-medium text-primary hover:underline">
            {siteConfig.contact.email}
          </a>
        </p>
        <Link href="/auth/login" className="inline-block font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </AuthCard>
  );
}
