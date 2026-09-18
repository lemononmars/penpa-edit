import fs from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";

async function main() {
  const catalog = JSON.parse(fs.readFileSync("scratch/exact_catalog.json"));
  console.log(`Analyzing ${catalog.length} Penpa puzzles...`);

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

  const results = [];

  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    const param = item.finalUrl.includes("#") ? item.finalUrl.split("#")[1] : item.finalUrl.split("?")[1];

    await page.evaluate(async (p) => {
      await window.load(p);
    }, param);

    const data = await page.evaluate(() => {
      let sol = pu.solution;
      let parsed = null;
      if (typeof sol === "string") {
        try { parsed = JSON.parse(sol); } catch(e) {}
      } else {
        parsed = sol;
      }
      
      const layers = [];
      if (Array.isArray(parsed)) {
        for (let idx = 0; idx < parsed.length; idx++) {
          if (Array.isArray(parsed[idx]) && parsed[idx].length > 0) {
            layers.push(`idx${idx}:${parsed[idx].length}`);
          }
        }
      }

      return {
        gridtype: pu.gridtype,
        nx: pu.nx,
        ny: pu.ny,
        isMulti: pu.multisolution,
        solType: typeof sol,
        layers: layers.join(", "),
        solRawSample: Array.isArray(parsed) && parsed[0] && parsed[0].slice(0, 3)
      };
    });

    results.push({
      idx: i + 1,
      ls: item.ls,
      title: item.title,
      role: item.role,
      data
    });
    console.log(`[${i+1}/${catalog.length}] ${item.ls} | ${item.title} (${item.role}) -> ${data.layers} (${data.gridtype} ${data.nx}x${data.ny})`);
  }

  fs.writeFileSync("scratch/solutions_verified.json", JSON.stringify(results, null, 2), "utf8");

  await browser.close();
  server.close();
  console.log("Done checking all solutions!");
}

main().catch(console.error);
