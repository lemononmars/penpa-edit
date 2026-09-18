import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const urlRegex = /https?:\/\/[^\s\)\>]+/g;
const urls = [...new Set([...text.matchAll(urlRegex)].map(m => m[0].replace(/[.,]+$/, "")))];

async function resolveUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.url;
  } catch (e) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      return res.url;
    } catch (err) {
      return `ERROR: ${err.message}`;
    }
  }
}

async function main() {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    console.log(`[${i+1}/${urls.length}] Resolving ${u}`);
    let finalUrl = u;
    if (u.includes("tinyurl.com")) {
      finalUrl = await resolveUrl(u);
    }
    results.push({ orig: u, final: finalUrl });
  }

  fs.writeFileSync("scratch/resolved_urls.json", JSON.stringify(results, null, 2), "utf8");
  console.log("Finished resolving URLs.");
}

main();
