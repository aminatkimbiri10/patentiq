import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/auth/login" />
        </div>
        <p className="text-7xl font-semibold tracking-tight text-primary sm:text-8xl">404</p>
        <h1 className="mt-4 text-xl font-semibold sm:text-2xl">Page introuvable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La ressource demandée n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Connexion
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard">Tableau de bord</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
