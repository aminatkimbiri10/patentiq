import { AuthCard } from "@/components/auth/auth-card";
import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";

export const metadata = { title: "Confirmer votre email" };

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <AuthCard
      title="Confirmer votre email"
      description="Un lien de confirmation est requis avant la première connexion"
    >
      <ResendConfirmationForm defaultEmail={searchParams.email ?? ""} />
    </AuthCard>
  );
}
