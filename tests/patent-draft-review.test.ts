import { describe, expect, it } from "vitest";
import { reviewPatentDraft, analyzeDraftHeuristics } from "@/lib/ai/patent-draft-review";

describe("patent-draft-review", () => {
  it("flags a missing independent claim as a blocker", () => {
    const review = reviewPatentDraft({ independentClaim: null });
    const blocker = review.issues.find((i) => i.id === "no-independent-claim");
    expect(blocker?.severity).toBe("blocker");
    expect(review.level).toBe("à retravailler");
  });

  it("detects vague terms in claims", () => {
    const issues = analyzeDraftHeuristics({
      independentClaim: "1. Un dispositif comprenant environ trois éléments appropriés.",
    });
    const vague = issues.find((i) => i.id === "vague-terms");
    expect(vague).toBeDefined();
    expect(vague?.message.toLowerCase()).toContain("environ");
  });

  it("flags an abstract longer than 150 words", () => {
    const longAbstract = Array.from({ length: 160 }, () => "mot").join(" ");
    const issues = analyzeDraftHeuristics({
      independentClaim: "1. Un dispositif.",
      abstract: longAbstract,
    });
    expect(issues.some((i) => i.id === "abstract-too-long")).toBe(true);
  });

  it("detects a missing antecedent basis", () => {
    const issues = analyzeDraftHeuristics({
      independentClaim: "1. Un procédé utilisant ledit capteur pour mesurer une grandeur.",
    });
    const antecedent = issues.find((i) => i.id === "antecedent-basis");
    expect(antecedent).toBeDefined();
    expect(antecedent?.message.toLowerCase()).toContain("capteur");
  });

  it("gives a high score to a clean draft", () => {
    const review = reviewPatentDraft({
      title: "Dispositif de filtration portable",
      independentClaim:
        "1. Un dispositif de filtration comprenant une membrane et un boîtier reliés.",
      abstract: "Un dispositif de filtration portable et efficace.",
      description:
        "La présente invention permet de réduire l'encrassement et améliore le débit par rapport aux solutions connues. Mode de réalisation détaillé sur plusieurs variantes techniques offrant un avantage mesurable et un effet technique clair pour l'utilisateur final concerné.",
    });
    expect(review.score).toBeGreaterThanOrEqual(80);
    expect(review.level).toBe("solide");
  });
});
