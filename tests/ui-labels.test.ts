import { describe, expect, it } from "vitest";
import {
  formatAiProviderLabelForUi,
  formatAiSearchStatusLabel,
} from "@/lib/messages/ui-labels";

describe("ui-labels", () => {
  it("formats AI search status in French", () => {
    expect(formatAiSearchStatusLabel("processing")).toBe("En cours");
    expect(formatAiSearchStatusLabel("completed")).toBe("Terminée");
    expect(formatAiSearchStatusLabel("failed")).toBe("Échouée");
  });

  it("provider label avoids stub jargon", () => {
    const label = formatAiProviderLabelForUi();
    expect(label.toLowerCase()).not.toContain("stub");
    expect(label.toLowerCase()).not.toContain("worker");
  });
});
