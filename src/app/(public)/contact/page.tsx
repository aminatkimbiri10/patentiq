import { Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@patentiq.io",
    hint: "Réponse sous 48h ouvrées",
  },
  {
    icon: MapPin,
    label: "Siège",
    value: "Paris, France",
    hint: "Hébergement données UE",
  },
  {
    icon: Clock,
    label: "Support",
    value: "Lun–Ven, 9h–18h CET",
    hint: "Plans Pro & Entreprise",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-mesh section-padding">
      <div className="container">
        <PageHeader
          eyebrow="Contact"
          title="Parlons de votre projet PI"
          description="Notre équipe vous accompagne pour une démo, un partenariat ou une question technique."
          className="mx-auto max-w-2xl border-0 pb-0 text-center"
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {contactInfo.map((item) => (
              <div key={item.label} className="card-elevated flex gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-semibold">{item.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground">
              <MessageSquare className="mb-2 h-5 w-5 text-primary" />
              Vous êtes cabinet PI ou expert ? Demandez un accès early adopter à{" "}
              <span className="font-medium text-foreground">{siteConfig.name}</span>.
            </div>
          </div>

          <div className="card-elevated p-6 sm:p-8 lg:col-span-3">
            <h2 className="text-lg font-semibold">Envoyer un message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Formulaire de contact — fonctionnalité bientôt disponible.
            </p>
            <form className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="vous@entreprise.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input id="subject" placeholder="Démo, partenariat, support…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} placeholder="Décrivez votre besoin…" />
              </div>
              <Button className="w-full sm:w-auto" disabled>
                Envoyer (bientôt)
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
