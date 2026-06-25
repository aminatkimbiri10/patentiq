import { requireUser } from "@/lib/auth/require-user";
import { PlatformGuide } from "@/components/shared/platform-guide";

export const metadata = { title: "Guide" };

export default async function ExpertGuidePage() {
  const ctx = await requireUser();
  return <PlatformGuide role={ctx.primaryRole} />;
}
