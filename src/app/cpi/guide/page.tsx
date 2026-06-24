import { requireUser } from "@/lib/auth/require-user";
import { PlatformGuide } from "@/components/shared/platform-guide";

export const metadata = { title: "Guide CPI — PatentIQ" };

export default async function CpiGuidePage() {
  await requireUser();
  return <PlatformGuide role="cpi_advisor" />;
}
