import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function ExpertLayout({ children }: { children: React.ReactNode }) {
  await requireRole("expert");
  return <AppShell forceRole="expert">{children}</AppShell>;
}
