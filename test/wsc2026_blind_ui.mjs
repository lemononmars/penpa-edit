import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto((process.env.WSC_BASE_URL || 'http://127.0.0.1:5174') + '/wsc2026/');
  await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');
  await page.getByRole('button',{name:'Enter',exact:true}).click();
  await page.locator('.puzzle-card').first().waitFor();
  await page.getByLabel('Round',{exact:true}).selectOption('8');
  const card = page.locator('.puzzle-card').first();
  await card.getByRole('button',{name:/Blind practice/}).click();
  const first = card.locator('.blind-cell').first();
  await first.waitFor();
  await first.click();
  const blank = card.locator('.blind-cell:not(.given)').first();
  await blank.click();
  const blankBackground = await blank.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.equal(blankBackground,'rgb(255, 255, 255)','selecting an empty cell must not flash green');
  assert.equal(await card.getByRole('button',{name:/Blind practice/}).getAttribute('aria-expanded'),'true');
  await card.locator('.blind-grid').click({position:{x:1,y:20}});
  assert.equal(await card.getByRole('button',{name:/Blind practice/}).getAttribute('aria-expanded'),'true','clicking the grid edge must not collapse practice');
  for(let i=0;i<8;i++){
    await card.locator('.blind-cell').nth(i).click();
    assert.equal(await card.getByRole('button',{name:/Blind practice/}).getAttribute('aria-expanded'),'true');
  }
  const toggle = card.getByRole('checkbox',{name:'Green background on filled cells'});
  const given = card.locator('.blind-cell.given').first();
  const background = locator => locator.evaluate(el=>getComputedStyle(el).backgroundColor);
  assert.equal(await background(given),'rgb(232, 239, 223)');
  await toggle.uncheck();
  assert.equal(await card.getByRole('button',{name:/Blind practice/}).getAttribute('aria-expanded'),'true');
  assert.equal(await background(given),'rgb(255, 255, 255)');
  await blank.click();
  await card.getByRole('button',{name:'Enter 1'}).click();
  assert.equal(await background(blank),'rgb(255, 255, 255)');
  await toggle.check();
  assert.equal(await background(blank),'rgb(232, 239, 223)');
  assert.equal(await background(given),'rgb(232, 239, 223)');
  const blankIndex = await blank.evaluate(el=>Array.from(el.parentElement.children).indexOf(el));
  await card.locator('.blind-cell').nth((blankIndex+1)%36).click();
  await card.locator('.blind-cell').nth((blankIndex+2)%36).click();
  assert.match(await blank.getAttribute('aria-label'),/hidden/);
  assert.equal(await background(blank),'rgb(232, 239, 223)');
  console.log('PASS desktop practice clicks stay open and fill background toggles');
} finally { await browser.close(); }
