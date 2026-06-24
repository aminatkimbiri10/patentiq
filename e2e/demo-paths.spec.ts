import { test, expect } from "@playwright/test";

const PROTECTED_PI_ROUTES = [
  { path: "/dashboard/preparer-depot-ompic", name: "Préparer dépôt OMPIC (porteur)" },
  { path: "/dashboard/surveillance", name: "Surveillance (porteur)" },
  { path: "/dashboard/projects", name: "Mes projets" },
  { path: "/cpi/preparer-depot-ompic", name: "Préparer dépôt OMPIC (CPI)" },
  { path: "/cpi/surveillance", name: "Surveillance (CPI)" },
];

test.describe("Parcours PI — routes protégées", () => {
  for (const route of PROTECTED_PI_ROUTES) {
    test(`${route.name} redirige vers la connexion`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
    });
  }
});

test.describe("Parcours PI — authentifié (optionnel)", () => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
  const hasCredentials = Boolean(email && password);

  test.skip(!hasCredentials, "Définir PLAYWRIGHT_TEST_EMAIL et PLAYWRIGHT_TEST_PASSWORD");

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("textbox", { name: "Email" }).fill(email!);
    await page.getByLabel("Mot de passe").fill(password!);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/\/(dashboard|cpi|expert|admin|auth\/check-email)/, {
      timeout: 45_000,
    });
  });

  test("page Préparer dépôt OMPIC — contenu marque et brevet", async ({ page }) => {
    test.skip(page.url().includes("check-email"), "Email non confirmé");

    await page.goto("/dashboard/preparer-depot-ompic", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Préparer un dépôt OMPIC/i })
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/directompic/i).first()).toBeVisible();
    await expect(page.getByText(/Dépôt marque/i)).toBeVisible();
    await expect(page.getByText(/Dépôt brevet/i)).toBeVisible();
  });

  test("page Surveillance — bannière mode OMPIC", async ({ page }) => {
    test.skip(page.url().includes("check-email"), "Email non confirmé");

    await page.goto("/dashboard/surveillance", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Surveillance/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/OMPIC/i).first()).toBeVisible();
  });

  test("navigation projet — onglets dossier accessibles", async ({ page }) => {
    test.skip(page.url().includes("check-email"), "Email non confirmé");

    await page.goto("/dashboard/projects", { waitUntil: "domcontentloaded" });
    const firstProject = page.locator('a[href*="/dashboard/projects/"]').first();
    const count = await firstProject.count();
    test.skip(count === 0, "Aucun projet — créer un dossier marque ou brevet avant le test");

    await firstProject.click();
    await expect(page.getByRole("tab", { name: /Dossier/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("tab", { name: /Dossier/i }).click();
    await expect(page.getByText(/Parcours PI|Documents|Checklist/i).first()).toBeVisible();
  });
});
