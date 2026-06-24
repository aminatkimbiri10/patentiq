import { describe, it, expect } from "vitest";
import {
  isCpiStatusTransitionAllowed,
  getGuidedCpiStatusOptions,
} from "@/lib/workflow/status-transitions";

describe("CPI status transitions", () => {
  it("allows in_review to expert_review", () => {
    expect(isCpiStatusTransitionAllowed("in_review", "expert_review")).toBe(true);
  });

  it("blocks submitted to approved", () => {
    expect(isCpiStatusTransitionAllowed("submitted", "approved")).toBe(false);
  });

  it("includes current status in guided options", () => {
    const options = getGuidedCpiStatusOptions("cpi_review");
    expect(options).toContain("cpi_review");
    expect(options).toContain("approved");
  });
});
