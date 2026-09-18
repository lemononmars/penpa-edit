import fs from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";

async function main() {
  const metadata = JSON.parse(fs.readFileSync("scratch/penpa_puzzles_metadata.json"));
  console.log(`Checking embedded info for ${metadata.length} Penpa puzzles...`);

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

  for (let i = 0; i < metadata.length; i++) {
    const p = metadata[i];
    const param = p.finalUrl.includes("#") ? p.finalUrl.split("#")[1] : p.finalUrl.split("?")[1];

    await page.evaluate(async (paramStr) => {
      await window.load(paramStr);
    }, param);

    const info = await page.evaluate(() => {
      const title = document.getElementById("saveinfotitle")?.value || "";
      const author = document.getElementById("saveinfoauthor")?.value || "";
      const tags = (pu.user_tags || []).join(",");
      return { title, author, tags };
    });

    p.embeddedTitle = info.title;
    p.embeddedAuthor = info.author;
    p.embeddedTags = info.tags;
    console.log(`[${i+1}/${metadata.length}] ${p.ls} | heading: "${p.heading}" | embeddedTitle: "${info.title}" | author: "${info.author}"`);
  }

  fs.writeFileSync("scratch/penpa_puzzles_enriched.json", JSON.stringify(metadata, null, 2), "utf8");

  await browser.close();
  server.close();
}

main().catch(console.error);
