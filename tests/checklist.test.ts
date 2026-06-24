import { describe, it, expect } from "vitest";
import { getChecklistTemplate } from "@/lib/checklists/templates";
import { checklistProgress, parseProjectChecklist } from "@/lib/checklists/parse";

describe("checklist templates", () => {
  it("returns brevet template for brevet slug", () => {
    const t = getChecklistTemplate("brevet");
    expect(t.slug).toBe("brevet");
    expect(t.items.length).toBeGreaterThan(3);
  });

  it("falls back to autre for unknown slug", () => {
    expect(getChecklistTemplate("unknown").slug).toBe("autre");
  });
});

describe("checklist progress", () => {
  it("computes percent", () => {
    const state = parseProjectChecklist({
      checklist: { checked: { a: true, b: false } },
    });
    const p = checklistProgress(["a", "b", "c"], state);
    expect(p.done).toBe(1);
    expect(p.total).toBe(3);
    expect(p.percent).toBe(33);
  });
});
