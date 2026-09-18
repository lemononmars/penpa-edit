import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
const resMap = new Map(resolved.map(r => [r.orig, r.final]));

const lines = text.split(/\r?\n/);

let currentLS = "";
let currentSection = "";
let currentGenre = "";
let lastHeading = "";

const puzzles = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const lsMatch = line.match(/^LS\s*(\d+)/i);
  if (lsMatch) {
    currentLS = "LS" + lsMatch[1];
    currentGenre = "";
    lastHeading = "";
    continue;
  }

  // Check if heading / title
  if (line.startsWith("##") || (!line.includes("http") && !line.startsWith("*") && line.length < 80)) {
    lastHeading = line.replace(/^##\s*/, "").replace(/[*_]/g, "").trim();
  }

  // Find Penpa URLs
  const urls = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,\)]+$/, ""));
  for (let uIdx = 0; uIdx < urls.length; uIdx++) {
    const raw = urls[uIdx];
    const fin = resMap.get(raw) || raw;
    if (!fin.includes("penpa-edit")) continue;

    // Determine name/title
    let title = lastHeading || currentLS;
    
    // Check if line specifies "Example" or "Puzzle"
    let role = "puzzle";
    const lineLower = line.toLowerCase();
    if (urls.length === 2 && uIdx === 0) {
      role = "example";
    } else if (urls.length === 2 && uIdx === 1) {
      role = "puzzle";
    } else if (lineLower.includes("example") && !lineLower.includes("puzzle")) {
      role = "example";
    } else if (lineLower.includes("puzzle") && !lineLower.includes("example")) {
      role = "puzzle";
    }

    // Context hint
    let contextHint = line;
    if (line.includes("Example:") && line.includes("Puzzle:")) {
      contextHint = uIdx === 0 ? "Example" : "Puzzle";
    } else if (line.includes("🧑‍🏫")) {
      contextHint = "Example";
    }

    puzzles.push({
      ls: currentLS,
      heading: lastHeading,
      role: contextHint.includes("Example") ? "example" : role,
      lineSnippet: line.slice(0, 70),
      rawUrl: raw,
      finalUrl: fin
    });
  }
}

console.log(`Found ${puzzles.length} Penpa puzzles.`);
fs.writeFileSync("scratch/penpa_puzzles_metadata.json", JSON.stringify(puzzles, null, 2), "utf8");

for (let i = 0; i < puzzles.length; i++) {
  const p = puzzles[i];
  console.log(`[${i+1}] ${p.ls} | ${p.heading} (${p.role}) | ${p.rawUrl}`);
}
