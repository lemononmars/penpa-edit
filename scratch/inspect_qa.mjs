import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function main() {
  const app = express();
  app.use(express.static(path.resolve(rootDir, "docs")));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.load === "function" && typeof window.pu !== "undefined");

  const testUrl = "https://swaroopg92.github.io/penpa-edit/#m=edit&p=7Vddb+pGEH3nV0T7vCr+3LX9cpWmyX1Jk6akiiKEkCEOWDGYGrupjPjvmdlxcQweqZFuk5fKeDxz9jB79oP1sP2ziotEarjcQFrShsu1PHMrCz//XPdpmSXRmTyvymVegLMsy802Gg43VV3/lKXrl+Hm23wWr+EaarjshZN6qfsaLHWpFr6Ut1dX8jnOtslg3CSdDHZ1GNV3sv4ejYUtpHDgtsVE1nfRrv41EvN8NUuFrEfQLqQNDdfEdMC9bN0H047eBYG2Bf5N44P7CO48LeZZMr0m5LdoXN9LgZ39bL6NrljlfyWiEYMxCQBgFpcwAdtlumlattVT/lI1XHuyl/W50VyPeuS6rVx0SS56PXJxFP+x3HCy38Pc/w6Cp9EYtf/RukHrjqId2JtoJxwPvoq7wyyPcBSEziF0LQi9NgwgdA+hwjA4hNqGUB/CEDOrNsTMfhNC57aR8GjslbGOsfegUNausb8YaxnrG3ttOJfGPhh7YaxnrDIcjWP8l7Ngxg+aHF9EPg0fI00RjA8foQFxLiByiekCEx/AxDZiusT0iOnBfOCDcnqU0yOmR0yfmD4wMXIoIqZPTJ+YipiKcipiKpfaiKmIqYmJq4EPYmpiahgtRsQMiBlQ7wEw8UHMgJgBjTYkZkg5Q2KGxMR1xkfDxHmhvfUJizx2cHO2F+6vHxxNBmMxqorneJ4IONfENs+m2yaOzLEHv0HA1tVqlhQdKMvzDRygXV66WOdF0tuEYPK06OPP8uLpKPtrnGUdgM78DkRHTQcqCzhH3sVxUeSvHWQVl8sO8O7M6WRK1mVXQBl3JcYv8VFvq3bM+4H4W5jbHCnu/y+Nr3xp4DpYH3p1fP0ZPobZhQOgvpViU03j6TzPBBQf0uB+P+4yuKMYPocHDK6Z/AzuMXm8kMnP4A6Hczotpl+bwRm+z+FMHt/px5XL4ByfyR8y6xUy+4TDA0ZPwOgJOD0MP+TyczqZfas5/Ryf6VczOjUzLs2se8DgIZNHMfvW/yAO/2g+lof73TG/U8XwfYavmX49bn+e6v/009a8ofOit7wBuKfCAbS3kmnwk2IG8JOyBTs8rVwA7SleAD2uXwA6LWEAPKliAGMKGcx6XMugquNyBrs6qWiwq/dFDbyql/k8P6N/zGIyeAM=";
  const hash = testUrl.split("#")[1];

  await page.evaluate(async (h) => {
    await window.load(h);
  }, hash);

  const data = await page.evaluate(() => {
    return {
      pu_q_surface: window.pu.pu_q.surface,
      pu_q_number: window.pu.pu_q.number,
      pu_a_surface: window.pu.pu_a.surface,
      pu_a_number: window.pu.pu_a.number,
    };
  });

  fs.writeFileSync("scratch/inspect_qa.json", JSON.stringify(data, null, 2));
  await browser.close();
  server.close();
}

main();
