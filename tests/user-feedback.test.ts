import { describe, expect, it } from "vitest";
import {
  formatAiSearchCompleteMessage,
  formatAlertStatusMessage,
  formatScanSourceLabel,
  formatWatchlistScanMessage,
} from "@/lib/messages/user-feedback";

describe("user-feedback messages", () => {
  it("formats scan source without internal jargon", () => {
    expect(formatScanSourceLabel("ompic_ma_trademark")).toBe("base OMPIC");
    expect(formatScanSourceLabel("live")).toBe("base OMPIC");
    expect(formatScanSourceLabel("epo_patent")).toBe("base brevets EPO");
  });

  it("formats watchlist scan messages", () => {
    expect(formatWatchlistScanMessage(0, "ompic_ma_trademark")).toContain("aucune nouvelle similarité");
    expect(formatWatchlistScanMessage(2, "live")).toContain("2 nouvelles alertes");
    expect(formatWatchlistScanMessage(1, "live")).toContain("1 nouvelle alerte");
  });

  it("formats alert status messages", () => {
    expect(formatAlertStatusMessage("acknowledged")).toContain("vue");
    expect(formatAlertStatusMessage("opposition_filed")).toContain("Opposition");
    expect(formatAlertStatusMessage("dismissed")).toContain("faux positif");
  });

  it("formats AI search completion", () => {
    expect(formatAiSearchCompleteMessage("completed", 3)).toContain("3 résultats");
    expect(formatAiSearchCompleteMessage("completed", 0)).toContain("aucun document");
    expect(formatAiSearchCompleteMessage("failed", 0, "timeout")).toContain("timeout");
  });
});
