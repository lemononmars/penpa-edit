import fs from "node:fs";

const paths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Users\\sakul_bp6myy0\\AppData\\Local\\ms-playwright",
];

const results = [];
for (const p of paths) {
  try {
    const exists = fs.existsSync(p);
    if (exists && fs.statSync(p).isDirectory()) {
      results.push(`${p} (DIR): ${fs.readdirSync(p).join(", ")}`);
    } else {
      results.push(`${p}: ${exists}`);
    }
  } catch (e) {
    results.push(`${p}: error ${e.message}`);
  }
}

fs.writeFileSync("scratch/browser_check.txt", results.join("\n"));
