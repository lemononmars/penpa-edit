import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 320, height: 640 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto("http://localhost:5174/", { waitUntil: "networkidle" });
await page.locator(".studio-shell").waitFor();
await page.waitForFunction(() => document.querySelector("#pu_a") && window.pu);

const solveTab = page.getByRole("tab", { name: "Solve", exact: true });
await solveTab.click();
assert.equal(await solveTab.getAttribute("aria-selected"), "true");
assert.equal(await page.locator("#pu_a").isChecked(), true);

const mobileDeck = page.locator(".mobile-input-deck");
const deckBox = await mobileDeck.boundingBox();
assert.ok(deckBox && deckBox.width <= 320, "solve deck must fit the viewport");
assert.ok(deckBox && deckBox.x >= 0 && deckBox.x + deckBox.width <= 320, "solve deck must not overflow horizontally");
for (const keypadButton of await page.locator(".solver-shared-keypad button").all()) {
  const box = await keypadButton.boundingBox();
  assert.ok(box && deckBox && box.x >= deckBox.x && box.x + box.width <= deckBox.x + deckBox.width, "solve keypad buttons must fit the deck width");
  assert.ok(box && deckBox && box.y >= deckBox.y && box.y + box.height <= deckBox.y + deckBox.height, "solve keypad buttons must fit the deck height");
}

for (const label of ["Enable auto solve", "Solve once"]) {
  const button = page.getByLabel(label);
  const box = await button.boundingBox();
  assert.ok(box, `${label} must be visible`);
  const hitLabel = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.getAttribute("aria-label"),
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  assert.equal(hitLabel, label, `${label} must not be covered by the solve keypad`);
}

const autoButton = page.getByLabel("Enable auto solve");
await autoButton.click();
await page.waitForTimeout(50);
assert.equal(await page.locator("#sudoku_auto_solver").getAttribute("aria-pressed"), "true");

const solveOnce = page.getByLabel("Solve once");
await solveOnce.click();
await page.waitForTimeout(50);
assert.equal(
  await page.evaluate(() => document.body.classList.contains("sudoku-solve-check-running") || document.querySelector("#sudoku-solver-log-output")?.textContent !== ""),
  true,
  "solve once must invoke the legacy solver",
);

assert.deepEqual(errors, []);
console.log("PASS mobile solve mode layout and solver controls");
await browser.close();
