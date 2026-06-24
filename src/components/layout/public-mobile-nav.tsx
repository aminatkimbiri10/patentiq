"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { publicNav } from "@/config/navigation";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export function PublicMobileNav() {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col border-l bg-card shadow-2xl animate-slide-up safe-top safe-bottom">
            <div className="flex h-14 items-center justify-between border-b px-4 sm:h-16">
              <BrandLogo href="/" size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 scrollbar-thin">
              {publicNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
              <Link
                href="/#fonctionnalites"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Fonctionnalités
              </Link>
            </nav>
            <div className="space-y-2 border-t p-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  Se connecter
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  Créer un compte
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
