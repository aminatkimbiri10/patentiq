import { processAiSearch } from "@/lib/ai/worker";

function resolveAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Lance le worker IA sans bloquer la réponse HTTP. */
export function queueAiSearchProcessing(searchId: string): void {
  const secret = process.env.AI_WORKER_SECRET;

  if (!secret) {
    void processAiSearch(searchId).catch((e) =>
      console.error("[ai] inline worker failed:", e)
    );
    return;
  }

  const url = `${resolveAppUrl()}/api/ai/worker`;
  void fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ searchId }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.warn("[ai] worker HTTP", res.status, "— traitement inline");
        await processAiSearch(searchId);
      }
    })
    .catch(async (e) => {
      console.error("[ai] worker queue failed — traitement inline:", e);
      await processAiSearch(searchId).catch((err) =>
        console.error("[ai] inline worker failed:", err)
      );
    });
}
