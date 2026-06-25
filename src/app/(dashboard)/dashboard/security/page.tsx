import { ShieldCheck, Smartphone, Lock, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { FeatureTiles } from "@/components/shared/feature-tiles";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { MfaSettingsPanel } from "@/components/auth/mfa-settings-panel";

export const metadata = { title: "Sécurité du compte" };

export default async function SecurityPage() {
  await requireUser();

  return (
    <DashboardPageFrame className="mx-auto max-w-2xl">
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={ShieldCheck}
        eyebrow="Compte"
        title="Sécurité"
        description="Protégez vos dossiers PI — authentification renforcée exigée par I2PA."
      />

      <FeatureTiles
        items={[
          { icon: Mail, title: "Email confirmé", description: "Vérification à l'inscription" },
          {
            icon: Smartphone,
            title: "2FA Authenticator",
            description: "Google Authenticator / Authy",
          },
          { icon: Lock, title: "Dossiers isolés", description: "Accès par rôle (RLS)" },
        ]}
      />

      <DashboardPanel
        title="Authentification à deux facteurs (2FA)"
        description="Recommandé pour les CPI et toute personne manipulant des revendications ou descriptions d'invention."
        icon={Smartphone}
      >
        <div className="space-y-4 p-5 pt-0">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Scannez le QR code avec votre application d&apos;authentification — un code à 6 chiffres
            sera demandé à chaque connexion.
          </p>
          <MfaSettingsPanel />
        </div>
      </DashboardPanel>

      <p className="text-xs leading-relaxed text-muted-foreground">
        En cas de perte de l&apos;authenticator, contactez votre administrateur I2PA. Ne partagez
        jamais vos codes de sécurité.
      </p>
    </DashboardPageFrame>
  );
}
