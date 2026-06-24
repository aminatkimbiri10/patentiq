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
      description="Consultez votre boîte mail et cliquez sur le lien de confirmation pour activer votre compte PatentIQ."
    >
      <ResendConfirmationForm defaultEmail={searchParams.email ?? ""} />
    </AuthCard>
  );
}
