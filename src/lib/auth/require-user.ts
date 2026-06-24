import { redirect } from "next/navigation";
import { getUserContext, type UserContext } from "@/lib/auth/get-user";

export type RequireUserOptions = {
  /** Pour /onboarding/role — ne pas renvoyer si profil incomplet */
  allowIncompleteOnboarding?: boolean;
};

export async function requireUser(options?: RequireUserOptions): Promise<UserContext> {
  const ctx = await getUserContext();
  if (!ctx) redirect("/auth/login");

  if (!options?.allowIncompleteOnboarding) {
    if (!ctx.profile?.onboarding_completed || ctx.roles.length === 0) {
      redirect("/onboarding/role");
    }
  }

  return ctx;
}
