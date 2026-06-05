import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-mesh px-4">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="relative w-full max-w-lg text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" />
        </div>
        <p className="text-8xl font-extrabold tracking-tighter text-gradient sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil
          ou explorez la plateforme.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full bg-background/60 sm:w-auto" asChild>
            <Link href="/dashboard">
              <Search className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>
    </div>
  );
}
