import fs from "node:fs";

const items = JSON.parse(fs.readFileSync("scratch/parsed_items.json"));

const summary = [];
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  for (let j = 0; j < item.urls.length; j++) {
    const u = item.urls[j];
    const fin = u.final;
    const isPenpa = fin.includes("penpa-edit");
    const hasA = fin.includes("&a=");
    const isPuzzlink = fin.includes("puzz.link");
    summary.push({
      itemIdx: i + 1,
      ls: item.ls,
      orig: u.orig,
      final: fin,
      isPenpa,
      hasA,
      isPuzzlink,
      cleanText: item.cleanText
    });
  }
}

fs.writeFileSync("scratch/url_details.json", JSON.stringify(summary, null, 2), "utf8");
console.log(`Total URLs analyzed: ${summary.length}`);
console.log(`Penpa with &a=: ${summary.filter(s => s.hasA).length}`);
console.log(`Penpa without &a=: ${summary.filter(s => s.isPenpa && !s.hasA).length}`);
console.log(`Puzzlink: ${summary.filter(s => s.isPuzzlink).length}`);
console.log(`Other: ${summary.filter(s => !s.isPenpa && !s.isPuzzlink).length}`);
