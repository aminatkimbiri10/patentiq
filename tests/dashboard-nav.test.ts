import { describe, it, expect } from "vitest";
import { isNavItemActive, navHomeHref } from "@/lib/layout/dashboard-nav";
import { cpiNav, dashboardNav } from "@/config/navigation";

describe("dashboard-nav", () => {
  it("resolves home href by role", () => {
    expect(navHomeHref(cpiNav, "cpi_advisor")).toBe("/cpi");
    expect(navHomeHref(dashboardNav, "project_holder")).toBe("/dashboard");
  });

  it("does not mark dashboard active on project subpages", () => {
    expect(isNavItemActive("/dashboard/projects/1", "/dashboard")).toBe(false);
    expect(isNavItemActive("/dashboard/projects", "/dashboard/projects")).toBe(true);
  });
});
