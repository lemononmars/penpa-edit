import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const lines = text.split(/\r?\n/);
let currentLS = "";
let currentPuzzle = "";

const entries = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  if (line.match(/^LS\s*\d+/i)) {
    currentLS = line;
    continue;
  }

  // Look for URLs
  const urls = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0]);
  if (urls.length > 0) {
    entries.push({
      ls: currentLS,
      line: line,
      urls: urls
    });
  }
}

const out = [`Lines read: ${lines.length}`, `Entries found: ${entries.length}`];
for (const e of entries) {
  out.push(`[${e.ls}] ${e.urls.join(" | ")} \n  TXT: ${e.line}`);
}
fs.writeFileSync("scratch/out.txt", out.join("\n"), "utf8");


