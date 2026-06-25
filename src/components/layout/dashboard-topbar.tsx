import Link from "next/link";
import { Bell, Search, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { GlobalSearch } from "@/components/shared/global-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavBadge } from "@/components/shared/nav-badge";
import type { NavItem, NavSection } from "@/config/navigation";
import type { AppRole } from "@/types/roles";

export function DashboardTopbar({
  email,
  name,
  initials,
  avatarUrl,
  navItems,
  navSections,
  role,
  guideHref = "/dashboard/guide",
  unreadNotifications = 0,
}: {
  email: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  navItems: NavItem[];
  navSections?: NavSection[];
  role?: AppRole;
  guideHref?: string;
  unreadNotifications?: number;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full min-w-0 max-w-full shrink-0 items-center gap-2 overflow-hidden border-b border-border/40 bg-background/95 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85 safe-top sm:px-5 lg:px-6">
      <MobileNav items={navItems} sections={navSections} role={role} />

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 lg:hidden"
        asChild
        aria-label="Rechercher"
      >
        <Link href="/dashboard/search">
          <Search className="h-4 w-4" />
        </Link>
      </Button>

      <GlobalSearch className="hidden min-w-0 flex-1 lg:flex lg:max-w-md" />

      <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          asChild
          title="Guide d'utilisation"
        >
          <Link href={guideHref} aria-label="Guide">
            <CircleHelp className="h-4 w-4" />
          </Link>
        </Button>
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 shrink-0" asChild>
          <Link href="/dashboard/notifications" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <NavBadge
                count={unreadNotifications}
                className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[9px]"
              />
            )}
          </Link>
        </Button>
        <UserMenu
          email={email}
          name={name}
          initials={initials}
          avatarUrl={avatarUrl}
          role={role}
        />
      </div>
    </header>
  );
}
