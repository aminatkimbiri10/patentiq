import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function CpiLayout({ children }: { children: React.ReactNode }) {
  await requireRole("cpi_advisor");
  return <AppShell forceRole="cpi_advisor">{children}</AppShell>;
}
