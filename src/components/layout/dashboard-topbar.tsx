import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { GlobalSearch } from "@/components/shared/global-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { NavItem } from "@/config/navigation";

export function DashboardTopbar({
  email,
  name,
  initials,
  avatarUrl,
  navItems,
}: {
  email: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  navItems: NavItem[];
}) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full min-w-0 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:gap-4 lg:px-6">
      <MobileNav items={navItems} />
      <GlobalSearch className="hidden md:block md:max-w-lg" />
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/dashboard/notifications">
            <Bell className="h-4 w-4" />
          </Link>
        </Button>
        <UserMenu email={email} name={name} initials={initials} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
