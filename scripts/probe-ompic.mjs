const urls = [
  "http://search.ompic.ma/web/pages/rechercheMarque.do",
  "https://search.ompic.ma/web/pages/rechercheMarque.do",
];

const body = "nomMarque=COCA&typeRech=0&debutRes=0&finRes=10&lang=FR&count=0";

async function probe(url) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body,
      signal: AbortSignal.timeout(45000),
    });
    const html = await res.text();
    const rowMatches = html.match(/rows\[\d+\]=new Array/g);
    console.log(url, "status", res.status, "len", html.length, "rows", rowMatches?.length ?? 0);
    if (html.toLowerCase().includes("maintenance")) console.log("  -> maintenance page");
    const sample = html.match(/rows\[0\]=new Array[^;]+/);
    if (sample) console.log("  sample:", sample[0].slice(0, 120));
  } catch (e) {
    console.log(url, "ERR", e.cause?.code ?? e.message);
  }
}

for (const u of urls) await probe(u);
