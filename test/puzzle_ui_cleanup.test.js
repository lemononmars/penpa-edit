const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

test('puzzle editor shortcuts and shared Set/Solve controls work', async () => {
  const { createServer } = await import('vite');
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.js'),
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const base = `http://127.0.0.1:${server.httpServer.address().port}/puzzle`;
    const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    await page.goto(base);
    await page.waitForFunction(() => window.penpaBoardReady && document.querySelector('.studio-shell.ready'));

    await page.keyboard.press('F4');
    assert.equal(await page.locator('.genre-section').isVisible(), true);
    assert.match(await page.locator('.segmented').innerText(), /Genre\s+F4/);
    assert.match(await page.locator('#puzzle-genre option[value="laxman-rekha"]').textContent(), /✎.*Laxman Rekha/);
    await page.locator('#puzzle-genre').selectOption('laxman-rekha');
    await page.locator('.studio-shell').evaluate((node) => node.classList.add('dark'));
    const introColor = await page.locator('.genre-intro').evaluate((node) => getComputedStyle(node).color);
    assert.equal(introColor, 'rgb(208, 225, 211)');

    await page.keyboard.press('F2');
    const controls = page.locator('.legacy-modes-section');
    assert.equal(await controls.isVisible(), true);
    await controls.getByRole('button', { name: 'Hide' }).click();
    assert.equal(await controls.locator('.tool-picker-current').isVisible(), true);
    assert.equal(await controls.locator('.tool-picker-modes').isVisible(), false);
    await controls.getByRole('button', { name: 'Show' }).click();

    await controls.locator('.tool-picker-modes').getByRole('button', { name: /Shape/ }).click();
    await controls.locator('.category-column').getByRole('button', { name: 'Arrow' }).click();
    for (const item of ['Four edge', 'Cross', '8-way', 'Arrow tips']) {
      await controls.locator('.item-column').getByRole('button', { name: item, exact: true }).click();
      const arrow = page.locator('.desktop-input-panel').getByRole('button', { name: 'Arrow 1' });
      assert.equal(await arrow.isVisible(), true);
      assert.match(await arrow.innerText(), /←/);
      const arrows = page.locator('.desktop-input-panel').getByRole('button', { name: /^Arrow \d+$/ });
      assert.equal(await arrows.count(), item === 'Arrow tips' ? 4 : 8);
      assert.ok((await arrows.allInnerTexts()).every((label) => /[←↖↑↗→↘↓↙]/.test(label)));
    }
    assert.ok((await controls.locator('.symbol-layer-option').first().boundingBox()).width <= 45);

    await controls.locator('.tool-picker-modes').getByRole('button', { name: /Number/ }).click();
    assert.equal(await controls.locator('.number-style-svg > rect.gray-cell').evaluate((node) => getComputedStyle(node).fill), 'rgb(201, 209, 216)');
    await controls.getByRole('button', { name: 'Text', exact: true }).click();
    await controls.locator('#number-text-input').fill('AB');
    const cell = await page.evaluate(() => { pu.cursol = pu.centerlist[12]; pu.selection = [pu.cursol]; return pu.cursol; });
    await controls.getByRole('button', { name: 'Insert' }).click();
    assert.equal(await page.evaluate((id) => pu.pu_q.number[id]?.[0], cell), 'AB');
    await controls.locator('#number-text-input').fill('');
    await controls.getByRole('button', { name: 'Load' }).click();
    assert.equal(await controls.locator('#number-text-input').inputValue(), 'AB');
    await controls.getByRole('button', { name: 'Clear' }).click();
    assert.equal(await controls.locator('#number-text-input').inputValue(), '');

    await page.keyboard.press('F3');
    assert.equal(await controls.isVisible(), true);
    assert.equal(await page.locator('.tool-help').count(), 0);
    assert.match(await controls.locator('.tool-picker-current').innerText(), /Composite/);
    assert.equal(await page.getByRole('checkbox', { name: 'Show solution' }).isVisible(), true);
    await controls.locator('.tool-picker-modes').getByRole('button', { name: /Number/ }).click();
    assert.equal(await page.locator('.desktop-input-panel').getByRole('button', { name: '1', exact: true }).isVisible(), true);

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.goto(base);
    await mobile.waitForFunction(() => window.penpaBoardReady && document.querySelector('.studio-shell.ready'));
    await mobile.locator('.mobile-deck-tabs').getByRole('tab', { name: /Solve/ }).click();
    assert.equal(await mobile.locator('.mobile-deck-pane[aria-label="Mode controls"] .legacy-modes-section').isVisible(), true);
    assert.equal(await mobile.locator('.editor-solve-mobile').getByRole('checkbox', { name: 'Show solution' }).isVisible(), true);
    await mobile.locator('.mobile-deck-pane[aria-label="Mode controls"] .tool-picker-modes').getByRole('button', { name: /Number/ }).click();
    assert.equal(await mobile.locator('.mobile-deck-pane[aria-label="Mode controls"] .tool-input-panel').getByRole('button', { name: '1', exact: true }).isVisible(), true);
    await mobile.keyboard.press('F4');
    assert.equal(await mobile.locator('.genre-section').isVisible(), true);
  } finally {
    await browser?.close();
    await server.close();
  }
});
