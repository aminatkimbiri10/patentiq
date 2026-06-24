import { describe, expect, it } from "vitest";
import { splitClaimElements } from "@/lib/ai/claim-chart";

describe("claim-chart splitClaimElements", () => {
  it("splits an independent claim into elements after the preamble", () => {
    const elements = splitClaimElements(
      "1. Un dispositif comprenant une membrane filtrante; un boîtier étanche; une pompe.",
      []
    );
    expect(elements.length).toBeGreaterThanOrEqual(3);
    expect(elements[0].toLowerCase()).toContain("membrane");
  });

  it("includes dependent claims as elements", () => {
    const elements = splitClaimElements("1. Un dispositif comprenant un capteur.", [
      "2. Le dispositif selon la revendication 1, où le capteur est optique.",
    ]);
    expect(elements.some((e) => e.toLowerCase().includes("optique"))).toBe(true);
  });

  it("returns an empty array when there is no claim", () => {
    expect(splitClaimElements(null, [])).toEqual([]);
  });

  it("caps the number of elements", () => {
    const many = Array.from({ length: 20 }, (_, i) => `${i + 2}. Variante ${i} du dispositif.`);
    const elements = splitClaimElements("1. Un dispositif comprenant un élément.", many);
    expect(elements.length).toBeLessThanOrEqual(8);
  });
});
