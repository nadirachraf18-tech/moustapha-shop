import { readFile, writeFile } from "node:fs/promises";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const urlMatch = html.match(/const SB_URL='([^']+)'/);
const keyMatch = html.match(/SB_KEY='([^']+)'/);
if (!urlMatch || !keyMatch) {
  throw new Error("Supabase public configuration was not found in index.html");
}

const endpoint = new URL("/rest/v1/products", urlMatch[1]);
const headers = {
  apikey: keyMatch[1],
  Authorization: `Bearer ${keyMatch[1]}`,
  Accept: "application/json",
};
const pageSize = 1000;
const products = [];

for (let offset = 0; ; offset += pageSize) {
  const params = new URLSearchParams({
    select: "id",
    is_active: "eq.true",
    order: "created_at.desc",
    limit: String(pageSize),
    offset: String(offset),
  });
  const url = new URL(endpoint);
  url.search = params.toString();

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(
      `Supabase products query failed (${response.status}): ${(await response.text()).slice(0, 400)}`,
    );
  }

  const batch = await response.json();
  if (!Array.isArray(batch)) {
    throw new Error("Supabase returned an unexpected products response");
  }
  products.push(...batch);
  if (batch.length < pageSize) break;
}

const baseUrl = "https://www.moustapha.shop";
const urls = [
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

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);

const lastmod = new Date().toISOString().slice(0, 10);
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
    )
    .join("\n") +
  "\n</urlset>\n";

await writeFile(new URL("./sitemap.xml", import.meta.url), xml, "utf8");
console.log(
  `Generated sitemap.xml with ${urls.length} URLs: 2 fixed pages + ${products.length} active products.`,
);
