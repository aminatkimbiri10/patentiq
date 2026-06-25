import { FileText, Shield, Users, MapPin } from "lucide-react";
import { AuthBrandLogo } from "@/components/auth/auth-brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { i2paBrand } from "@/config/i2pa-brand";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell relative min-h-screen min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden lg:grid lg:grid-cols-2">
      <div
        className="relative hidden min-w-0 overflow-hidden border-r border-primary/20 p-8 xl:p-10 lg:flex lg:flex-col lg:justify-between"
        style={{
          background: `linear-gradient(165deg, ${i2paBrand.primaryDark} 0%, ${i2paBrand.primary} 45%, hsl(213, 52%, 18%) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(201, 162, 39, 0.15), transparent 60%)",
          }}
        />
        <div className="relative min-w-0 max-w-full">
          <AuthBrandLogo variant="on-dark" />
        </div>
        <div className="relative min-w-0 max-w-md space-y-6 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/55">
              {siteConfig.productLabel}
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl xl:text-4xl">
              Votre espace propriété intellectuelle
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-white/75">
            Collaborez avec {i2paBrand.name} sur vos dossiers brevets, marques et dessins & modèles
            — documents, échéances, surveillance OMPIC et échanges sécurisés.
          </p>
          <ul className="space-y-3 border-t border-white/15 pt-6 text-sm text-white/85">
            {[
              { icon: FileText, text: "Dossiers, documents et parcours PI guidé" },
              { icon: Shield, text: "Authentification renforcée (2FA authenticator)" },
              { icon: Users, text: "Porteurs, conseillers CPI et experts" },
            ].map((item) => (
              <li key={item.text} className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 leading-snug">{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="flex min-w-0 items-start gap-2 text-xs text-white/50">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 break-words">{i2paBrand.address}</span>
          </p>
        </div>
        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} {i2paBrand.name} — Tous droits réservés
        </p>
      </div>

      <div className="relative flex min-h-[100dvh] min-w-0 w-full max-w-full flex-col items-center justify-center overflow-x-hidden bg-background px-4 pb-10 pt-14 safe-top safe-bottom sm:px-6 lg:py-8 lg:pt-8">
        <div className="absolute right-3 top-3 safe-top sm:right-4 sm:top-4">
          <ThemeToggle />
        </div>
        <div className="w-full min-w-0 max-w-[420px] animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
