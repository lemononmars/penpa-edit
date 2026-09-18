import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync("scratch/exact_catalog.json"));

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "_");
}

const seenNames = new Map();
const enrichedCatalog = [];

for (let i = 0; i < catalog.length; i++) {
  const item = catalog[i];
  const ls = item.ls.toLowerCase();
  
  // Clean up title
  let title = item.title;
  // Specific overrides for clearer naming
  if (i === 1) {
    title = "twilight_canal_view";
    item.role = "example";
  } else if (title.includes("Twilight Kurodoko")) {
    title = "twilight_kurodoko";
  } else if (title.includes("Twilight Canal View")) {
    title = "twilight_canal_view";
  } else if (i === 32) {
    title = "contact_equal_sign";
  } else if (i === 33) {
    title = "contact_plus";
  } else if (i === 34) {
    title = "contact_lenses";
  } else if (i === 35) {
    title = "rampage_tilted_square";
  } else if (i === 36) {
    title = "rampage_ox_loops";
  } else if (i === 37) {
    title = "rampage_roadblocks";
  } else if (i === 38) {
    title = "turnaround_spiral";
  } else if (i === 39) {
    title = "turnaround_9x9";
  } else if (i === 40) {
    title = "turnaround_12x12";
  } else if (title === "Puzzle" && item.ls === "LS58") {
    title = `puzzle_${i - 23}`; // puzzle_1, puzzle_2, puzzle_3
  } else {
    title = slugify(title);
  }

  const role = item.role;
  let baseName = `${ls}_${title}_${role}`;
  
  if (seenNames.has(baseName)) {
    const count = seenNames.get(baseName) + 1;
    seenNames.set(baseName, count);
    baseName = `${baseName}_${count}`;
  } else {
    seenNames.set(baseName, 1);
  }

  enrichedCatalog.push({
    ...item,
    baseName
  });
}

fs.writeFileSync("scratch/final_catalog.json", JSON.stringify(enrichedCatalog, null, 2), "utf8");

for (let i = 0; i < enrichedCatalog.length; i++) {
  const c = enrichedCatalog[i];
  console.log(`[${String(i+1).padStart(2, '0')}] ${c.baseName}.svg`);
}
