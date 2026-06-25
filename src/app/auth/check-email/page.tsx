import { AuthCard } from "@/components/auth/auth-card";
import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Confirmer votre email" };

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <AuthCard
      title="Confirmer votre email"
      description={`Consultez votre boîte mail et cliquez sur le lien pour activer votre compte ${siteConfig.productLabel}.`}
    >
      <ResendConfirmationForm defaultEmail={searchParams.email ?? ""} />
    </AuthCard>
  );
}
