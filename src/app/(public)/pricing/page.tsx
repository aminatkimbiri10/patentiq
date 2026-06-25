import Link from "next/link";
import { Check, Phone } from "lucide-react";
import { PublicPageHero } from "@/components/layout/public-page-hero";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { i2paBrand } from "@/config/i2pa-brand";
import { siteConfig } from "@/config/site";

const offers = [
  {
    name: "Consultation initiale",
    price: "Sur rendez-vous",
    desc: "Premier échange pour cadrer votre besoin PI (brevet, marque, dessin).",
    features: [
      "Analyse de votre situation",
      "Recommandations stratégiques",
      "Devis personnalisé",
      "Sans engagement",
    ],
    highlighted: false,
    cta: "Prendre contact",
    href: "/contact",
  },
  {
    name: "Accompagnement dossier",
    price: "Forfait sur mesure",
    desc: "Dépôt, suivi et gestion de votre dossier OMPIC avec votre conseil CPI.",
    features: [
      "Espace client I2PA",
      "Documents & checklist",
      "Parcours PI guidé (marque / brevet)",
      "Échanges sécurisés avec le cabinet",
      "Surveillance post-enregistrement",
    ],
    highlighted: true,
    cta: "Demander un devis",
    href: "/contact",
  },
  {
    name: "Entreprise & portefeuille",
    price: "Contrat annuel",
    desc: "PME et organisations avec plusieurs actifs PI à piloter.",
    features: [
      "Multi-projets & multi-utilisateurs",
      "Veille et alertes OMPIC",
      "Rapports et export dossier",
      "Interlocuteur dédié I2PA",
    ],
    highlighted: false,
    cta: "Parler à un expert",
    href: `tel:${siteConfig.contact.phoneTel}`,
  },
];

export default function PricingPage() {
  return (
    <div>
      <PublicPageHero
        eyebrow="Offres I2PA"
        title="Un accompagnement adapté à chaque projet"
        description="Pas de formule SaaS générique : chaque dossier est unique. Nous construisons avec vous la solution PI la plus pertinente."
      />

      <section className="section-padding !pt-10">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            {offers.map((p) => (
              <div
                key={p.name}
                className={cn(
                  "card-elevated flex flex-col p-6 sm:p-8",
                  p.highlighted && "ring-2 ring-primary/30 shadow-md lg:-translate-y-1"
                )}
              >
                {p.highlighted && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Recommandé
                  </span>
                )}
                <h3 className="text-xl font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                <p className="mt-6 text-2xl font-semibold tracking-tight text-foreground">{p.price}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={p.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href={p.href}>{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="pro-surface-muted mx-auto mt-14 max-w-3xl text-center">
            <p className="text-sm font-medium text-foreground">
              Accès plateforme {siteConfig.productLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              L&apos;espace client est inclus dans nos prestations d&apos;accompagnement. Créez votre
              compte pour collaborer avec votre conseil CPI sur vos dossiers en cours.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <Link href="/auth/register">Créer un compte</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={`tel:${i2paBrand.phoneTel}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {i2paBrand.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
