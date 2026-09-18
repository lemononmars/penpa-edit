import path from "node:path";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
  
  // Pick 3 representative puzzles:
  // 1. Shading puzzle (e.g. LS49 Canal View or LS50 Entry F)
  // 2. Loop edge / border puzzle (e.g. LS61 Contact or Rampage)
  // 3. Loop line puzzle (e.g. LS61 Turnaround)
  
  const testIndices = [0, 32, 38]; // 1st is canal view, 33rd is edge, 39th is line

  const app = express();
  app.use(express.static("docs"));
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.load === "function" && typeof window.pu !== "undefined");

  for (const idx of testIndices) {
    const item = resolved[idx];
    const param = item.final.includes("#") ? item.final.split("#")[1] : item.final.split("?")[1];
    console.log(`\nTesting idx ${idx}: ${item.orig}`);

    await page.evaluate(async (p) => {
      await window.load(p);
    }, param);

    const testRes = await page.evaluate(() => {
      document.getElementById("nb_type3").checked = true;
      document.getElementById("nb_margin2").checked = true;

      // 1. Generate Problem SVG
      UserSettings.show_solution = false;
      window.pu.mode_qa("pu_q");
      const problemSvg = window.pu.resizecanvas();

      // 2. Populate pu_a from pu.solution if pu_a is empty
      let sol = pu.solution;
      if (typeof sol === "string") {
        try { sol = JSON.parse(sol); } catch(e) {}
      }

      // If solution is [sol0, sol1, sol2, sol3, sol4, sol5]
      if (Array.isArray(sol)) {
        // sol[0]: shading
        if (Array.isArray(sol[0])) {
          for (const cell of sol[0]) {
            if (Array.isArray(cell)) {
              pu.pu_a.surface[cell[0]] = cell[1];
            } else {
              pu.pu_a.surface[cell] = 1; // standard dark grey / black shading
            }
          }
        }
        // sol[1]: line
        if (Array.isArray(sol[1])) {
          for (const l of sol[1]) {
            // format "p1,p2,style" or "p1,p2"
            const parts = String(l).split(",");
            if (parts.length >= 2) {
              const key = `${parts[0]},${parts[1]}`;
              const style = parts[2] ? parseInt(parts[2]) : 2; // 2 or 3 for green/solution line
              pu.pu_a.line[key] = (style === 2 ? 30 : 3); // 3 is green line, 2 is normal line
            }
          }
        }
        // sol[2]: edge
        if (Array.isArray(sol[2])) {
          for (const e of sol[2]) {
            const parts = String(e).split(",");
            if (parts.length >= 2) {
              const key = `${parts[0]},${parts[1]}`;
              const style = parts[2] ? parseInt(parts[2]) : 3;
              pu.pu_a.lineE[key] = (style === 2 ? 30 : 3); // 3 is green edge, 2 is normal edge
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
            // [cell, num, color]
            if (Array.isArray(n)) {
              pu.pu_a.number[n[0]] = [n[1], n[2] || 2, "1"];
            }
          }
        }
      }

      // 3. Generate Solution SVG
      UserSettings.show_solution = true;
      window.pu.mode_qa("pu_a");
      const solutionSvg = window.pu.resizecanvas();

      return {
        probLen: problemSvg.length,
        solLen: solutionSvg.length,
        problemSvg,
        solutionSvg
      };
    });

    console.log(`Lengths: prob=${testRes.probLen}, sol=${testRes.solLen}`);
    fs.writeFileSync(`scratch/test_${idx}_prob.svg`, testRes.problemSvg);
    fs.writeFileSync(`scratch/test_${idx}_sol.svg`, testRes.solutionSvg);
  }

  await browser.close();
  server.close();
  console.log("Done testing populating solution.");
}

main().catch(console.error);
