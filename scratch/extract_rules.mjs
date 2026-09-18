import fs from "node:fs";

const text = fs.readFileSync("logic showcase.txt", "utf8");
const lines = text.split(/\r?\n/);

// Split text by LS section
const sections = text.split(/(?=LS\s*\d+)/i);
const extracted = [];

for (const sec of sections) {
  const rawLines = sec.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (rawLines.length === 0) continue;
  const lsMatch = rawLines[0].match(/^LS\s*(\d+)/i);
  if (!lsMatch) continue;
  const ls = "LS" + lsMatch[1].padStart(2, "0");

  // We can group lines within the section by puzzle blocks
  // A puzzle block typically has:
  // - Title / Genre
  // - Rule text (bullets with * or text starting with Rules: or sentence)
  // - URL(s)
  
  // Let's break section into blocks separated by empty lines or lines with URLs
  let currentBlock = [];
  const blocks = [];
  
  const secLines = sec.split(/\r?\n/);
  for (let i = 1; i < secLines.length; i++) {
    const l = secLines[i].trim();
    if (l) {
      currentBlock.push(l);
      if (l.match(/https?:\/\/[^\s\)\>]+/)) {
        blocks.push([...currentBlock]);
        currentBlock = [];
      }
    }
  }
  if (currentBlock.length > 0) {
    blocks.push([...currentBlock]);
  }

  for (const block of blocks) {
    // Find URLs in block
    const allUrls = [];
    for (const bLine of block) {
      const uMatches = [...bLine.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,\)]+$/, ""));
      allUrls.push(...uMatches);
    }
    if (allUrls.length === 0) continue;

    // Extract title and rules
    let title = "";
    let rules = [];
    
    for (const bLine of block) {
      // If line contains URL
      if (bLine.match(/https?:\/\/[^\s\)\>]+/)) {
        // Strip URLs and see if rules or title remain
        let stripped = bLine.replace(/https?:\/\/[^\s\)\>]+/g, "").replace(/\[.*?\]\(\)/g, "").trim();
        stripped = stripped.replace(/Example:\s*$/i, "").replace(/Puzzle:\s*$/i, "").trim();
        stripped = stripped.replace(/\[pzpr fork link\]/g, "").replace(/\[Penpa\+ link\]/g, "").trim();
        stripped = stripped.replace(/Solving Links:\s*penpa\+:\s*$/i, "").trim();
        stripped = stripped.replace(/penpa\+:\s*$/i, "").trim();
        stripped = stripped.replace(/Link:\s*$/i, "").trim();
        stripped = stripped.replace(/main puzzle:\s*$/i, "").trim();
        stripped = stripped.replace(/example:\s*$/i, "").trim();

        if (stripped.length > 0) {
          rules.push(stripped);
        }
      } else if (bLine.startsWith("*")) {
        rules.push(bLine);
      } else if (bLine.startsWith("##")) {
        title = bLine.replace(/^##\s*/, "").replace(/[*_]/g, "").trim();
      } else if (!title && bLine.length < 80 && !bLine.includes("Rules:") && !bLine.startsWith("1.") && !bLine.startsWith("2.")) {
        title = bLine.replace(/[*_]/g, "").trim();
      } else {
        rules.push(bLine);
      }
    }

    extracted.push({
      ls,
      title: title || "Untitled",
      rules: rules.join("\n").trim(),
      urls: allUrls,
      rawBlock: block.join("\n")
    });
  }
}

console.log(`Extracted ${extracted.length} rule blocks.`);
fs.writeFileSync("scratch/rule_blocks.json", JSON.stringify(extracted, null, 2), "utf8");
for (let i = 0; i < extracted.length; i++) {
  const e = extracted[i];
  console.log(`[${i+1}] ${e.ls} | Title: "${e.title}" | URLs: ${e.urls.length} | Rules len: ${e.rules.length}`);
}
