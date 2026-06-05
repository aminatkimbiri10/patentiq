import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { requireUser } from "@/lib/auth/require-user";
import { getNavForRole } from "@/config/navigation";
import { getAvatarSignedUrl } from "@/lib/storage/avatar";
import type { AppRole } from "@/types/roles";

export async function AppShell({
  children,
  forceRole,
}: {
  children: React.ReactNode;
  forceRole?: AppRole;
}) {
  const ctx = await requireUser();
  const role = forceRole ?? ctx.primaryRole ?? "project_holder";
  const nav = getNavForRole(role);

  const displayName = ctx.profile?.full_name ?? ctx.user.email;
  const initials = ctx.profile?.full_name
    ? ctx.profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : ctx.user.email.slice(0, 2).toUpperCase();

  const avatarUrl = await getAvatarSignedUrl(ctx.profile?.avatar_url);

  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-muted/30">
      <DashboardSidebar items={nav} role={role} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardTopbar
          navItems={nav}
          email={ctx.user.email}
          name={displayName}
          initials={initials}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="bg-dots mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <div className="animate-fade-in">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
