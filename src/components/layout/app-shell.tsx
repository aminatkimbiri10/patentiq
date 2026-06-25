import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { requireUser } from "@/lib/auth/require-user";
import { getNavSectionsForRole, flattenNavSections, getGuideHrefForRole } from "@/config/navigation";
import { getAvatarSignedUrl } from "@/lib/storage/avatar";
import { getUnreadNotificationCount } from "@/lib/notifications/unread-count";
import {
  ShellSidebarSkeleton,
  ShellTopbarSkeleton,
} from "@/components/shared/page-loading-skeleton";
import type { AppRole } from "@/types/roles";

function displayInitials(fullName: string | null | undefined, email: string): string {
  if (fullName) {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

async function AppShellSidebar({ forceRole }: { forceRole?: AppRole }) {
  const ctx = await requireUser();
  const role = forceRole ?? ctx.primaryRole ?? "project_holder";
  const sections = getNavSectionsForRole(role);
  const displayName = ctx.profile?.full_name ?? ctx.user.email;
  const [avatarUrl, unreadNotifications] = await Promise.all([
    getAvatarSignedUrl(ctx.profile?.avatar_url),
    getUnreadNotificationCount(ctx.user.id),
  ]);

  return (
    <DashboardSidebar
      sections={sections}
      role={role}
      userName={displayName}
      userInitials={displayInitials(ctx.profile?.full_name, ctx.user.email)}
      avatarUrl={avatarUrl}
      unreadNotifications={unreadNotifications}
    />
  );
}

async function AppShellTopbar({ forceRole }: { forceRole?: AppRole }) {
  const ctx = await requireUser();
  const role = forceRole ?? ctx.primaryRole ?? "project_holder";
  const sections = getNavSectionsForRole(role);

  const [unreadNotifications, avatarUrl] = await Promise.all([
    getUnreadNotificationCount(ctx.user.id),
    getAvatarSignedUrl(ctx.profile?.avatar_url),
  ]);

  const nav = flattenNavSections(sections).map((item) =>
    item.href === "/dashboard/notifications" && unreadNotifications > 0
      ? {
          ...item,
          badge: unreadNotifications > 99 ? "99+" : String(unreadNotifications),
        }
      : item
  );

  const displayName = ctx.profile?.full_name ?? ctx.user.email;

  return (
    <DashboardTopbar
      navItems={nav}
      navSections={sections}
      role={role}
      guideHref={getGuideHrefForRole(role)}
      email={ctx.user.email}
      name={displayName}
      initials={displayInitials(ctx.profile?.full_name, ctx.user.email)}
      avatarUrl={avatarUrl}
      unreadNotifications={unreadNotifications}
    />
  );
}

export function AppShell({
  children,
  forceRole,
}: {
  children: React.ReactNode;
  forceRole?: AppRole;
}) {
  return (
    <div className="app-shell flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-muted/20">
      <Suspense fallback={<ShellSidebarSkeleton />}>
        <AppShellSidebar forceRole={forceRole} />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense fallback={<ShellTopbarSkeleton />}>
          <AppShellTopbar forceRole={forceRole} />
        </Suspense>
        <main className="dashboard-main min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] p-4 pb-8 sm:p-6 sm:pb-10 lg:p-8 safe-bottom">
            <div className="dash-page min-w-0 max-w-full overflow-x-clip">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
