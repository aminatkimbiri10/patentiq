import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata = { title: "Nouveau mot de passe" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Réinitialisation"
      description="Ouvrez le lien reçu par email pour définir un nouveau mot de passe (page à compléter avec Supabase Auth UI ou exchangeCodeForSession)."
    >
      <p className="text-center text-sm text-muted-foreground">
        Si vous venez du mail Supabase, le lien devrait vous reconnecter automatiquement.
      </p>
      <ButtonLink />
    </AuthCard>
  );
}

function ButtonLink() {
  return (
    <p className="mt-4 text-center text-sm">
      <Link href="/auth/login" className="text-primary hover:underline">
        Retour à la connexion
      </Link>
    </p>
  );
}
