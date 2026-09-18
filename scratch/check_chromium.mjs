import { chromium } from "playwright";
import fs from "node:fs";

try {
  const p = chromium.executablePath();
  fs.writeFileSync("scratch/chromium_path.txt", "Path: " + p);
} catch (e) {
  fs.writeFileSync("scratch/chromium_path.txt", "Error: " + e.message);
}
