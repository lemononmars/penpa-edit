import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
const resMap = new Map(resolved.map(r => [r.orig, r.final]));

const lines = text.split(/\r?\n/);

let currentLS = "LS00";
let lastTitle = "";
const items = [];

for (let i = 0; i < lines.length; i++) {
  const rawLine = lines[i];
  const line = rawLine.trim();
  if (!line) continue;

  const lsMatch = line.match(/^LS\s*(\d+)/i);
  if (lsMatch) {
    currentLS = "LS" + lsMatch[1].padStart(2, "0");
    lastTitle = "";
    continue;
  }

  // Find URLs
  const urls = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,\)]+$/, ""));
  const penpaUrls = urls.filter(u => (resMap.get(u) || u).includes("penpa-edit"));

  if (penpaUrls.length === 0) {
    // Title or rule line without penpa URLs
    if (!line.startsWith("*") && !line.startsWith("Clarification") && line.length < 90) {
      lastTitle = line.replace(/^##\s*/, "").replace(/[*_]/g, "").trim();
    }
    continue;
  }

  // Line contains Penpa URL(s)
  // Let's determine title from line or lastTitle
  let title = lastTitle;
  
  // Specific heuristics for lines that have the title inline
  if (line.includes("Twilight Canal View")) title = "Twilight Canal View";
  else if (line.includes("Twilight Kurodoko")) title = "Twilight Kurodoko";
  else if (line.includes("L-Voxas")) title = "L-Voxas";
  else if (line.includes("L shape with a width of one cell. Each dot marks")) title = "L-Dots";
  else if (line.includes("Skyscrapers")) title = "Skyscrapers";
  else if (line.includes("Slitherlink (Polygraph)")) title = "Slitherlink Polygraph";
  else if (line.includes("Choco Banana Treasure Hunt")) title = "Choco Banana Treasure Hunt";
  else if (line.includes("Foreshadow Crossing")) title = "Foreshadow Crossing";
  else if (line.includes("Remembered Choco Frozen Banana")) title = "Remembered Choco Frozen Banana";
  else if (line.includes("Pentominous (outside)")) title = "Pentominous Outside";
  else if (line.includes("Guide Exit")) title = "Guide Exit";
  else if (line.includes("Ice Walk (delayed)")) title = "Ice Walk Delayed";
  else if (line.includes("Kurotto Banana")) title = "Kurotto Banana";
  else if (line.includes("Disorderly Tapa-like Loop")) title = "Disorderly Tapa-like Loop";
  else if (line.includes("Instructionless")) title = "Instructionless";
  else if (line.includes("Territory (One Square)")) title = "Territory One Square";
  else if (line.includes("Choco Banana (One Square)")) title = "Choco Banana One Square";
  else if (line.includes("Balance Loop (one hidden white)")) title = "Balance Loop Hidden White";
  else if (line.includes("Canal View (Connected)")) title = "Canal View Connected";
  else if (line.includes("Masyu (Connected)")) title = "Masyu Connected";
  else if (line.includes("Entry C1")) title = "Contact Equal Sign";
  else if (line.includes("Entry C2")) title = "Contact Plus";
  else if (line.includes("Entry C3")) title = "Contact Lenses";
  else if (line.includes("Entry R1")) title = "Rampage Tilted Square";
  else if (line.includes("Entry R2")) title = "Rampage Ox Loops";
  else if (line.includes("Entry R3")) title = "Roadblocks";
  else if (line.includes("Entry T1")) title = "Turnaround Spiral";
  else if (line.includes("Slitherlink (Full) + Turnaround (Full)")) title = "Slitherlink Turnaround Full";
  else if (line.includes("Mirror Loop")) title = "Mirror Loop";
  else if (line.includes("Tapa Rope")) title = "Tapa Rope";
  else if (line.includes("Canal View (Disco)")) title = "Canal View Disco";
  else if (line.includes("Pentominous (Partial)")) title = "Pentominous Partial";
  else if (line.includes("Choco Banana (Inequality)")) title = "Choco Banana Inequality";
  else if (line.includes("Pattern Square (Size)")) title = "Pattern Square Size";
  else if (line.includes("Pattern Square (CTS)")) title = "Pattern Square CTS";
  else if (line.includes("Yajiring-ring")) title = "Yajiring-ring";
  else if (line.includes("Alphabet Asp")) title = "Alphabet Asp";
  else if (line.includes("Choco Banana Tower")) title = "Choco Banana Tower";
  else if (line.includes("Pencils (Look-Air)")) title = "Pencils Look-Air";
  else if (line.includes("Pentominous (Myopia)")) title = "Pentominous Myopia";
  else if (line.includes("Choco Banana (Thermo)")) title = "Choco Banana Thermo";
  else if (line.includes("Pentominous (Irrwisch)")) title = "Pentominous Irrwisch";
  
  if (!title) {
    title = lastTitle || "Puzzle";
  }

  for (let uIdx = 0; uIdx < penpaUrls.length; uIdx++) {
    const u = penpaUrls[uIdx];
    let role = "puzzle";
    const lineLower = line.toLowerCase();
    if (penpaUrls.length === 2 && uIdx === 0) {
      role = "example";
    } else if (penpaUrls.length === 2 && uIdx === 1) {
      role = "puzzle";
    } else if (lineLower.includes("example") && !lineLower.includes("puzzle")) {
      role = "example";
    } else if (line.includes("Example:") && line.indexOf("Example:") < line.indexOf(u) && (line.indexOf("Puzzle:") === -1 || line.indexOf("Puzzle:") > line.indexOf(u))) {
      role = "example";
    }

    items.push({
      ls: currentLS,
      title: title,
      role: role,
      origUrl: u,
      finalUrl: resMap.get(u) || u,
      lineSnippet: line.slice(0, 80)
    });
  }
}

console.log(`Total catalog items: ${items.length}`);
fs.writeFileSync("scratch/exact_catalog.json", JSON.stringify(items, null, 2), "utf8");

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  console.log(`[${String(i+1).padStart(2, '0')}] ${item.ls} | ${item.title} (${item.role}) -> ${item.origUrl}`);
}
