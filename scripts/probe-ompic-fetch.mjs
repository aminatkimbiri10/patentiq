import { fetchOmpicSearchPage } from "../src/lib/surveillance/ompic-fetch.ts";
import {
  parseOmpicTrademarkRows,
  extractOmpicResultCount,
} from "../src/lib/surveillance/ompic-trademark-search.ts";

const body = new URLSearchParams({
  nomMarque: "COCA",
  typeRech: "0",
  debutRes: "0",
  finRes: "10",
  lang: "FR",
  count: "0",
}).toString();

const result = await fetchOmpicSearchPage("/web/pages/rechercheMarque.do", body);
console.log("fetch", result.ok ? "OK" : result.error, result.ok ? result.url : result.tried);

if (result.ok) {
  const rows = parseOmpicTrademarkRows(result.html);
  const total = extractOmpicResultCount(result.html);
  console.log("total", total, "parsed", rows.length, rows.slice(0, 2));
}
