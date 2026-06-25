"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile, type ProfileActionState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/database";

export function ProfileForm({
  email,
  profile,
}: {
  email: string;
  profile: Profile | null;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateProfile, {} as ProfileActionState);

  useEffect(() => {
    if (state?.success) {
      toast.success("Profil enregistré");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <Card className="card-elevated bg-card">
        <CardHeader>
          <CardTitle className="text-base">Coordonnées</CardTitle>
          <CardDescription>Informations visibles par votre équipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated bg-card">
        <CardHeader>
          <CardTitle className="text-base">Entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Société</Label>
              <Input id="company" name="company" defaultValue={profile?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Fonction</Label>
              <Input id="job_title" name="job_title" defaultValue={profile?.job_title ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={profile?.bio ?? ""}
              placeholder="Présentation courte…"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg">
        Enregistrer les modifications
      </Button>
    </form>
  );
}
