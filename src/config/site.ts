export const siteConfig = {
  name: "PatentIQ",
  description:
    "Plateforme professionnelle de gestion de la propriété intellectuelle — dossiers, collaboration CPI et workflows PI.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: "support@patentiq.example",
  brand: {
    blue: "#0A66C2",
  },
  /** Console dashboard : hébergeur / structure (stage I2PA). Surcharge via .env.local */
  organization: {
    name: process.env.NEXT_PUBLIC_ORG_NAME?.trim() || "I2PA",
    /** Si défini, remplace le logo vectoriel intégré (ex. PNG officiel) */
    logoUrl: process.env.NEXT_PUBLIC_ORG_LOGO_URL?.trim() || undefined,
  },
};
