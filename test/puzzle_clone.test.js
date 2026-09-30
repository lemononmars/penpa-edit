const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');
test('Clone here boots', async () => {
 const {createServer} = await import('vite');
 const server = await createServer({configFile:path.resolve(__dirname,'../vite.config.js'),logLevel:'silent',server:{host:'127.0.0.1',port:0}});
 await server.listen(); let browser;
 try {
  browser = await chromium.launch({headless:true}); const context = await browser.newContext({viewport:{width:1360,height:900}}); const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/puzzle`); await page.waitForFunction(() => window.penpaBoardReady); await page.getByRole('button',{name:'Genre'}).first().click(); await page.locator('#puzzle-genre').selectOption('laxman-rekha'); await page.evaluate(() => { const id=pu.centerlist[0]; pu.pu_q.number[id]=['W',1,'1']; pu.redraw(); });
  await context.addCookies([{name:'color_theme',value:'2',url:page.url()}]); const errors=[]; context.on('page',p=>p.on('pageerror',e=>errors.push(e.message))); const opened = context.waitForEvent('page'); await page.getByRole('button',{name:/Clone/}).first().click(); await page.getByRole('menuitem',{name:'Clone here'}).click();
  const clone = await opened; await clone.waitForLoadState('domcontentloaded'); await clone.waitForTimeout(1500);
  assert.deepEqual(errors,[]); assert.equal(await clone.evaluate(() => !!window.pu?.point?.length),true); assert.equal(await clone.evaluate(() => pu.nx),25); assert.equal(await clone.locator('#puzzle-genre').inputValue(),'laxman-rekha'); assert.ok(await clone.evaluate(() => Object.values(pu.pu_q.number).some(mark => mark[0] === 'W')));
 } finally { await browser?.close(); await server.close(); }
});
