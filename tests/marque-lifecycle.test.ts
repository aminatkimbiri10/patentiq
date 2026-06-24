import { describe, expect, it } from "vitest";
import {
  isMarqueCategory,
  isBrevetCategory,
  parseMarqueLifecycle,
  computeOppositionDeadline,
} from "@/lib/workflow/marque-lifecycle";

describe("marque lifecycle", () => {
  it("detects marque category", () => {
    expect(isMarqueCategory("marque")).toBe(true);
    expect(isBrevetCategory("brevet")).toBe(true);
  });

  it("parses lifecycle from metadata", () => {
    const lc = parseMarqueLifecycle({
      marque_lifecycle: { status: "publie", published_at: "2024-01-01T00:00:00Z" },
    });
    expect(lc?.status).toBe("publie");
  });

  it("computes opposition deadline +2 months", () => {
    const d = computeOppositionDeadline("2024-01-15T00:00:00.000Z");
    expect(new Date(d).getMonth()).toBe(2);
  });
});
