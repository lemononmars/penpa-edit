import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const urlRegex = /https?:\/\/[^\s\)\>]+/g;
const rawUrls = [...new Set([...text.matchAll(urlRegex)].map(m => m[0].replace(/[.,\)]+$/, "")))];

async function resolveUrl(url) {
  if (!url.includes("tinyurl.com")) {
    return url;
  }
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    const loc = res.headers.get("location");
    if (loc) return loc;
    return url;
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

async function main() {
  const map = [];
  for (let i = 0; i < rawUrls.length; i++) {
    const u = rawUrls[i];
    const final = await resolveUrl(u);
    console.log(`[${i+1}/${rawUrls.length}] ${u} -> ${final.slice(0, 70)}...`);
    map.push({ orig: u, final });
  }
  fs.writeFileSync("scratch/resolved_all_exact.json", JSON.stringify(map, null, 2), "utf8");
  console.log("Done resolving exact URLs.");
}

main();
