import { describe, expect, it } from "vitest";
import {
  defaultDesignLifecycle,
  parseDesignLifecycle,
  DESIGN_LIFECYCLE_ORDER,
} from "@/lib/workflow/design-lifecycle";

describe("design-lifecycle", () => {
  it("default status is depose", () => {
    expect(defaultDesignLifecycle().status).toBe("depose");
  });

  it("parses design_lifecycle from metadata", () => {
    const lc = parseDesignLifecycle({
      design_lifecycle: {
        status: "publie",
        deposited_at: "2024-01-01T00:00:00.000Z",
        published_at: "2024-06-01T00:00:00.000Z",
      },
    });
    expect(lc?.status).toBe("publie");
    expect(lc?.published_at).toBeTruthy();
  });

  it("includes surveillance_active in order", () => {
    expect(DESIGN_LIFECYCLE_ORDER).toContain("surveillance_active");
    expect(DESIGN_LIFECYCLE_ORDER.indexOf("publie")).toBeLessThan(
      DESIGN_LIFECYCLE_ORDER.indexOf("surveillance_active")
    );
  });
});
