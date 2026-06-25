import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <AuthCard
      showBrand
      title="Créer un compte"
      description={`Rejoignez ${siteConfig.productLabel} pour collaborer avec votre conseil I2PA`}
    >
      <RegisterForm />
    </AuthCard>
  );
}
