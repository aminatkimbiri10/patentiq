import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

const footerLinks = {
  produit: [
    { label: "Fonctionnalités", href: "/#fonctionnalites" },
    { label: "Comment ça marche", href: "/#comment-ca-marche" },
    { label: "Tarifs", href: "/pricing" },
    { label: "Sécurité", href: "/#securite" },
  ],
  entreprise: [
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Demander une démo", href: "/contact" },
  ],
  compte: [
    { label: "Se connecter", href: "/auth/login" },
    { label: "Créer un compte", href: "/auth/register" },
    { label: "Documentation", href: "/about" },
  ],
  legal: [
    { label: "Confidentialité", href: "/about" },
    { label: "CGU", href: "/about" },
    { label: "Mentions légales", href: "/about" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container section-padding !py-14">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <BrandLogo href="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-6">
              <Button size="sm" asChild>
                <Link href="/auth/register">Commencer gratuitement</Link>
              </Button>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <p className="text-sm font-semibold capitalize">{section}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
          <p className="text-xs">
            Données hébergées en UE · Auth Supabase · Conforme RGPD
          </p>
        </div>
      </div>
    </footer>
  );
}
