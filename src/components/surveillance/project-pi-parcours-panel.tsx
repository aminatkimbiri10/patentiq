"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isBrevetCategory,
  isMarqueCategory,
  isDesignCategory,
  type MarqueLifecycleState,
  defaultMarqueLifecycle,
} from "@/lib/workflow/marque-lifecycle";
import {
  type BrevetLifecycleState,
  defaultBrevetLifecycle,
} from "@/lib/workflow/brevet-lifecycle";
import {
  type DesignLifecycleState,
  defaultDesignLifecycle,
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
import { ProjectSectionNav, type ProjectSectionItem } from "@/components/project/project-section-nav";

export type PiParcoursTab =
  | "cycle"
  | "redaction"
  | "revendications"
  | "denomination"
  | "irregularite";

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
  const isBrevet = isBrevetCategory(categorySlug);
  const isMarque = isMarqueCategory(categorySlug);
  const isDesign = isDesignCategory(categorySlug);

  const tabs: Array<{ id: PiParcoursTab; label: string }> = [{ id: "cycle", label: "Cycle OMPIC" }];
  if (isBrevet) {
    tabs.push({ id: "redaction", label: "Rédaction" });
    tabs.push({ id: "revendications", label: "Revendications" });
  }
  if (isMarque) {
    tabs.push({ id: "denomination", label: "Dénomination" });
  }
  tabs.push({ id: "irregularite", label: "Irrégularité OMPIC" });

  const [active, setActive] = useState<PiParcoursTab>(() =>
    resolvePiTab(searchParams.get("section"), searchParams.get("pi"))
  );

  useEffect(() => {
    setActive(resolvePiTab(searchParams.get("section"), searchParams.get("pi")));
  }, [searchParams]);

  const marqueState = marqueLifecycle ?? defaultMarqueLifecycle();
  const brevetState = brevetLifecycle ?? defaultBrevetLifecycle();
  const designState = designLifecycle ?? defaultDesignLifecycle();

  if (!isBrevet && !isMarque && !isDesign) {
    return (
      <p className="text-sm text-muted-foreground">
        Le parcours PI avancé s&apos;affiche pour les projets brevet, marque ou dessin &amp; modèle.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {isBrevet && (
        <div className="flex flex-wrap gap-2">
          <ExportPatentDossierButton
            projectId={projectId}
            disabled={!dossierHasExportableContent(patentDraft, patentClaims)}
          />
          <ExportProjectZipButton projectId={projectId} />
        </div>
      )}

      {!isBrevet && (isMarque || isDesign) && (
        <ExportProjectZipButton projectId={projectId} />
      )}

      {tabs.length > 1 && (
        <ProjectSectionNav
          active={active}
          onChange={setActive}
          sections={tabs as ProjectSectionItem<PiParcoursTab>[]}
        />
      )}

      {active === "cycle" && isMarque && (
        <div className="space-y-6">
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
        <div className="space-y-6">
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
        <div className="space-y-6">
          <PatentClaimsPanel projectId={projectId} draft={patentClaims} readOnly={readOnly} />
          <ClaimChartPanel projectId={projectId} />
        </div>
      )}

      {active === "denomination" && isMarque && <BrandNamePanel projectId={projectId} />}

      {active === "irregularite" && (
        <OmpicIrregularityPanel projectId={projectId} readOnly={readOnly} />
      )}
    </div>
  );
}
