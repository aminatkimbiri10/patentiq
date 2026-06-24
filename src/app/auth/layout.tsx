import { FileText, Shield, Users } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen min-h-[100dvh] lg:grid lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden border-r border-primary/20 p-10 lg:flex lg:flex-col lg:justify-between"
        style={{
          background: `linear-gradient(165deg, ${siteConfig.brand.blue} 0%, hsl(210, 90%, 30%) 50%, hsl(210, 90%, 24%) 100%)`,
        }}
      >
        <div className="relative">
          <BrandLogo href="/auth/login" variant="light" size="lg" />
        </div>
        <div className="relative max-w-md space-y-6 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Plateforme professionnelle
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              Gestion de la propriété intellectuelle
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-white/75">
            Centralisez vos dossiers, collaborez avec vos conseils CPI et pilotez
            vos démarches PI dans un environnement sécurisé.
          </p>
          <ul className="space-y-3 border-t border-white/15 pt-6 text-sm text-white/85">
            {[
              { icon: FileText, text: "Dossiers, documents et workflows PI" },
              { icon: Shield, text: "Sécurité, authentification et traçabilité" },
              { icon: Users, text: "Espaces porteurs, CPI et experts" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="leading-snug">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/45">
          © {new Date().getFullYear()} {siteConfig.name} — Tous droits réservés
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center bg-background px-4 py-10 sm:px-8 lg:py-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mb-8 lg:hidden">
          <BrandLogo href="/auth/login" />
        </div>
        <div className="w-full max-w-[420px] animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
