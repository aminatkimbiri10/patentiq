import Link from "next/link";
import { publicNav } from "@/config/navigation";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 min-w-0 items-center justify-between gap-3">
        <BrandLogo size="md" />

        <nav className="hidden items-center gap-1 lg:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
          <Link
            href="/#fonctionnalites"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Fonctionnalités
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/auth/login">Se connecter</Link>
          </Button>
          <Button size="sm" className="hidden shadow-md shadow-primary/20 sm:inline-flex" asChild>
            <Link href="/auth/register">Créer un compte</Link>
          </Button>
          <PublicMobileNav />
        </div>
      </div>
    </header>
  );
}
