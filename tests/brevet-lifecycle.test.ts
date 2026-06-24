import { describe, expect, it } from "vitest";
import {
  computePublicationDeadline,
  parseBrevetLifecycle,
  defaultBrevetLifecycle,
} from "@/lib/workflow/brevet-lifecycle";

describe("brevet-lifecycle", () => {
  it("default status is depose", () => {
    expect(defaultBrevetLifecycle().status).toBe("depose");
  });

  it("parse brevet_lifecycle from metadata", () => {
    const lc = parseBrevetLifecycle({
      brevet_lifecycle: {
        status: "en_attente_publication",
        deposited_at: "2024-01-01T00:00:00.000Z",
        publication_deadline_at: "2025-07-01T00:00:00.000Z",
      },
    });
    expect(lc?.status).toBe("en_attente_publication");
    expect(lc?.deposited_at).toBeTruthy();
  });

  it("computePublicationDeadline adds 18 months", () => {
    const deadline = computePublicationDeadline("2024-01-15T12:00:00.000Z");
    const d = new Date(deadline);
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(6); // July (0-indexed)
  });
});
