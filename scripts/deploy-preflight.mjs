#!/usr/bin/env node
/**
 * Vérifie les variables requises avant déploiement Vercel.
 * Usage : node scripts/deploy-preflight.mjs
 * Charge .env.local si présent (dev) ; en CI, lit process.env.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "AI_WORKER_SECRET",
];

const RECOMMENDED = [
  "HUGGINGFACE_API_KEY",
  "OMPIC_SEARCH_MODE",
  "EPO_OPS_CONSUMER_KEY",
  "EPO_OPS_CONSUMER_SECRET",
];

let failed = false;

console.log("\n=== PatentIQ — pré-vol déploiement ===\n");

for (const key of REQUIRED) {
  const val = process.env[key]?.trim();
  if (!val || val.includes("your-") || val === "change-me-in-production") {
    console.log(`✗ ${key} — manquant ou valeur placeholder`);
    failed = true;
  } else {
    const preview = key.includes("SECRET") || key.includes("KEY") ? "••••" : val.slice(0, 48);
    console.log(`✓ ${key} = ${preview}${val.length > 48 ? "…" : ""}`);
  }
}

console.log("\n--- Recommandé ---\n");

for (const key of RECOMMENDED) {
  const val = process.env[key]?.trim();
  console.log(val ? `✓ ${key}` : `○ ${key} — optionnel mais utile en prod`);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
if (appUrl.startsWith("http://localhost")) {
  console.log(
    "\n⚠ NEXT_PUBLIC_APP_URL pointe encore vers localhost — mettez l’URL Vercel avant le déploiement."
  );
  failed = true;
}

if (appUrl && !appUrl.startsWith("https://")) {
  console.log("\n⚠ NEXT_PUBLIC_APP_URL doit être en HTTPS en production.");
  failed = true;
}

console.log(
  failed
    ? "\n→ Corrigez les variables puis relancez. Voir docs/DEPLOYMENT.md\n"
    : "\n→ Prêt pour Vercel. Pensez aux Redirect URLs Supabase (docs/DEPLOYMENT.md §4).\n"
);

process.exit(failed ? 1 : 0);
