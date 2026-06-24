/**
 * Catalogue démo — en production : API / scraping OMPIC (voir docs/ROADMAP).
 */
export const OMPIC_STUB_CATALOG = [
  {
    title: "Coca Cola",
    ref: "MA-M-2019-004521",
    source: "ompic_stub",
    summary: "Marque verbale — boissons, classe 32.",
    kind: "trademark" as const,
  },
  {
    title: "Coca-Kola",
    ref: "MA-M-2024-011203",
    source: "ompic_stub",
    summary: "Marque verbale — boissons gazeuses, classe 32.",
    kind: "trademark" as const,
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/320px-Coca-Cola_logo.svg.png",
  },
  {
    title: "Koka Cola",
    ref: "MA-M-2023-008877",
    source: "ompic_stub",
    summary: "Marque mixte — boissons, classe 32.",
    kind: "trademark" as const,
    logo_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pepsi_logo_2014.svg/320px-Pepsi_logo_2014.svg.png",
  },
  {
    title: "Fresh Filter Bottle",
    ref: "MA-M-2022-003301",
    source: "ompic_stub",
    summary: "Marque verbale — gourdes et contenants, classe 21.",
    kind: "trademark" as const,
  },
  {
    title: "Gourde Filtrante Pro",
    ref: "MA-B-2021-000892",
    source: "ompic_stub",
    summary: "Brevet — dispositif de filtration portable.",
    kind: "patent" as const,
  },
  {
    title: "Smart Filter Cap",
    ref: "MA-B-2023-001104",
    source: "ompic_stub",
    summary: "Brevet — bouchon filtrant pour bouteille.",
    kind: "patent" as const,
  },
  {
    title: "Atlas Telecom",
    ref: "MA-M-2020-002100",
    source: "ompic_stub",
    summary: "Marque — télécommunications, classe 38.",
    kind: "trademark" as const,
  },
  {
    title: "Atlas Telcom",
    ref: "MA-M-2024-005678",
    source: "ompic_stub",
    summary: "Marque — services telecom, classe 38.",
    kind: "trademark" as const,
  },
] as const;

import type { IpAssetType } from "@/types/surveillance";

export function catalogForAssetType(assetType: IpAssetType): typeof OMPIC_STUB_CATALOG {
  if (assetType === "patent") {
    return OMPIC_STUB_CATALOG.filter((e) => e.kind === "patent") as unknown as typeof OMPIC_STUB_CATALOG;
  }
  return OMPIC_STUB_CATALOG.filter((e) => e.kind === "trademark") as unknown as typeof OMPIC_STUB_CATALOG;
}
