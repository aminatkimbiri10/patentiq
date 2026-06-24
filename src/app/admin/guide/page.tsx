import { requireUser } from "@/lib/auth/require-user";
import { PlatformGuide } from "@/components/shared/platform-guide";

export const metadata = { title: "Guide — PatentIQ" };

export default async function AdminGuidePage() {
  await requireUser();
  return <PlatformGuide role="admin" />;
}
