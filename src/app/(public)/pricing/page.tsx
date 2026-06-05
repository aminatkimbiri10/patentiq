import Link from "next/link";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    desc: "Porteurs de projets individuels",
    features: ["3 projets actifs", "Upload documents", "Recherche IA (bêta)", "Support email"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Sur devis",
    desc: "Équipes & cabinets CPI",
    features: [
      "Projets illimités",
      "Multi-utilisateurs & rôles",
      "Workflow CPI / expert",
      "Export & audit",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    desc: "Organisations & grands comptes",
    features: ["SSO & SLA", "API dédiée", "Hébergement EU", "Account manager"],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="section-padding">
      <div className="container">
        <PageHeader
          title="Tarifs transparents"
          description="Des offres adaptées à chaque acteur de la chaîne PI — du porteur de projet au cabinet."
          className="mx-auto max-w-2xl border-0 pb-0 text-center [&>div]:items-center"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "card-elevated flex flex-col p-6 sm:p-8",
                p.highlighted && "ring-2 ring-primary shadow-glow lg:scale-[1.02]"
              )}
            >
              {p.highlighted && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Populaire
                </span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <p className="mt-6 text-4xl font-bold tracking-tight">{p.price}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
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
                <Link href="/auth/register">Commencer</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
