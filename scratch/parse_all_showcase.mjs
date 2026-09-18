import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
const resMap = new Map(resolved.map(r => [r.orig, r.final]));

const lines = text.split(/\r?\n/);
let currentLS = "";
let currentSectionPuzzles = [];
const allPuzzles = [];

let pendingTitle = "";

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const lsMatch = line.match(/^LS\s*(\d+)/i);
  if (lsMatch) {
    currentLS = "LS" + lsMatch[1];
    continue;
  }

  // Find all URLs in line
  const urlMatches = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,\)]+$/, ""));

  if (urlMatches.length === 0) {
    // This could be a title line
    if (!pendingTitle) {
      pendingTitle = line;
    } else {
      pendingTitle += " - " + line;
    }
    continue;
  }

  // Line has URLs
  let lineText = line;
  for (const u of urlMatches) {
    lineText = lineText.replace(u, "").trim();
  }

  const title = pendingTitle || lineText || "Untitled";
  pendingTitle = ""; // reset

  // Now process each URL
  for (let j = 0; j < urlMatches.length; j++) {
    const rawUrl = urlMatches[j];
    const finalUrl = resMap.get(rawUrl) || rawUrl;
    
    // Determine type: example vs puzzle
    let kind = "puzzle";
    const lowerLine = line.toLowerCase();
    if (urlMatches.length === 2 && j === 0 && (lowerLine.includes("example") || lowerLine.includes("entry"))) {
      kind = "example";
    } else if (lowerLine.includes("example") && !lowerLine.includes("puzzle")) {
      kind = "example";
    }

    allPuzzles.push({
      ls: currentLS,
      rawTitle: title,
      lineContext: line,
      urlIndex: j,
      urlCount: urlMatches.length,
      origUrl: rawUrl,
      finalUrl: finalUrl,
      kind
    });
  }
}

console.log(`Extracted ${allPuzzles.length} puzzle URL items.`);
fs.writeFileSync("scratch/all_puzzles_extracted.json", JSON.stringify(allPuzzles, null, 2), "utf8");
