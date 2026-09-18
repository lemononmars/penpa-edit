import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.resolve(__dirname, "debug_log.txt");

function log(msg) {
  fs.appendFileSync(logFile, msg + "\n");
}

async function main() {
  fs.writeFileSync(logFile, "Starting with express...\n");
  const app = express();
  app.use(express.static(path.resolve(__dirname, "../docs")));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  log(`Express listening on port ${port}`);

  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true
  });
  log("Browser launched with Chrome x86");
  const page = await browser.newPage();

  page.on("console", msg => log(`[PAGE LOG] ${msg.text()}`));
  page.on("pageerror", err => log(`[PAGE ERROR] ${err.message}`));

  const testUrl = "https://swaroopg92.github.io/penpa-edit/#m=edit&p=7Vddb+pGEH3nV0T7vCr+3LX9cpWmyX1Jk6akiiKEkCEOWDGYGrupjPjvmdlxcQweqZFuk5fKeDxz9jB79oP1sP2ziotEarjcQFrShsu1PHMrCz//XPdpmSXRmTyvymVegLMsy802Gg43VV3/lKXrl+Hm23wWr+EaarjshZN6qfsaLHWpFr6Ut1dX8jnOtslg3CSdDHZ1GNV3sv4ejYUtpHDgtsVE1nfRrv41EvN8NUuFrEfQLqQNDdfEdMC9bN0H047eBYG2Bf5N44P7CO48LeZZMr0m5LdoXN9LgZ39bL6NrljlfyWiEYMxCQBgFpcwAdtlumlattVT/lI1XHuyl/W50VyPeuS6rVx0SS56PXJxFP+x3HCy38Pc/w6Cp9EYtf/RukHrjqId2JtoJxwPvoq7wyyPcBSEziF0LQi9NgwgdA+hwjA4hNqGUB/CEDOrNsTMfhNC57aR8GjslbGOsfegUNausb8YaxnrG3ttOJfGPhh7YaxnrDIcjWP8l7Ngxg+aHF9EPg0fI00RjA8foQFxLiByiekCEx/AxDZiusT0iOnBfOCDcnqU0yOmR0yfmD4wMXIoIqZPTJ+YipiKcipiKpfaiKmIqYmJq4EPYmpiahgtRsQMiBlQ7wEw8UHMgJgBjTYkZkg5Q2KGxMR1xkfDxHmhvfUJizx2cHO2F+6vHxxNBmMxqorneJ4IONfENs+m2yaOzLEHv0HA1tVqlhQdKMvzDRygXV66WOdF0tuEYPK06OPP8uLpKPtrnGUdgM78DkRHTQcqCzhH3sVxUeSvHWQVl8sO8O7M6WRK1mVXQBl3JcYv8VFvq3bM+4H4W5jbHCnu/y+Nr3xp4DpYH3p1fP0ZPobZhQOgvpViU03j6TzPBBQf0uB+P+4yuKMYPocHDK6Z/AzuMXm8kMnP4A6Hczotpl+bwRm+z+FMHt/px5XL4ByfyR8y6xUy+4TDA0ZPwOgJOD0MP+TyczqZfas5/Ryf6VczOjUzLs2se8DgIZNHMfvW/yAO/2g+lof73TG/U8XwfYavmX49bn+e6v/009a8ofOit7wBuKfCAbS3kmnwk2IG8JOyBTs8rVwA7SleAD2uXwA6LWEAPKliAGMKGcx6XMugquNyBrs6qWiwq/dFDbyql/k8P6N/zGIyeAM=";
  const hash = testUrl.split("#")[1];

  log("Navigating to index.html...");
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  log("DOM loaded");

  await page.waitForFunction(() => typeof window.load === "function" && typeof window.pu !== "undefined");
  log("window.load and window.pu ready");

  await page.evaluate(async (h) => {
    await window.load(h);
  }, hash);
  log("window.load completed");

  // Wait a bit for canvas rendering
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    document.getElementById("nb_type3").checked = true;
    document.getElementById("nb_margin2").checked = true;
    
    // Problem SVG
    window.pu.mode_qa("pu_q");
    const svg_q = window.pu.resizecanvas();
    
    // Solution SVG
    window.pu.mode_qa("pu_a");
    const svg_a = window.pu.resizecanvas();

    return {
      svg_q_len: svg_q?.length,
      svg_a_len: svg_a?.length,
      svg_q,
      svg_a
    };
  });

  log(`Result: svg_q length=${result.svg_q_len}, svg_a length=${result.svg_a_len}`);
  fs.writeFileSync(path.resolve(__dirname, "test_problem.svg"), result.svg_q);
  fs.writeFileSync(path.resolve(__dirname, "test_solution.svg"), result.svg_a);
  log("SVGs written successfully!");

  await browser.close();
  server.close();
  log("All done!");
}

main().catch(err => {
  log(`Error: ${err.stack || err.message}`);
  process.exit(1);
});
