import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  Shield,
  FileText,
  ArrowRight,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { OMPIC_PUBLIC_ENDPOINTS } from "@/lib/surveillance/ompic-provider";
import { siteConfig } from "@/config/site";

const CHECKLIST_MARQUE = [
  "Recherche d'antériorité marques (OMPIC + analyse IA)",
  "Classes Nice documentées dans le dossier",
  "Signes / logos déposés dans Documents",
  "Cycle marque renseigné (dépôt → publication 2 mois → enregistrement)",
  "Marque ajoutée au portefeuille Surveillance post-dépôt",
];

const CHECKLIST_BREVET = [
  "Résumé invention et besoin PI complétés",
  "Rédaction brevet — 5 sections OMPIC (Parcours PI)",
  "Revendications indépendante + dépendantes (zone confidentielle)",
  "Analyse nouveauté / FTO lancée (onglet Analyses IA)",
  "Export dossier HTML/PDF ou ZIP pour le CPI",
  "Cycle brevet — publication ~18 mois renseignée",
];

export function PreparerDepotOmpicContent({
  projectsHref,
  surveillanceHref,
}: {
  projectsHref: string;
  surveillanceHref: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Portail officiel de dépôt</p>
            <p className="mt-1 text-sm text-muted-foreground">
              directompic.ma — authentification renforcée (code sécurité)
            </p>
          </div>
          <Button asChild>
            <a
              href={OMPIC_PUBLIC_ENDPOINTS.directDepot}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ouvrir directompic.ma
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {siteConfig.productLabel} <strong className="text-foreground">prépare et structure</strong>{" "}
        le dossier — le dépôt officiel se fait sur le portail OMPIC. Suivez les checklists ci-dessous
        avant de vous connecter à{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">directompic.ma</code>.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection title="Dépôt marque" icon={FileText}>
          <ul className="space-y-2.5 p-5 pt-0 text-sm">
            {CHECKLIST_MARQUE.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border/80 px-5 py-3 text-xs text-muted-foreground">
            Fenêtre opposition : ~2 mois après publication au bulletin OMPIC.
          </p>
        </DashboardSection>

        <DashboardSection title="Dépôt brevet" icon={Shield}>
          <ul className="space-y-2.5 p-5 pt-0 text-sm">
            {CHECKLIST_BREVET.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border/80 px-5 py-3 text-xs text-muted-foreground">
            Publication indicative : ~18 mois (brevet national Maroc).
          </p>
        </DashboardSection>
      </div>

      <DashboardSection title="Liens utiles OMPIC" icon={Landmark}>
        <div className="flex flex-wrap gap-4 p-5 pt-0 text-sm">
          <a
            href={OMPIC_PUBLIC_ENDPOINTS.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ompic.ma
          </a>
          <a
            href="http://search.ompic.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            search.ompic.ma (marques)
          </a>
          <a
            href={OMPIC_PUBLIC_ENDPOINTS.patentPublication}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            patent.ompic.ma
          </a>
        </div>
      </DashboardSection>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={projectsHref}>
            Mes dossiers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={surveillanceHref}>Surveillance portefeuille</Link>
        </Button>
      </div>
    </div>
  );
}
