import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.WSC_BASE_URL || 'http://127.0.0.1:5174';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

await page.goto(`${base}/wsc2026/`);
if (await page.getByLabel('Password', { exact: true }).count()) {
  await page.getByLabel('Password', { exact: true }).fill('กู้ชาติ');
  await page.getByRole('button', { name: 'Enter', exact: true }).click();
}
await page.getByLabel('Round', { exact: true }).selectOption('1');

const classic = page.locator('.puzzle-card').filter({ has: page.getByRole('heading', { name: 'Classic Sudoku', exact: true }) });
assert.equal(await classic.getByRole('button', { name: /^Rules/ }).count(), 0);
assert.equal(await classic.getByRole('button', { name: /^Puzzles/ }).count(), 0);

const irregular = page.locator('.puzzle-card').filter({ has: page.getByRole('heading', { name: 'Irregular Sudoku', exact: true }) });
const puzzleButton = irregular.getByRole('button', { name: 'Puzzles (0) ▾' });
assert.equal(await puzzleButton.isDisabled(), true);
await irregular.getByRole('button', { name: /^Rules/ }).click();
await irregular.locator('img.official').waitFor({ state: 'visible' });

await page.getByRole('button', { name: 'Landscape · two puzzles per page' }).click();
await page.evaluate(() => { window.print = () => { throw new Error('hold-print-layout'); }; });
await page.getByRole('button', { name: 'Print / Save PDF' }).click();
await page.locator('.print-area.landscape').waitFor({ state: 'attached' });

const preview = page.locator('.round-preview').first();
assert.match(await preview.textContent(), /Kuru Clan/);
assert.equal(await preview.locator('li').count(), 9);
assert.equal(await page.locator('.print-puzzle h2').first().textContent(), '#1 · Classic Sudoku · 25 pts');
assert.equal(await page.locator('.print-puzzle .time-box').count(), 9);
assert.equal((await page.locator('.print-area').textContent()).includes('Name:'), false);
assert.equal((await page.locator('.print-area').textContent()).includes('Time: ____________'), false);

await page.reload();
await page.emulateMedia({ media: 'screen' });
await page.getByLabel('Round', { exact: true }).selectOption('2');
await page.getByRole('button', { name: 'Landscape · two puzzles per page' }).click();
await page.evaluate(() => { window.print = () => { throw new Error('hold-round-two'); }; });
await page.getByRole('button', { name: 'Print / Save PDF' }).click();
await page.locator('.print-puzzle.samurai').waitFor({ state: 'attached' });
await page.emulateMedia({ media: 'print' });
fs.mkdirSync('tmp/pdfs', { recursive: true });
await page.pdf({ path: 'tmp/pdfs/wsc2026-round-2.pdf', printBackground: true, preferCSSPageSize: true });

await page.reload();
await page.emulateMedia({ media: 'screen' });
await page.getByLabel('Round', { exact: true }).selectOption('11');
await page.getByRole('button', { name: 'Landscape · two puzzles per page' }).click();
await page.evaluate(() => { window.print = () => { throw new Error('hold-round-eleven'); }; });
await page.getByRole('button', { name: 'Print / Save PDF' }).click();
await page.locator('.print-puzzle.relay-grid').first().waitFor({ state: 'attached' });
assert.equal(await page.locator('.print-puzzle.relay-grid').count(), 3);
fs.mkdirSync('output/pdf', { recursive: true });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: 'output/pdf/wsc2026-landscape-sample.pdf',
  printBackground: true,
  preferCSSPageSize: true,
});

console.log('PASS layout icons, scores, time boxes, portrait Samurai and split Relay grids');
await browser.close();
