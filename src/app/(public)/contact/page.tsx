import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { PublicPageHero } from "@/components/layout/public-page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { mailtoHref } from "@/lib/utils/mailto";

export default function ContactPage() {
  const contact = siteConfig.contact;
  const mailLink = mailtoHref(contact.email, {
    subject: "Demande consultation PI — I2PA",
  });

  const contactInfo = [
    { icon: Phone, label: "Téléphone", value: contact.phone, href: `tel:${contact.phoneTel}` },
    { icon: Mail, label: "Email", value: contact.email, href: mailLink },
    { icon: MapPin, label: "Adresse", value: contact.address },
    { icon: Clock, label: "Horaires", value: contact.hours },
  ];

  return (
    <div>
      <PublicPageHero
        eyebrow="Contact I2PA"
        title="Demandez un accompagnement PI"
        description="Consultation brevets, marques, dessins & modèles — cabinet I2PA, Mohammedia."
      />

      <section className="section-padding !pt-10">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              {contactInfo.map((item) => {
                const inner = (
                  <>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-1 block text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                      )}
                    </div>
                  </>
                );
                return item.href ? (
                  <div key={item.label} className="card-elevated flex gap-4 p-5">
                    {inner}
                  </div>
                ) : (
                  <div key={item.label} className="card-elevated flex gap-4 p-5">
                    {inner}
                  </div>
                );
              })}
              <p className="px-1 text-sm text-muted-foreground">
                Ou visitez{" "}
                <a
                  href={siteConfig.organization.websiteUrl}
                  className="font-medium text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  i2pa.com
                </a>{" "}
                pour en savoir plus sur le cabinet.
              </p>
            </div>

            <div className="pro-surface lg:col-span-3">
              <h2 className="text-lg font-semibold">Envoyer un message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Décrivez votre projet — nous vous répondons sous 24 à 48 h ouvrées.
              </p>
              <form className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder={contact.email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Votre demande</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Brevet, marque, dessin & modèle, surveillance…"
                  />
                </div>
                <Button className="w-full sm:w-auto" asChild>
                  <a href={mailLink}>Envoyer par email</a>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
