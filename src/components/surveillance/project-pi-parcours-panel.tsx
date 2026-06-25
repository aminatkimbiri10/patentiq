"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  isBrevetCategory,
  isMarqueCategory,
  isDesignCategory,
  type MarqueLifecycleState,
  defaultMarqueLifecycle,
  MARQUE_LIFECYCLE_LABELS,
  MARQUE_LIFECYCLE_ORDER,
} from "@/lib/workflow/marque-lifecycle";
import {
  type BrevetLifecycleState,
  defaultBrevetLifecycle,
  BREVET_LIFECYCLE_LABELS,
  BREVET_LIFECYCLE_ORDER,
} from "@/lib/workflow/brevet-lifecycle";
import {
  type DesignLifecycleState,
  defaultDesignLifecycle,
  DESIGN_LIFECYCLE_LABELS,
  DESIGN_LIFECYCLE_ORDER,
} from "@/lib/workflow/design-lifecycle";
import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import { PatentDraftPanel } from "@/components/surveillance/patent-draft-panel";
import { PatentDraftReviewPanel } from "@/components/surveillance/patent-draft-review-panel";
import { PatentClaimsPanel } from "@/components/surveillance/patent-claims-panel";
import { ClaimChartPanel } from "@/components/surveillance/claim-chart-panel";
import { MarqueLifecyclePanel } from "@/components/surveillance/marque-lifecycle-panel";
import { BrevetLifecyclePanel } from "@/components/surveillance/brevet-lifecycle-panel";
import { DesignLifecyclePanel } from "@/components/surveillance/design-lifecycle-panel";
import { WatchlistForm } from "@/components/surveillance/watchlist-form";
import { BrandNamePanel } from "@/components/surveillance/brand-name-panel";
import { OmpicIrregularityPanel } from "@/components/surveillance/ompic-irregularity-panel";
import { ExportPatentDossierButton } from "@/components/surveillance/export-patent-dossier-button";
import { ExportProjectZipButton } from "@/components/export/export-project-zip-button";
import { dossierHasExportableContent } from "@/lib/export/build-patent-dossier-html";
import { PiParcoursHeader } from "@/components/surveillance/pi-parcours/pi-parcours-header";
import {
  PiParcoursActiveHint,
  PiParcoursTabNav,
} from "@/components/surveillance/pi-parcours/pi-parcours-tab-nav";
import { lifecycleProgress } from "@/components/surveillance/pi-parcours/pi-lifecycle-stepper";
import type { PiParcoursTab } from "@/components/surveillance/pi-parcours/types";

export type { PiParcoursTab } from "@/components/surveillance/pi-parcours/types";

const PI_SECTION_ALIASES: Record<string, PiParcoursTab> = {
  "marque-cycle": "cycle",
  "brevet-cycle": "cycle",
  "design-cycle": "cycle",
  redaction: "redaction",
  revendications: "revendications",
  denomination: "denomination",
  irregularite: "irregularite",
};

function resolvePiTab(sectionParam: string | null, piParam: string | null): PiParcoursTab {
  if (
    piParam &&
    ["cycle", "redaction", "revendications", "denomination", "irregularite"].includes(piParam)
  ) {
    return piParam as PiParcoursTab;
  }
  if (sectionParam && PI_SECTION_ALIASES[sectionParam]) {
    return PI_SECTION_ALIASES[sectionParam];
  }
  return "cycle";
}

const TYPE_DESCRIPTIONS: Record<string, string> = {
  Marque: "Dépôt, publication 2 mois, opposition et enregistrement OMPIC.",
  Brevet: "Dépôt, examen, publication ~18 mois et délivrance.",
  "Dessin & modèle": "Dépôt, examen formel, publication et enregistrement.",
};

