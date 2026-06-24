"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateNotificationPrefs,
  type ProfileActionState,
} from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NotificationPrefs } from "@/lib/notifications/prefs";

export function NotificationPrefsForm({ prefs }: { prefs: NotificationPrefs }) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateNotificationPrefs, {} as ProfileActionState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Préférences enregistrées");
      router.refresh();
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={formAction}>
      <Card className="card-elevated border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Les alertes in-app restent actives. Choisissez si vous recevez aussi des emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="email_enabled"
              name="email_enabled"
              defaultChecked={prefs.emailEnabled}
              className="mt-1 h-4 w-4 rounded border border-input"
            />
            <div>
              <Label htmlFor="email_enabled" className="cursor-pointer">
                Recevoir les emails transactionnels
              </Label>
              <p className="text-xs text-muted-foreground">
                Soumission, assignation, messages, décisions CPI… (nécessite Resend côté serveur)
              </p>
            </div>
          </div>
          <Button type="submit" variant="secondary">
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
