import { describe, it, expect } from "vitest";
import {
  projectAiSearchUrl,
  projectUrlForUser,
  projectMessagesUrl,
} from "@/lib/project-routes";
import { resolveProjectTab } from "@/lib/project-tabs";

const project = {
  owner_id: "owner-1",
  assigned_to: "cpi-1",
  expert_id: "expert-1",
};

describe("projectUrlForUser", () => {
  it("routes CPI to case page", () => {
    expect(projectUrlForUser("p1", "cpi-1", project)).toBe("/cpi/cases/p1");
  });

  it("routes CPI search tab to IA on case page", () => {
    expect(projectUrlForUser("p1", "cpi-1", project, "search")).toBe(
      "/cpi/cases/p1?tab=ia&section=new"
    );
  });

  it("routes CPI tasks to dossier tab", () => {
    expect(projectUrlForUser("p1", "cpi-1", project, "tasks")).toBe(
      "/cpi/cases/p1?tab=dossier"
    );
  });

  it("routes expert to expert project page", () => {
    expect(projectUrlForUser("p1", "expert-1", project)).toBe("/expert/projects/p1");
  });

  it("routes owner to grouped dashboard tabs", () => {
    expect(projectUrlForUser("p1", "owner-1", project, "tasks")).toBe(
      "/dashboard/projects/p1?tab=echanges&section=tasks"
    );
    expect(projectUrlForUser("p1", "owner-1", project, "search")).toBe(
      "/dashboard/projects/p1?tab=search"
    );
    expect(projectUrlForUser("p1", "owner-1", project, "messages")).toBe(
      "/dashboard/projects/p1?tab=echanges&section=messages"
    );
  });
});

describe("projectAiSearchUrl", () => {
  it("includes type for CPI prior art", () => {
    expect(projectAiSearchUrl("p1", "cpi", "novelty")).toBe(
      "/cpi/cases/p1?tab=ia&section=new&type=novelty"
    );
  });
});

describe("projectMessagesUrl", () => {
  it("uses role-aware paths", () => {
    expect(projectMessagesUrl("p1", "cpi-1", project)).toBe("/cpi/cases/p1?tab=echanges");
    expect(projectMessagesUrl("p1", "owner-1", project)).toBe(
      "/dashboard/projects/p1?tab=echanges&section=messages"
    );
  });
});

describe("resolveProjectTab", () => {
  it("maps legacy tab names", () => {
    expect(resolveProjectTab("tasks").tab).toBe("echanges");
    expect(resolveProjectTab("tasks").echangesSection).toBe("tasks");
    expect(resolveProjectTab("documents").tab).toBe("documents");
    expect(resolveProjectTab("activity").tab).toBe("overview");
    expect(resolveProjectTab(null).tab).toBe("overview");
    expect(resolveProjectTab("search", "history").searchSection).toBe("history");
    expect(resolveProjectTab("search").searchSection).toBe("new");
    expect(resolveProjectTab("valorisation").tab).toBe("parcours");
    expect(resolveProjectTab("dossier", "parcours-pi").tab).toBe("parcours");
  });
});
