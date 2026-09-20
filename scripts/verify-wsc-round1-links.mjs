import { chromium } from "playwright";
import links from "../docs/src/wsc2026/round1Playable.json" with { type: "json" };

globalThis.location = { origin: "http://localhost:5174" };
const { playerUrl } = await import("../docs/src/wsc2026/url.mjs");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const expectedNative = {
  "r01-01": { givens: 20 },
  "r01-02": { cages: 33, cageLabels: 33 },
  "r01-03": { regions: 81, edges: 48 },
  "r01-04": { regions: 81, minimumEdges: 48 },
  "r01-05": { lines: 16 },
  "r01-06": { givens: 14 },
  "r01-07": { surfaces: 36 },
  "r01-08": { symbols: 15 },
  "r01-09": { outsideClues: 60 },
};
for (const [id, link] of Object.entries(links)) {
  const normalized = playerUrl(link);
  await page.goto(`http://localhost:5174/?verify=${id}#${normalized.split('#')[1]}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.pu?.centerlist?.length === 81 && window.pu?.solution);
  const result = await page.evaluate((expectedId) => ({
    cells: window.pu.centerlist.length,
    solutionEntries: window.pu.solution?.length,
    background: window.pu.bg_image_data?.url,
    variants: window.pu.activeSudokuVariants,
    mode: window.pu.mmode,
    givens: Object.keys(window.pu.pu_q.number || {}).length,
    cages: (window.pu.pu_q.killercages || []).length,
    cageLabels: Object.keys(window.pu.pu_q.numberS || {}).length,
    regions: (window.pu.pu_q.irregularRegions || []).length,
    edges: Object.keys(window.pu.pu_q.lineE || {}).length,
    lines: Object.keys(window.pu.pu_q.line || {}).length,
    surfaces: Object.keys(window.pu.pu_q.surface || {}).length,
    symbols: Object.keys(window.pu.pu_q.symbol || {}).length,
    outsideClues: expectedId === "r01-09" ? Object.keys(window.pu.pu_q.number || {}).length : 0,
    answerAccepted: (() => {
      const answer = JSON.parse(window.pu.solution);
      window.pu.pu_a.number = {};
      for (const entry of answer[4] || []) {
        const split = String(entry).split(",");
        window.pu.pu_a.number[split[0]] = [split.slice(1).join(","), 2, "1"];
      }
      window.pu.check_solution();
      return window.pu.sol_flag === 1;
    })(),
    answerMatches: JSON.stringify(window.pu.make_solution()) === window.pu.solution,
  }), id);
  const expected = expectedNative[id];
  const nativeMatches = Object.entries(expected).every(([key,value]) => key === "minimumEdges" ? result.edges >= value : result[key] === value);
  if (result.cells !== 81 || !result.solutionEntries || result.background?.url || result.mode !== "solve" || !result.answerAccepted || !nativeMatches) {
    throw new Error(`${id}: invalid playable link ${JSON.stringify(result)}`);
  }
  console.log(id, JSON.stringify(result));
}
await browser.close();
