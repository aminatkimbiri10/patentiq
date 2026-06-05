import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Connexion" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const oauthError = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : undefined;

  return (
    <AuthCard title="Connexion" description="Accédez à votre espace — email, Google ou GitHub">
      {oauthError && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {oauthError}
        </div>
      )}
      <LoginForm />
    </AuthCard>
  );
}
