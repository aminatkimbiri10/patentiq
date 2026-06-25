import { i2paBrand } from "@/config/i2pa-brand";

export const siteConfig = {
  name: i2paBrand.name,
  productLabel: "Espace client I2PA",
  description:
    "Plateforme de gestion de la propriété intellectuelle — accompagnement brevets, marques et dessins & modèles par le cabinet I2PA.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: i2paBrand.contactEmail,
  brand: {
    blue: i2paBrand.primary,
    accent: i2paBrand.accent,
  },
  organization: {
    name: process.env.NEXT_PUBLIC_ORG_NAME?.trim() || i2paBrand.name,
    legalName: i2paBrand.legalName,
    tagline: i2paBrand.tagline,
    websiteUrl: i2paBrand.websiteUrl,
    logoUrl:
      process.env.NEXT_PUBLIC_ORG_LOGO_URL?.trim() || i2paBrand.defaultLogoUrl,
  },
  contact: {
    email: i2paBrand.contactEmail,
    phone: i2paBrand.phone,
    phoneTel: i2paBrand.phoneTel,
    address: i2paBrand.address,
    hours: i2paBrand.hours,
  },
};
