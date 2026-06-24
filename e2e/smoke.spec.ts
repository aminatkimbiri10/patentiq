import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("health endpoint returns JSON status", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok() || res.status() === 503).toBeTruthy();

    const body = await res.json();
    expect(body.service).toBe("patent-platform");
    expect(body).toHaveProperty("checks");
    expect(body.checks).toHaveProperty("supabase");
    expect(body.checks).toHaveProperty("aiWorker");
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/auth/register", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Créer un compte" })).toBeVisible({
      timeout: 45_000,
    });
  });
});
