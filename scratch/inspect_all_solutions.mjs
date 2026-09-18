import fs from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";

async function main() {
  const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
  const penpaItems = resolved.filter(r => r.final.includes("penpa-edit"));
  console.log(`Analyzing ${penpaItems.length} Penpa puzzles...`);

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

  for (let i = 0; i < penpaItems.length; i++) {
    const item = penpaItems[i];
    const hash = item.final.split("#")[1];

    await page.evaluate(async (h) => {
      await window.load(h);
    }, hash);

    const data = await page.evaluate(() => {
      let sol = pu.solution;
      let parsed = null;
      if (typeof sol === "string") {
        try { parsed = JSON.parse(sol); } catch(e) {}
      } else {
        parsed = sol;
      }
      return {
        isMulti: pu.multisolution,
        solType: typeof sol,
        parsedSample: parsed ? (Array.isArray(parsed) ? parsed.map((x, idx) => Array.isArray(x) ? `[${idx}]: len ${x.length}` : typeof x) : typeof parsed) : null,
        rawSolLen: typeof sol === "string" ? sol.length : 0,
        pu_a_surface: Object.keys(pu.pu_a.surface || {}).length,
        pu_a_line: Object.keys(pu.pu_a.line || {}).length,
        pu_a_lineE: Object.keys(pu.pu_a.lineE || {}).length,
        pu_a_number: Object.keys(pu.pu_a.number || {}).length,
        pu_a_symbol: Object.keys(pu.pu_a.symbol || {}).length,
      };
    });

    results.push({
      orig: item.orig,
      final: item.final.slice(0, 80),
      data
    });
    console.log(`[${i+1}/${penpaItems.length}] ${data.isMulti ? 'MULTI' : 'SINGLE'} | parsed: ${JSON.stringify(data.parsedSample)} | pu_a: surf=${data.pu_a_surface}, line=${data.pu_a_line}, lineE=${data.pu_a_lineE}`);
  }

  fs.writeFileSync("scratch/penpa_solutions_inspect.json", JSON.stringify(results, null, 2));

  await browser.close();
  server.close();
}

main().catch(console.error);
