"use client";

import { useEffect, useMemo } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { uploadAvatar, type AvatarActionState } from "@/lib/actions/profile";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AVATAR_MIME } from "@/lib/validations/avatar";

export function AvatarUpload({
  initials,
  signedUrl,
  avatarPath,
}: {
  initials: string;
  signedUrl: string | null;
  avatarPath?: string | null;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(uploadAvatar, {} as AvatarActionState);

  const imageSrc = useMemo(() => {
    if (!signedUrl) return null;
    const v = avatarPath ? encodeURIComponent(avatarPath) : Date.now().toString();
    return `${signedUrl}${signedUrl.includes("?") ? "&" : "?"}v=${v}`;
  }, [signedUrl, avatarPath]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Photo de profil mise à jour");
      router.refresh();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="flex flex-col items-center gap-3">
      <form action={formAction} className="relative">
        <label className="group relative block cursor-pointer">
          <UserAvatar
            src={imageSrc}
            alt="Photo de profil"
            initials={initials}
            className="h-24 w-24 border-2 border-border shadow-md ring-0"
            fallbackClassName="text-2xl font-bold"
          />
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <Camera className="h-4 w-4" />
          </span>
          <input
            type="file"
            name="avatar"
            accept={AVATAR_MIME.join(",")}
            className="sr-only"
            onChange={(e) => {
              const form = e.target.form;
              if (form && e.target.files?.[0]) form.requestSubmit();
            }}
          />
        </label>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        Cliquez pour changer — PNG, JPG ou WebP (max 5 Mo)
      </p>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </div>
  );
}
