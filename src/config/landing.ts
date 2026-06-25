import { i2paBrand } from "@/config/i2pa-brand";
import { siteConfig } from "@/config/site";

/** Contenu landing — aligné I2PA https://i2pa.com/ */
export const landingConfig = {
  productName: siteConfig.productLabel,
  orgName: i2paBrand.name,
  orgLegal: i2paBrand.legalName,
  tagline: i2paBrand.tagline,
  primaryCta: { label: "Demander une démo", href: "/contact" },
  secondaryCta: { label: "Découvrir les fonctionnalités", href: "#fonctionnalites" },
  signIn: { label: "Se connecter", href: "/auth/login" },
  pilotCta: { label: "Démarrer un pilote", href: "/contact" },

  nav: [
    { label: "Produit", href: "#produit" },
    { label: "Solutions", href: "#solutions" },
    { label: "Parcours", href: "#parcours" },
    { label: "Sécurité", href: "#securite" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Contact", href: "/contact" },
  ],

  hero: {
    eyebrow: i2paBrand.legalName,
    headline: "Transformez vos idées en projets PI structurés, validés et pilotés avec l'IA",
    subtitle:
      "Plateforme intelligente pour porteurs de projets, startups et équipes R&D : recherche, validation d'idées, analyse stratégique, documentation et suivi de dossiers — avec l'accompagnement du cabinet I2PA.",
    trustLine: "Cabinet I2PA · Mohammedia · Données isolées par dossier · 2FA disponible",
    benefits: [
      { title: "Assistance IA encadrée", desc: "Analyses, résumés et recommandations dans votre workflow PI." },
      { title: "Validation structurée", desc: "Checklists, complétude et prochaines étapes claires." },
      { title: "Gain de temps", desc: "Moins de dispersion, plus de visibilité sur vos dossiers." },
    ],
  },

  trust: {
    title: "La confiance des innovateurs au Maroc",
    subtitle: "I2PA accompagne entreprises, inventeurs et créateurs dans la protection de leurs actifs intellectuels.",
    metrics: [
      { value: "−40 %", label: "de temps sur la structuration initiale des dossiers" },
      { value: "100 %", label: "visibilité sur l'avancement et les échéances PI" },
      { value: "OMPIC", label: "surveillance et préparation alignées aux procédures marocaines" },
    ],
    partners: [
      "Startups tech",
      "PME industrielles",
      "Incubateurs",
      "Laboratoires R&D",
      "Porteurs de brevets",
      "Cabinets partenaires",
    ],
  },

  problemSolution: {
    title: "De l'idée dispersée au dossier prêt pour l'action",
    subtitle: "Les porteurs de projets perdent du temps faute d'un espace unique. Nous centralisons l'essentiel.",
    pains: [
      {
        pain: "Informations éparpillées",
        solution: "Un dossier unique : documents, messages, tâches et parcours PI au même endroit.",
      },
      {
        pain: "Difficulté à structurer l'idée",
        solution: "Checklists OMPIC, cycles marque/brevet et complétude guidée étape par étape.",
      },
      {
        pain: "Manque de visibilité stratégique",
        solution: "Tableaux de bord, échéances, surveillance et analyses IA pour décider sereinement.",
      },
    ],
  },

  features: [
    {
      title: "Assistant projet IA",
      desc: "Chat et analyses contextuelles sur vos documents et dossiers PI.",
    },
    {
      title: "Analyse documentaire",
      desc: "Upload sécurisé, OCR et extraction pour brevets, descriptifs et annexes.",
    },
    {
      title: "Hub recherche & veille",
      desc: "Recherche globale, similarités OMPIC et veille sur votre portefeuille.",
    },
    {
      title: "Workflow & tâches",
      desc: "Assignation CPI, checklist et suivi des actions entre porteur et conseil.",
    },
    {
      title: "Recommandations stratégiques",
      desc: "Avis expert, recommandations IA et export dossier pour décision.",
    },
    {
      title: "Collaboration sécurisée",
      desc: "Espaces porteur, CPI et expert avec traçabilité des échanges.",
    },
  ],

  workflow: [
    { step: "1", title: "Capturer l'idée", desc: "Créez un projet, décrivez l'invention ou la marque et déposez vos premiers documents." },
    { step: "2", title: "Analyser & structurer", desc: "Checklist, parcours PI, analyses IA et recherche d'antériorité encadrée." },
    { step: "3", title: "Valider & enrichir", desc: "Échanges CPI, revendications, rédaction et préparation avant dépôt OMPIC." },
    { step: "4", title: "Suivre l'exécution", desc: "Surveillance post-dépôt, échéances, alertes et export de dossier." },
  ],

  roles: [
    {
      title: "Porteurs & fondateurs",
      desc: "Structurez votre parcours PI sans vous perdre : un dossier, une vision claire, un CPI à vos côtés.",
    },
    {
      title: "Incubateurs",
      desc: "Offrez à vos startups un cadre professionnel pour préparer brevets et marques avant levée ou industrialisation.",
    },
    {
      title: "Équipes innovation",
      desc: "Pilotez plusieurs projets R&D, documents et échéances depuis un tableau de bord unifié.",
    },
    {
      title: "Professionnels PI",
      desc: "CPI et experts : revue dossier, surveillance OMPIC, rédaction et collaboration multi-rôles.",
    },
  ],

  ai: {
    title: "Intelligence artificielle au service de la propriété intellectuelle",
    subtitle: "Des modules IA encadrés — pas de boîte noire : vous gardez le contrôle sur vos données sensibles.",
    capabilities: [
      { title: "Assistant conversationnel", desc: "Questions-réponses sur le contenu de vos dossiers." },
      { title: "Recherche sémantique", desc: "Retrouvez projets, documents et analyses en un clic." },
      { title: "Résumés intelligents", desc: "Synthèse de documents longs pour accélérer la revue." },
      { title: "Recommandations", desc: "Pistes nouveauté, similarité et prochaines actions." },
      { title: "Analyse risques & opportunités", desc: "Éclairage stratégique avant dépôt ou extension." },
      { title: "Multilingue", desc: "Travail en français avec support de contenus internationaux." },
    ],
  },

  security: {
    title: "Sécurité & confidentialité",
    subtitle: "Vos inventions et revendications méritent un environnement de niveau entreprise.",
    items: [
      "Accès par rôles (porteur, CPI, expert, admin)",
      "Isolation des dossiers — Row Level Security",
      "Authentification renforcée (2FA authenticator)",
      "Journal d'audit des actions sensibles",
      "Documents confidentiels et export contrôlé",
      "Hébergement sécurisé HTTPS",
    ],
  },

  pricing: [
    {
      name: "Pilote Starter",
      price: "Sur mesure",
      desc: "Un porteur ou une startup — premier dossier accompagné.",
      features: ["1 projet actif", "Espace client I2PA", "Checklist & parcours PI", "Support email I2PA"],
      highlighted: false,
    },
    {
      name: "Équipe",
      price: "Forfait cabinet",
      desc: "PME et équipes innovation avec plusieurs dossiers.",
      features: [
        "Projets multiples",
        "Collaboration CPI intégrée",
        "Surveillance OMPIC",
        "Analyses IA & export dossier",
        "Interlocuteur I2PA dédié",
      ],
      highlighted: true,
    },
    {
      name: "Entreprise",
      price: "Contrat annuel",
      desc: "Organisations avec portefeuille PI structuré.",
      features: [
        "Multi-utilisateurs & rôles",
        "Veille & alertes avancées",
        "Paramétrage workflow",
        "SLA & accompagnement premium",
      ],
      highlighted: false,
    },
  ],

  faq: [
    {
      q: "À qui s'adresse la plateforme ?",
      a: "Aux porteurs de projets, startups, incubateurs, équipes R&D et professionnels PI qui souhaitent structurer, valider et piloter leurs dossiers brevets, marques et dessins & modèles avec le cabinet I2PA.",
    },
    {
      q: "Peut-on démarrer par un pilote ?",
      a: "Oui. Le plan Pilote Starter permet de tester l'espace client sur un premier dossier, avec l'accompagnement d'un conseil I2PA. Contactez-nous pour cadrer la durée et le périmètre.",
    },
    {
      q: "Les données sont-elles sécurisées ?",
      a: "Oui. Accès par rôle, isolation par dossier, authentification 2FA et traçabilité. Les documents sensibles restent dans votre espace — la confidentialité est essentielle avant tout dépôt OMPIC.",
    },
    {
      q: "La plateforme est-elle personnalisable ?",
      a: "Les workflows (assignation CPI, revue, expert) sont configurables côté cabinet. Les parcours marque, brevet et dessin s'adaptent au type de projet.",
    },
    {
      q: "Plusieurs rôles peuvent-ils collaborer ?",
      a: "Oui : porteur, conseil CPI, expert technique et administrateur disposent chacun d'un espace adapté, avec messages, tâches et historique partagés sur le dossier.",
    },
  ],

  finalCta: {
    headline: "Prêt à structurer votre prochain dossier PI ?",
    subtitle:
      "Réservez une démonstration avec I2PA ou démarrez un pilote encadré sur votre premier projet.",
  },

  contact: siteConfig.contact,
  websiteUrl: i2paBrand.websiteUrl,
} as const;
