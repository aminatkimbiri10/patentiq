import Link from "next/link";
import { UserCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "@/components/profile/profile-form";
import { NotificationPrefsForm } from "@/components/profile/notification-prefs-form";
import { parseNotificationPrefs } from "@/lib/notifications/prefs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";import { getAvatarSignedUrl } from "@/lib/storage/avatar";
import { ROLE_LABELS } from "@/types/roles";
import type { AppRole } from "@/types/roles";

export const metadata = { title: "Profil" };

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const ctx = await requireUser();
  const p = ctx.profile;

  const roleLabel = ctx.primaryRole
    ? ROLE_LABELS[ctx.primaryRole as AppRole]
    : "Non défini";

  const avatarUrl = await getAvatarSignedUrl(p?.avatar_url);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        icon={UserCircle}
        title="Mon profil"
        description="Gérez vos informations et votre photo."
      />

      <Card className="card-elevated border-0 shadow-none">
        <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:items-start sm:gap-8">
          <AvatarUpload
            initials={getInitials(p?.full_name, ctx.user.email ?? "")}
            signedUrl={avatarUrl}
            avatarPath={p?.avatar_url}
          />
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold">{p?.full_name ?? "Utilisateur"}</p>
            <p className="text-sm text-muted-foreground">{ctx.user.email}</p>
            <Badge variant="secondary" className="mt-2">
              {roleLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <ProfileForm email={ctx.user.email} profile={p} />
      <NotificationPrefsForm prefs={parseNotificationPrefs(p?.metadata)} />

      <Card className="card-elevated border-0 shadow-none">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Sécurité du compte</p>
            <p className="text-sm text-muted-foreground">
              Confirmation email et authentification à deux facteurs (2FA).
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/security">Paramètres sécurité</Link>
          </Button>
        </CardContent>
      </Card>
    </div>  );
}
