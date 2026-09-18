import fs from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";

async function main() {
  const cat = JSON.parse(fs.readFileSync("scratch/final_catalog.json", "utf8"));
  const item = cat.find(x => x.baseName === "ls58_puzzle_3_puzzle");
  const param = item.finalUrl.split("?")[1];

  const app = express();
  app.use(express.static("docs"));
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;

  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.load === "function");
  await page.evaluate(async (p) => { await window.load(p); }, param);

  const numData = await page.evaluate(() => {
    return {
      pu_q_number: pu.pu_q.number,
      pu_q_symbol: pu.pu_q.symbol,
    };
  });

  console.log("pu_q_number keys and values:");
  for (const [k, v] of Object.entries(numData.pu_q_number)) {
    const hex = v[0].split("").map(c => "U+" + c.charCodeAt(0).toString(16).toUpperCase());
    console.log(k, JSON.stringify(v), hex);
  }

  await browser.close();
  server.close();
}

main().catch(console.error);
