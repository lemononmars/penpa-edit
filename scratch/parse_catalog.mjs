import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
const resMap = new Map(resolved.map(r => [r.orig, r.final]));

// We will parse logic showcase.txt section by section and extract puzzle titles
const sections = text.split(/(?=LS\s*\d+)/i);
const catalog = [];

for (const sec of sections) {
  const lines = sec.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) continue;
  const lsMatch = lines[0].match(/^LS\s*(\d+)/i);
  if (!lsMatch) continue;
  const lsName = "LS" + lsMatch[1];

  let currentTitle = "";
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const urls = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,\)]+$/, ""));

    if (urls.length === 0) {
      if (!line.startsWith("*") && !line.startsWith("Clarification") && line.length < 100) {
        currentTitle = line.replace(/^##\s*/, "").replace(/[*_]/g, "").trim();
      }
      continue;
    }

    // Line has URLs
    // Let's filter for penpa URLs
    const penpaUrls = urls.filter(u => (resMap.get(u) || u).includes("penpa-edit"));
    if (penpaUrls.length === 0) continue;

    // What title does this belong to?
    // Check if line itself has a title prefix (e.g. "Skyscrapers ...", "Slitherlink (Polygraph)...")
    let lineTitle = "";
    if (line.startsWith("Entry") || line.startsWith("Rules:")) {
      lineTitle = line.split("Rules:")[0].trim();
      if (!lineTitle && currentTitle) lineTitle = currentTitle;
    } else {
      const match = line.match(/^([A-Za-z0-9\s\(\)\-\'\"]+?)(Rules:|Shade|Place|Connect|Divide|Draw|Normal|Standard|\b1\.\b|\bPuzzle:|\bExample:)/i);
      if (match && match[1].trim().length > 2 && match[1].trim().length < 50) {
        lineTitle = match[1].trim();
      } else if (currentTitle) {
        lineTitle = currentTitle;
      }
    }

    // If still empty, check if line starts with something
    if (!lineTitle) {
      lineTitle = currentTitle || "Puzzle";
    }

    // Process each penpa URL
    for (let uIdx = 0; uIdx < penpaUrls.length; uIdx++) {
      const u = penpaUrls[uIdx];
      let role = "puzzle";
      const lineBeforeUrl = line.slice(0, line.indexOf(u));
      const lineLower = line.toLowerCase();
      
      if (penpaUrls.length === 2) {
        role = uIdx === 0 ? "example" : "puzzle";
      } else if (lineBeforeUrl.toLowerCase().includes("example")) {
        role = "example";
      } else if (lineBeforeUrl.toLowerCase().includes("puzzle") || lineBeforeUrl.toLowerCase().includes("solving links")) {
        role = "puzzle";
      } else if (lineLower.includes("example") && !lineLower.includes("puzzle")) {
        role = "example";
      }

      catalog.push({
        ls: lsName,
        title: lineTitle,
        role,
        origUrl: u,
        finalUrl: resMap.get(u) || u,
        fullLine: line
      });
    }
  }
}

console.log(`Extracted ${catalog.length} penpa puzzles into catalog.`);
fs.writeFileSync("scratch/parsed_catalog.json", JSON.stringify(catalog, null, 2), "utf8");

for (let i = 0; i < catalog.length; i++) {
  const c = catalog[i];
  console.log(`[${i+1}] ${c.ls} | ${c.title} (${c.role}) | ${c.origUrl}`);
}
