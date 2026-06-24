import { describe, expect, it } from "vitest";
import {
  classifyDeadlineUrgency,
  collectIpDeadlines,
  daysUntil,
  extractIpDeadlinesFromProject,
  shouldRemindDeadline,
} from "@/lib/workflow/ip-deadlines";

describe("ip-deadlines", () => {
  it("classifies urgency", () => {
    expect(classifyDeadlineUrgency(-1)).toBe("overdue");
    expect(classifyDeadlineUrgency(5)).toBe("critical");
    expect(classifyDeadlineUrgency(20)).toBe("soon");
    expect(classifyDeadlineUrgency(45)).toBe("ok");
  });

  it("extracts marque opposition deadline", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const deadlines = extractIpDeadlinesFromProject({
      id: "p1",
      title: "Marque X",
      metadata: {
        marque_lifecycle: {
          status: "publie",
          opposition_deadline_at: future.toISOString(),
        },
      },
      categories: { slug: "marque" },
    });
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0]?.kind).toBe("marque_opposition");
  });

  it("extracts brevet publication deadline", () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    const deadlines = extractIpDeadlinesFromProject({
      id: "p2",
      title: "Brevet Y",
      metadata: {
        brevet_lifecycle: {
          status: "en_attente_publication",
          publication_deadline_at: future.toISOString(),
        },
      },
      categories: { slug: "brevet" },
    });
    expect(deadlines[0]?.kind).toBe("brevet_publication");
  });

  it("shouldRemindDeadline within 30 days", () => {
    expect(shouldRemindDeadline(30)).toBe(true);
    expect(shouldRemindDeadline(-2)).toBe(true);
    expect(shouldRemindDeadline(45)).toBe(false);
  });

  it("sorts by days remaining", () => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 5);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 20);
    const sorted = collectIpDeadlines([
      {
        id: "a",
        title: "A",
        metadata: {
          marque_lifecycle: {
            status: "publie",
            opposition_deadline_at: d2.toISOString(),
          },
        },
      },
      {
        id: "b",
        title: "B",
        metadata: {
          marque_lifecycle: {
            status: "publie",
            opposition_deadline_at: d1.toISOString(),
          },
        },
      },
    ]);
    expect(sorted[0]?.projectId).toBe("b");
  });

  it("daysUntil counts calendar days", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    expect(daysUntil(tomorrow.toISOString())).toBe(1);
  });
});
