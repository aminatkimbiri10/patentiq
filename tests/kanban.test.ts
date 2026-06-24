import { describe, it, expect } from "vitest";
import { groupProjectsForKanban, isStaleCase } from "@/lib/cpi/kanban";
import type { Project } from "@/types/database";

function mockProject(overrides: Partial<Project>): Project {
  return {
    id: "id-1",
    title: "Test",
    description: null,
    invention_summary: null,
    need_description: null,
    status: "in_review",
    visibility: "private",
    owner_id: "o1",
    assigned_to: null,
    expert_id: null,
    category_id: null,
    reference_code: null,
    due_at: null,
    closed_at: null,
    last_activity_at: new Date().toISOString(),
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Project;
}

describe("kanban grouping", () => {
  it("groups by status and excludes draft", () => {
    const columns = groupProjectsForKanban([
      mockProject({ id: "1", status: "in_review" }),
      mockProject({ id: "2", status: "draft" }),
      mockProject({ id: "3", status: "cpi_review" }),
    ]);
    const inReview = columns.find((c) => c.status === "in_review");
    expect(inReview?.projects).toHaveLength(1);
    expect(columns.find((c) => c.status === "draft")).toBeUndefined();
  });
});

describe("isStaleCase", () => {
  it("flags old awaiting_documents", () => {
    const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(
      isStaleCase(mockProject({ status: "awaiting_documents", last_activity_at: old }))
    ).toBe(true);
  });

  it("ignores recent in_review", () => {
    expect(isStaleCase(mockProject({ status: "in_review" }))).toBe(false);
  });
});
