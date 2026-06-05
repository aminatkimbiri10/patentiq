import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <AuthCard title="Créer un compte" description="Inscription gratuite — email, Google ou GitHub">
      <RegisterForm />
    </AuthCard>
  );
}
