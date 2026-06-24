import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { MfaSettingsPanel } from "@/components/auth/mfa-settings-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sécurité du compte" };

export default async function SecurityPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Sécurité"
        description="Confirmation email à l'inscription et authentification à deux facteurs (2FA)."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Double authentification (2FA)</CardTitle>
        </CardHeader>
        <CardContent>
          <MfaSettingsPanel />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        L&apos;email doit être confirmé avant la première connexion. Activez la 2FA surtout si vous
        gérez des revendications ou des inventions confidentielles.
      </p>
    </div>
  );
}