export function ProjectPiParcoursPanel({
  projectId,
  projectTitle,
  categorySlug,
  patentDraft,
  patentClaims,
  draftVersions = [],
  marqueLifecycle,
  brevetLifecycle,
  designLifecycle,
  canEdit,
  readOnly,
}: {
  projectId: string;
  projectTitle?: string;
  categorySlug?: string | null;
  patentDraft: PatentDraft | null;
  patentClaims: PatentClaimsDraft | null;
  draftVersions?: import("@/lib/actions/patent-draft-history").PatentDraftVersionRow[];
  marqueLifecycle?: MarqueLifecycleState;
  brevetLifecycle?: BrevetLifecycleState;
  designLifecycle?: DesignLifecycleState;
  canEdit: boolean;
  readOnly: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const isBrevet = isBrevetCategory(categorySlug);
  const isMarque = isMarqueCategory(categorySlug);
  const isDesign = isDesignCategory(categorySlug);

  const tabs = useMemo(() => {
    const list: PiParcoursTab[] = ["cycle"];
    if (isBrevet) {
      list.push("redaction", "revendications");
    }
    if (isMarque) list.push("denomination");
    list.push("irregularite");
    return list;
  }, [isBrevet, isMarque]);

  const [active, setActive] = useState<PiParcoursTab>(() =>
    resolvePiTab(searchParams.get("section"), searchParams.get("pi"))
  );

  useEffect(() => {
    setActive(resolvePiTab(searchParams.get("section"), searchParams.get("pi")));
  }, [searchParams]);

  const marqueState = marqueLifecycle ?? defaultMarqueLifecycle();
  const brevetState = brevetLifecycle ?? defaultBrevetLifecycle();
  const designState = designLifecycle ?? defaultDesignLifecycle();

  const headerMeta = useMemo(() => {
    if (isMarque) {
      return {
        typeLabel: "Marque",
        currentStepLabel: MARQUE_LIFECYCLE_LABELS[marqueState.status],
        progress: lifecycleProgress(MARQUE_LIFECYCLE_ORDER, marqueState.status),
      };
    }
    if (isBrevet) {
      return {
        typeLabel: "Brevet",
        currentStepLabel: BREVET_LIFECYCLE_LABELS[brevetState.status],
        progress: lifecycleProgress(BREVET_LIFECYCLE_ORDER, brevetState.status),
      };
    }
    return {
      typeLabel: "Dessin & modèle",
      currentStepLabel: DESIGN_LIFECYCLE_LABELS[designState.status],
      progress: lifecycleProgress(DESIGN_LIFECYCLE_ORDER, designState.status),
    };
  }, [isMarque, isBrevet, marqueState.status, brevetState.status, designState.status]);

  function selectTab(tab: PiParcoursTab) {
    setActive(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "parcours");
    params.set("pi", tab);
    if (tab === "cycle") params.delete("section");
    else params.set("section", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (!isBrevet && !isMarque && !isDesign) {
    return (
      <div className="enterprise-panel px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Le parcours PI avancé s&apos;affiche pour les projets brevet, marque ou dessin &amp; modèle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PiParcoursHeader
        typeLabel={headerMeta.typeLabel}
        currentStepLabel={headerMeta.currentStepLabel}
        progress={headerMeta.progress}
        description={TYPE_DESCRIPTIONS[headerMeta.typeLabel] ?? ""}
      />

      {(isBrevet || isMarque || isDesign) && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
          {isBrevet && (
            <>
              <ExportPatentDossierButton
                projectId={projectId}
                disabled={!dossierHasExportableContent(patentDraft, patentClaims)}
              />
              <ExportProjectZipButton projectId={projectId} />
            </>
          )}
          {!isBrevet && <ExportProjectZipButton projectId={projectId} />}
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <PiParcoursTabNav tabs={tabs} active={active} onSelect={selectTab} />

        <div className="min-w-0 flex-1">
          <PiParcoursActiveHint tab={active} />

          {active === "cycle" && isMarque && (
            <div className="space-y-5">
              <MarqueLifecyclePanel
                projectId={projectId}
                lifecycle={marqueState}
                canEdit={canEdit}
              />
              {marqueState.status === "surveillance_active" && (
                <WatchlistForm
                  projectId={projectId}
                  defaultTitle={projectTitle}
                  defaultAssetType="trademark"
                />
              )}
            </div>
          )}

          {active === "cycle" && isBrevet && (
            <BrevetLifecyclePanel
              projectId={projectId}
              lifecycle={brevetState}
              projectTitle={projectTitle}
              canEdit={canEdit}
            />
          )}

          {active === "cycle" && isDesign && (
            <DesignLifecyclePanel
              projectId={projectId}
              lifecycle={designState}
              projectTitle={projectTitle}
              canEdit={canEdit}
            />
          )}

          {active === "redaction" && isBrevet && (
            <div className="space-y-5">
              <PatentDraftPanel
                projectId={projectId}
                draft={patentDraft}
                readOnly={readOnly}
                draftVersions={draftVersions}
              />
              <PatentDraftReviewPanel projectId={projectId} />
            </div>
          )}

          {active === "revendications" && isBrevet && (
            <div className="space-y-5">
              <PatentClaimsPanel projectId={projectId} draft={patentClaims} readOnly={readOnly} />
              <ClaimChartPanel projectId={projectId} />
            </div>
          )}

          {active === "denomination" && isMarque && <BrandNamePanel projectId={projectId} />}

          {active === "irregularite" && (
            <OmpicIrregularityPanel projectId={projectId} readOnly={readOnly} />
          )}
        </div>
      </div>
    </div>
  );
}
