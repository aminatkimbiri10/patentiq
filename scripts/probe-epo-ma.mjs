import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const key = env.match(/EPO_OPS_CONSUMER_KEY=(.+)/)?.[1]?.trim();
const secret = env.match(/EPO_OPS_CONSUMER_SECRET=(.+)/)?.[1]?.trim();
const BASE = "https://ops.epo.org/3.2";

const queries = [
  '(txt all "veste") and pa=MA',
  '(txt all "veste") and pn=MA',
  '(txt all "veste") and MA',
  "txt all \"veste\" and pn=MA",
  "ta=veste and pn=MA",
  "ta=veste and MA",
  '(txt all "zzzznonexistent12345") and pn=MA',
];

const cred = Buffer.from(`${key}:${secret}`).toString("base64");
const authRes = await fetch(`${BASE}/auth/accesstoken`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${cred}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "grant_type=client_credentials",
});
const { access_token } = await authRes.json();

for (const q of queries) {
  const url = `${BASE}/rest-services/published-data/search/biblio?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/exchange+xml",
      "X-OPS-Range": "1-3",
    },
  });
  const body = await res.text();
  const count = (body.match(/exchange-document/gi) ?? []).length;
  console.log(`${res.status} hits=${count} :: ${q}`);
  if (!res.ok) console.log(body.slice(0, 250));
}
