import fs from "node:fs";
import { chromium } from "playwright";

const logFile = "scratch/launch_test.txt";
fs.writeFileSync(logFile, "Starting launch test...\n");

async function test(name, execPath) {
  try {
    fs.appendFileSync(logFile, `Testing ${name} (${execPath})...\n`);
    const browser = await chromium.launch({
      executablePath: execPath,
      headless: true,
      args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
    });
    fs.appendFileSync(logFile, `${name} launched successfully!\n`);
    const page = await browser.newPage();
    await page.goto("about:blank");
    fs.appendFileSync(logFile, `${name} opened page successfully!\n`);
    await browser.close();
    fs.appendFileSync(logFile, `${name} closed successfully!\n`);
    return true;
  } catch (err) {
    fs.appendFileSync(logFile, `${name} failed: ${err.message}\n`);
    return false;
  }
}

async function main() {
  await test("Chrome x86", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe");
  await test("Edge x86", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe");
}

main().then(() => {
  fs.appendFileSync(logFile, "Done\n");
});
