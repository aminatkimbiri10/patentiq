import { assignPrimaryRole } from "@/lib/actions/profile";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { APP_ROLES, ROLE_LABELS } from "@/types/roles";
import { requireUser } from "@/lib/auth/require-user";
import { cn } from "@/lib/utils/cn";

const roleDescriptions: Record<(typeof APP_ROLES)[number], string> = {
  project_holder: "Créez et suivez vos projets, documents et recherches.",
  cpi_advisor: "Analysez, commentez et validez les dossiers clients.",
  expert: "Évaluez la faisabilité technique et formulez des recommandations.",
  admin: "Supervisez la plateforme, les utilisateurs et les paramètres.",
};

export const metadata = { title: "Choisir votre rôle" };

export default async function OnboardingRolePage() {
  await requireUser({ allowIncompleteOnboarding: true });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-lg animate-fade-in">
        <AuthCard
          title="Votre profil"
          description="Choisissez votre rôle principal — vous pourrez collaborer sur tous les espaces."
        >
          <form action={assignPrimaryRole} className="grid gap-3">
            {APP_ROLES.map((role) => (
              <Button
                key={role}
                type="submit"
                name="role"
                value={role}
                variant="outline"
                className={cn(
                  "h-auto flex-col items-start gap-1 rounded-xl border-border/80 px-4 py-4 text-left",
                  "hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <span className="font-semibold">{ROLE_LABELS[role]}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {roleDescriptions[role]}
                </span>
              </Button>
            ))}
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
