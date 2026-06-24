import Link from "next/link";
import {
  ExternalLink,
  CheckCircle2,
  Shield,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OMPIC_PUBLIC_ENDPOINTS } from "@/lib/surveillance/ompic-provider";

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
  "Analyse nouveauté / FTO lancée (onglet IA)",
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
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          OMPIC · Maroc
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Préparer un dépôt OMPIC
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          PatentIQ <strong>prépare et structure</strong> le dossier — le dépôt officiel se fait sur
          le portail OMPIC. Cette page reprend le parcours attendu par I2PA avant{" "}
          <code className="text-sm">directompic.ma</code>.
        </p>
      </div>

      <Card className="card-elevated border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="font-semibold">Portail officiel de dépôt</p>
            <p className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Dépôt marque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {CHECKLIST_MARQUE.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Fenêtre opposition : ~2 mois après publication au bulletin OMPIC.
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Dépôt brevet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {CHECKLIST_BREVET.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Publication indicative : ~18 mois (brevet national Maroc).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Liens utiles OMPIC</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <a
            href={OMPIC_PUBLIC_ENDPOINTS.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            ompic.ma
          </a>
          <a
            href="http://search.ompic.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            search.ompic.ma (marques)
          </a>
          <a
            href={OMPIC_PUBLIC_ENDPOINTS.patentPublication}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            patent.ompic.ma
          </a>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default">
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
