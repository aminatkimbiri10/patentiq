import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { landingConfig } from "@/config/landing";
import { siteConfig } from "@/config/site";
import { mailtoHref } from "@/lib/utils/mailto";

const footerLinks = {
  product: [
    { label: "Fonctionnalités", href: "/#fonctionnalites" },
    { label: "Parcours", href: "/#parcours" },
    { label: "Intelligence artificielle", href: "/#produit" },
    { label: "Sécurité", href: "/#securite" },
  ],
  solutions: [
    { label: "Porteurs & fondateurs", href: "/#solutions" },
    { label: "Incubateurs", href: "/#solutions" },
    { label: "Équipes innovation", href: "/#solutions" },
    { label: "Professionnels PI", href: "/#solutions" },
  ],
  resources: [
    { label: "Tarifs", href: "/#tarifs" },
    { label: "FAQ", href: "/#faq" },
    { label: "Guide", href: "/dashboard/guide" },
    { label: "Préparer dépôt OMPIC", href: "/dashboard/preparer-depot-ompic" },
  ],
  company: [
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Site I2PA", href: landingConfig.websiteUrl, external: true },
    { label: "Demander une consultation", href: "/contact" },
  ],
};

export function PublicFooter() {
  const org = siteConfig.organization;
  const contact = landingConfig.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container section-padding !py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <BrandLogo href="/" context="organization" showText={false} prominent />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {org.legalName} — cabinet en propriété intellectuelle.{" "}
              {landingConfig.productName} : plateforme pour piloter vos dossiers PI.
            </p>
            <p className="mt-4">
              <Link
                href="/contact"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Demander une consultation →
              </Link>
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Produit</p>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.product.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Solutions</p>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.solutions.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Ressources</p>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.resources.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Entreprise</p>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.company.map((l) => (
                <li key={l.label}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-6 border-t border-border/60 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Contact</p>
            <p className="mt-2">
              <a href={`tel:${contact.phoneTel}`} className="hover:text-primary">
                {contact.phone}
              </a>
            </p>
            <p>
              <a
                href={mailtoHref(contact.email)}
                className="hover:text-primary"
              >
                {contact.email}
              </a>
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Adresse</p>
            <p className="mt-2">{contact.address}</p>
            <p>{contact.hours}</p>
          </div>
          <div className="text-sm text-muted-foreground lg:text-right">
            <p>
              © {year}{" "}
              <a href={org.websiteUrl} className="hover:text-primary">
                {org.name}
              </a>
              . Tous droits réservés.
            </p>
            <p className="mt-1">{landingConfig.productName} · HTTPS</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
