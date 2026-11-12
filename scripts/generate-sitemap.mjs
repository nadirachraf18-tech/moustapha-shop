import { readFile, writeFile } from "node:fs/promises";

const siteHtml = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
const urlMatch = siteHtml.match(/const SB_URL='([^']+)'/);
const keyMatch = siteHtml.match(/SB_KEY='([^']+)'/);
if (!urlMatch || !keyMatch) {
  throw new Error("Could not read the public Supabase configuration from site/index.html");
}

const supabaseUrl = urlMatch[1];
const anonKey = keyMatch[1];
const products = [];
const pageSize = 1000;

for (let offset = 0; ; offset += pageSize) {
  const endpoint = new URL("/rest/v1/products", supabaseUrl);
  endpoint.search = new URLSearchParams({
    select: "id",
    is_active: "eq.true",
    order: "created_at.desc",
    limit: String(pageSize),
    offset: String(offset),
  }).toString();

  const response = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Supabase products query failed (${response.status}): ${detail}`);
  }

  const batch = await response.json();
  if (!Array.isArray(batch)) {
    throw new Error("Supabase returned an unexpected products response");
  }

  products.push(...batch);
  if (batch.length < pageSize) break;
}

const baseUrl = "https://www.moustapha.shop";
const entries = [
  { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
  { loc: `${baseUrl}/privacy-policy`, priority: "0.3", changefreq: "yearly" },
  ...products
    .filter((product) => product.id !== null && product.id !== undefined)
    .map((product) => ({
      loc: `${baseUrl}/?product=${encodeURIComponent(String(product.id))}`,
      priority: "0.8",
      changefreq: "weekly",
    })),
];

const xmlEscape = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + entries.map((entry) =>
      `  <url>\n    <loc>${xmlEscape(entry.loc)}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    ).join("\n")
  + "\n</urlset>\n";

await writeFile(new URL("../site/sitemap.xml", import.meta.url), xml, "utf8");
console.log(`Generated sitemap with ${entries.length} URLs (${products.length} active products).`);
