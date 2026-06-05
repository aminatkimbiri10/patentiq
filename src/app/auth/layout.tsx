import Link from "next/link";
import { Sparkles, Shield, Zap } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen min-h-[100dvh] lg:grid lg:grid-cols-2">
      {/* Panneau gauche — desktop split-screen */}
      <div
        className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between"
        style={{
          background: `linear-gradient(160deg, ${siteConfig.brand.blue} 0%, hsl(210, 90%, 28%) 55%, hsl(210, 90%, 22%) 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-dots opacity-15" />
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-black/10 to-transparent" />
        <div className="relative">
          <BrandLogo href="/" variant="light" size="lg" />
        </div>
        <div className="relative space-y-8 text-white">
          <h2 className="text-3xl font-bold leading-tight xl:text-[2.75rem]">
            Vos innovations méritent
            <br />
            une plateforme à leur hauteur.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/80">
            Gérez projets, documents et collaboration CPI en un seul espace sécurisé —
            prêt pour l&apos;IA et le dépôt.
          </p>
          <ul className="space-y-4 text-white/90">
            {[
              { icon: Sparkles, text: "Workflow IA-ready dès le premier jour" },
              { icon: Shield, text: "Sécurité entreprise — Auth, RLS, Storage" },
              { icon: Zap, text: "Collaboration porteurs, CPI & experts" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} {siteConfig.name} — Plateforme PI professionnelle
        </p>
      </div>

      {/* Formulaire */}
      <div className="relative flex flex-col items-center justify-center bg-mesh px-4 py-10 sm:px-8 lg:py-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mb-6 lg:hidden">
          <BrandLogo href="/" />
        </div>
        <div className="w-full max-w-[420px] animate-fade-in">{children}</div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
