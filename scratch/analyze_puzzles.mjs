import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const resolved = JSON.parse(fs.readFileSync("scratch/resolved_urls.json"));
const resMap = new Map(resolved.map(r => [r.orig, r.final]));

const lines = text.split(/\r?\n/);
let currentLS = "";
const items = [];

let currentTitle = "";
let currentNotes = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  if (line.match(/^LS\s*\d+/i)) {
    currentLS = line;
    continue;
  }

  // Check if line contains URLs
  const urls = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,]+$/, ""));
  if (urls.length > 0) {
    // Extract title from line or previous lines
    let textWithoutUrls = line.replace(/https?:\/\/[^\s\)\>]+/g, "").trim();
    items.push({
      ls: currentLS,
      lineText: line,
      cleanText: textWithoutUrls,
      urls: urls.map(u => ({ orig: u, final: resMap.get(u) || u }))
    });
  }
}

fs.writeFileSync("scratch/parsed_items.json", JSON.stringify(items, null, 2), "utf8");
console.log(`Parsed ${items.length} URL entries.`);
