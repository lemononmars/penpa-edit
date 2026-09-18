import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";

const outDir = path.resolve("generated", "logic_showcase");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const catalog = JSON.parse(fs.readFileSync("scratch/final_catalog.json", "utf8"));
  console.log(`Starting SVG generation for ${catalog.length} puzzles...`);

  const app = express();
  app.use(express.static("docs"));
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;

  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.load === "function" && typeof window.pu !== "undefined");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    const param = item.finalUrl.includes("#") ? item.finalUrl.split("#")[1] : item.finalUrl.split("?")[1];

    try {
      await page.evaluate(async (p) => {
        await window.load(p);
      }, param);

      // Brief delay for canvas layout
      await page.waitForTimeout(100);

      const svgs = await page.evaluate(() => {
        document.getElementById("nb_type3").checked = true;
        document.getElementById("nb_margin2").checked = true;

        // 1. Problem SVG
        UserSettings.show_solution = false;
        window.pu.mode_qa("pu_q");
        const problemSvg = window.pu.resizecanvas();

        // 2. Populate pu_a from pu.solution
        let sol = pu.solution;
        if (typeof sol === "string") {
          try { sol = JSON.parse(sol); } catch(e) {}
        }

        if (Array.isArray(sol)) {
          // sol[0]: shading
          if (Array.isArray(sol[0])) {
            for (const cell of sol[0]) {
              if (Array.isArray(cell)) {
                pu.pu_a.surface[cell[0]] = cell[1];
              } else {
                pu.pu_a.surface[cell] = 1;
              }
            }
          }
          // sol[1]: line
          if (Array.isArray(sol[1])) {
            for (const l of sol[1]) {
              const parts = String(l).split(",");
              if (parts.length >= 2) {
                const key = `${parts[0]},${parts[1]}`;
                const style = parts[2] ? parseInt(parts[2]) : 1;
                pu.pu_a.line[key] = (style === 2 ? 30 : 3);
              }
            }
          }
          // sol[2]: edge
          if (Array.isArray(sol[2])) {
            for (const e of sol[2]) {
              const parts = String(e).split(",");
              if (parts.length >= 2) {
                const key = `${parts[0]},${parts[1]}`;
                const style = parts[2] ? parseInt(parts[2]) : 1;
                pu.pu_a.lineE[key] = (style === 2 ? 30 : 3);
              }
            }
          }
          // sol[3]: wall
          if (Array.isArray(sol[3])) {
            for (const w of sol[3]) {
              pu.pu_a.wall[w] = 3;
            }
          }
          // sol[4]: number
          if (Array.isArray(sol[4])) {
            for (const n of sol[4]) {
              const parts = String(n).split(",");
              if (parts.length >= 2) {
                pu.pu_a.number[parts[0]] = [parts[1], 2, "1"];
              }
            }
          }
          // sol[5]: symbol
          if (Array.isArray(sol[5])) {
            for (const s of sol[5]) {
              if (Array.isArray(s)) {
                pu.pu_a.symbol[s[0]] = [s[1], s[2], s[3]];
              }
            }
          }
        }

        // 3. Solution SVG
        UserSettings.show_solution = true;
        window.pu.mode_qa("pu_a");
        const solutionSvg = window.pu.resizecanvas();

        return { problemSvg, solutionSvg };
      });

      const probPath = path.resolve(outDir, `${item.baseName}.svg`);
      const solPath = path.resolve(outDir, `${item.baseName}_solution.svg`);

      fs.writeFileSync(probPath, svgs.problemSvg, "utf8");
      fs.writeFileSync(solPath, svgs.solutionSvg, "utf8");

      successCount++;
      console.log(`[${i + 1}/${catalog.length}] OK: ${item.baseName} (prob=${svgs.problemSvg.length}b, sol=${svgs.solutionSvg.length}b)`);
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${catalog.length}] FAIL: ${item.baseName} - ${err.message}`);
    }
  }

  await browser.close();
  server.close();
  console.log(`\nFinished: ${successCount} successful, ${failCount} failed. Output directory: ${outDir}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
