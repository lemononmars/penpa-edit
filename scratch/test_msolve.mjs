import path from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";
import fs from "node:fs";

async function main() {
  const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json"));
  // Find an m=solve URL
  const solveItem = resolved.find(r => r.final.includes("m=solve"));
  console.log("Testing URL:", solveItem.final.slice(0, 100));

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

  const hash = solveItem.final.split("#")[1];
  await page.evaluate(async (h) => {
    await window.load(h);
  }, hash);

  const info = await page.evaluate(() => {
    return {
      pu_q_keys: Object.keys(pu.pu_q).filter(k => Object.keys(pu.pu_q[k] || {}).length > 0),
      pu_a_keys: Object.keys(pu.pu_a).filter(k => Object.keys(pu.pu_a[k] || {}).length > 0),
      solution: typeof pu.solution === "string" ? pu.solution.slice(0, 200) : pu.solution,
      solutionType: typeof pu.solution,
      isMultiSolution: pu.multisolution,
      mode_qa: pu.mode.qa
    };
  });

  console.log("Info:", JSON.stringify(info, null, 2));

  await browser.close();
  server.close();
}

main().catch(console.error);
