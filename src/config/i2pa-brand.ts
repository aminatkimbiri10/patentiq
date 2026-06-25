/** Identité visuelle et coordonnées I2PA — alignées sur https://i2pa.com/ */
export const i2paBrand = {
  name: "I2PA",
  legalName: "International Intellectual Property Assistance",
  tagline: "Protéger, valoriser, innover",
  websiteUrl: "https://i2pa.com",
  contactEmail: "Contact@i2pa.com",
  phone: "(+212) 615 539 752",
  phoneTel: "+212615539752",
  address: "Lot Massira, Res. Costa del Sol, Mohammedia, Maroc",
  hours: "Lun – Ven : 09:00 – 18:00",
  /** Couleur principale (bleu institutionnel) */
  primary: "#1e3a5f",
  primaryDark: "#152a45",
  /** Accent discret (or / confiance) */
  accent: "#c9a227",
  /** Logo PNG officiel (public/logos/i2pa.png) */
  defaultLogoUrl: "/logos/i2pa.png",
} as const;

export const i2paServices = [
  { label: "Droit des brevets", href: "https://i2pa.com/" },
  { label: "Droit des marques", href: "https://i2pa.com/" },
  { label: "Dessins et modèles", href: "https://i2pa.com/" },
  { label: "Formation & assistance", href: "https://i2pa.com/" },
] as const;
