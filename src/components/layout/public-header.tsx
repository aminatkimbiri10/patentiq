import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";
import { landingConfig } from "@/config/landing";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85">
      <div className="container flex h-[4.5rem] min-w-0 items-center justify-between gap-3 sm:h-20">
        <BrandLogo size="md" context="organization" showText={false} prominent placement="landing" className="shrink-0" />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {landingConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href={landingConfig.signIn.href}>{landingConfig.signIn.label}</Link>
          </Button>
          <Button
            size="sm"
            className="hidden bg-[hsl(213,52%,25%)] shadow-sm hover:bg-[hsl(213,52%,20%)] dark:bg-cyan-600 dark:hover:bg-cyan-500 sm:inline-flex"
            asChild
          >
            <Link href={landingConfig.primaryCta.href}>{landingConfig.primaryCta.label}</Link>
          </Button>
          <PublicMobileNav />
        </div>
      </div>
    </header>
  );
}
