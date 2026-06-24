import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = path.resolve(__dirname, "../docs/SOUTENANCE_DETAILLEE_SCRIPTS.html");
const pdf = path.resolve(__dirname, "../docs/SOUTENANCE_DETAILLEE_SCRIPTS.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${html.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.pdf({
  path: pdf,
  format: "A4",
  margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
  printBackground: true,
});
await browser.close();
console.log("PDF genere:", pdf);
