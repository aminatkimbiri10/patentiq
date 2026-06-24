/**
 * Boucle worker IA locale (gratuit) — traite les analyses en file d'attente.
 * Usage : terminal 1 → npm run dev | terminal 2 → npm run ai:worker:loop
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const secret = process.env.AI_WORKER_SECRET;
const base =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const intervalMs = Number(process.env.AI_WORKER_INTERVAL_MS ?? 12_000);

if (!secret) {
  console.error(
    "[ai-worker-loop] AI_WORKER_SECRET manquant dans .env.local — analyses traitées en inline par l'API."
  );
  process.exit(1);
}

async function tick() {
  try {
    const res = await fetch(`${base}/api/ai/worker`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 5 }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[ai-worker-loop]", res.status, data.error ?? data);
      return;
    }
    if (data.processed > 0) {
      console.log(
        `[ai-worker-loop] ${new Date().toLocaleTimeString("fr-FR")} — ${data.processed} analyse(s) traitée(s)`
      );
    }
  } catch (e) {
    console.error("[ai-worker-loop] serveur injoignable — lancez npm run dev ?", e.message);
  }
}

console.log(`[ai-worker-loop] Démarré — ${base} — toutes les ${intervalMs / 1000}s`);
void tick();
setInterval(tick, intervalMs);
