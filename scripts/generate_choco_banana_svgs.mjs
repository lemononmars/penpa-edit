import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const txtPath = path.resolve(rootDir, "Choco Banana (penpa).txt");
const outDir = path.resolve(rootDir, "generated", "choco_banana");

fs.mkdirSync(outDir, { recursive: true });

function parseTxt() {
  const content = fs.readFileSync(txtPath, "utf8");
  const lines = content.split(/\r?\n/);
  const items = [];
  let currentSection = "misc";
  let sectionIndex = 1;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("## Trial")) {
      currentSection = "trial";
      sectionIndex = 1;
    } else if (line.startsWith("## Puzzles")) {
      currentSection = "puzzle";
      sectionIndex = 1;
    } else if (line.startsWith("### Spares")) {
      currentSection = "spare";
      sectionIndex = 1;
    } else if (line.includes("penpa-edit/#")) {
      const hash = line.split("#")[1];
      const paddedNum = String(sectionIndex).padStart(2, "0");
      const baseName = `${currentSection}_${paddedNum}`;
      items.push({
        baseName,
        section: currentSection,
        index: sectionIndex,
        url: line,
        hash
      });
      sectionIndex++;
    }
  }
  return items;
}

async function main() {
  const items = parseTxt();
  console.log(`Found ${items.length} puzzles in ${txtPath}`);

  const app = express();
  app.use(express.static(path.resolve(rootDir, "docs")));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  console.log(`Express static server on http://127.0.0.1:${port}`);

  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.load === "function" && typeof window.pu !== "undefined");

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[${i + 1}/${items.length}] Processing ${item.baseName}...`);

    await page.evaluate(async (hash) => {
      await window.load(hash);
    }, item.hash);

    // Allow internal redraw / points recalculation
    await page.waitForTimeout(200);

    const svgs = await page.evaluate(() => {
      document.getElementById("nb_type3").checked = true;
      document.getElementById("nb_margin2").checked = true;

      // Problem SVG (unsolved clues only)
      UserSettings.show_solution = false;
      window.pu.mode_qa("pu_q");
      const problemSvg = window.pu.resizecanvas();

      // Solution SVG (with answer shading)
      UserSettings.show_solution = true;
      window.pu.mode_qa("pu_a");
      const solutionSvg = window.pu.resizecanvas();

      return { problemSvg, solutionSvg };
    });

    const probPath = path.resolve(outDir, `${item.baseName}.svg`);
    const solPath = path.resolve(outDir, `${item.baseName}_solution.svg`);

    fs.writeFileSync(probPath, svgs.problemSvg, "utf8");
    fs.writeFileSync(solPath, svgs.solutionSvg, "utf8");
  }

  await browser.close();
  server.close();
  console.log(`All ${items.length} puzzles exported successfully to ${outDir}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
