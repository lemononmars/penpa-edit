const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { chromium } = require("playwright");

test("Laxman Rekha presets its grid and enters its clues from the input panel", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.resolve(__dirname, "../vite.config.js"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`${origin}/puzzle`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.penpaBoardReady && document.querySelector(".studio-shell.ready"));
    await page.getByRole("button", { name: "Genre" }).first().click();
    await page.locator("#puzzle-genre").selectOption("laxman-rekha");
    assert.deepEqual(await page.evaluate(() => ({
      kind: pu.gridtype, rows: pu.ny, columns: pu.nx, display: pu.mode.grid,
      frameStyles: [...new Set(Object.values(pu.frame))], mode: pu.mode.pu_q.edit_mode,
      extraButtons: document.querySelectorAll(".genre-section > button").length,
    })), { kind: "square", rows: 25, columns: 25, display: ["2", "1", "2"], frameStyles: [11], mode: "symbol", extraButtons: 1 });

    const wrongCell = await page.evaluate(() => {
      const xs = [...new Set(pu.centerlist.map(id => pu.point[id].x))].sort((a,b)=>a-b);
      const ys = [...new Set(pu.centerlist.map(id => pu.point[id].y))].sort((a,b)=>a-b);
      const vertex = (r,c) => pu.point.findIndex(p => p?.type === 1 && p.use === 1 && Math.abs(p.x - (xs[0] - (xs[1]-xs[0])/2 + c*(xs[1]-xs[0]))) < .1 && Math.abs(p.y - (ys[0] - (ys[1]-ys[0])/2 + r*(ys[1]-ys[0]))) < .1);
      const add = (r,c,rr,cc) => { const a=vertex(r,c),b=vertex(rr,cc); if(a<0||b<0) throw Error('Missing vertex'); pu.pu_a.lineE[`${Math.min(a,b)},${Math.max(a,b)}`]=3; };
      for(let c=10;c<12;c++){add(10,c,10,c+1);add(12,c,12,c+1);}
      for(let r=10;r<12;r++){add(r,10,r+1,10);add(r,12,r+1,12);}
      const id=pu.centerlist.find(id => pu.point[id].x===xs[10]&&pu.point[id].y===ys[10]);
      pu.pu_q.number[id]=['W',1,'1']; pu.redraw(); return id;
    });
    await page.getByRole("button", { name: "Check puzzle" }).click();
    assert.match(await page.locator(".puzzle-check-message").textContent(), /wrong side/i);
    assert.equal(await page.locator(".puzzle-check-highlight").count(), 1);
    const highlightOffset = await page.evaluate(id => {
      const mark=document.querySelector('.puzzle-check-highlight').getBoundingClientRect();
      const canvas=document.querySelector('#canvas').getBoundingClientRect();
      const scale=canvas.width/document.querySelector('#canvas').clientWidth;
      return Math.hypot(mark.left+mark.width/2-(canvas.left+pu.point[id].x*scale), mark.top+mark.height/2-(canvas.top+pu.point[id].y*scale));
    }, wrongCell);
    assert.ok(highlightOffset < 3, `highlight is ${highlightOffset}px from the wrong clue`);
    await page.evaluate(id => { delete pu.pu_q.number[id]; pu.pu_a.lineE={}; pu.redraw(); }, wrongCell);
    const panel = page.locator(".desktop-input-panel .tool-input-panel");
    const arrowPixels = await panel.locator('button[aria-label="Up arrow"] canvas').evaluate((canvas) => {
      const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      let visible = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i]) visible++;
      return visible;
    });
    assert.ok(arrowPixels > 0, "Myopia arrows render in their panel buttons");
    assert.deepEqual(await panel.locator("button:not(.panel-action)").evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label"))),
      ["Left arrow", "Up arrow", "Right arrow", "Down arrow"]);

    await page.getByRole("tab", { name: "Polygraph" }).last().click();
    assert.equal(await page.evaluate(() => pu.mode.qa), "pu_q", "clues return to Question mode");
    assert.equal(await page.evaluate(() => pu.mode.pu_q.number[1]), 3, "Polygraph uses gray numbers");

    await page.getByRole("tab", { name: "Parallel Counts" }).last().click();
    const edge = await page.evaluate(() => {
      const id = pu.point.findIndex((point) => point?.type === 2 && point?.neighbor?.length === 2 && point.use === 1);
      pu.mouse_mode = "down_left";
      pu.mouse_number(0, 0, id);
      return id;
    });
    assert.ok(edge >= 0);
    await panel.locator('button[aria-label="5"]').click();
    assert.deepEqual(await page.evaluate((id) => ({ symbol: pu.pu_q.symbol[id], number: pu.pu_q.number[id] }), edge), {
      symbol: [1, "square_S", 2], number: ["5", 1, "5"],
    });

    await page.getByRole("tab", { name: "Sheep / Wolf" }).last().click();
    const sheep = await page.evaluate(() => {
      const id = pu.centerlist[12];
      pu.mouse_mode = "down_left";
      pu.mouse_number(0, 0, id);
      return id;
    });
    await panel.locator('button[aria-label="S"]').click();
    assert.deepEqual(await page.evaluate((id) => ({ number: pu.pu_q.number[id], lines: Object.keys(pu.pu_q.line).length }), sheep), {
      number: ["S", 1, "1"], lines: 0,
    });
    await page.getByRole("tab", { name: "Kurarin" }).last().click();
    const corner = await page.evaluate(() => {
      const id = pu.point.findIndex((point) => point?.type === 1 && point.use === 1);
      pu.mouse_mode = "down_left";
      pu.mouse_symbol(0, 0, id);
      return id;
    });
    await panel.locator('button[aria-label="Gray"]').click();
    assert.deepEqual(await page.evaluate((id) => pu.pu_q.symbol[id], corner), [5, "circle_SS", 2]);
    const zoomButton = page.getByRole("button", { name: "Zoom in" });
    await zoomButton.click();
    assert.match(await page.locator("#puzzle-container").evaluate(el => el.style.transform), /scale\(/);
    await page.getByRole("button", { name: "Pan board", exact: true }).click();
    const pan = page.getByRole("button", { name: "Drag to pan board" });
    const bounds = await pan.boundingBox();
    await page.mouse.move(bounds.x + 80, bounds.y + 80);
    await page.mouse.down();
    await page.mouse.move(bounds.x + 120, bounds.y + 115);
    await page.mouse.up();
    assert.match(await page.locator("#puzzle-container").evaluate(el => el.style.transform), /translate\(40px, 35px\)/);
    await page.getByRole("button", { name: "Pan board", exact: true }).click();
    await page.getByRole("button", { name: "Check puzzle", exact: true }).click();
    assert.match(await page.locator(".puzzle-check-message").textContent(), /closed loop/i);
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(`${origin}/puzzle`, { waitUntil: "domcontentloaded" });
    await mobile.waitForFunction(() => window.penpaBoardReady && document.querySelector(".studio-shell.ready"));
    await mobile.locator(".mobile-deck-tabs button").filter({ hasText: "Genre" }).click();
    await mobile.locator("#puzzle-genre").selectOption("laxman-rekha");
    await mobile.getByRole("tab", { name: "Sheep / Wolf" }).last().click();
    assert.equal(await mobile.locator(".genre-mobile-panel").evaluate((panel) =>
      panel.getBoundingClientRect().bottom <= panel.closest(".mobile-deck-pane").getBoundingClientRect().bottom), true);
    const wolf = await mobile.evaluate(() => {
      const id = pu.centerlist[20];
      pu.mouse_mode = "down_left";
      pu.mouse_number(0, 0, id);
      return id;
    });
    await mobile.locator('.genre-mobile-panel button[aria-label="W"]').click();
    assert.deepEqual(await mobile.evaluate((id) => pu.pu_q.number[id], wolf), ["W", 1, "1"]);
    await mobile.locator(".genre-section").getByRole("button", { name: "Check puzzle" }).click();
    assert.equal(await mobile.locator(".genre-section .puzzle-check-message").isVisible(), true);
    await mobile.locator(".mobile-deck-tabs button").filter({ hasText: "Solve" }).click();
    assert.deepEqual(await mobile.evaluate(() => [pu.mode.qa,pu.mode.pu_a.edit_mode,pu.mode.pu_a.combi[0]]), ["pu_a", "combi", "edgex"]);
    const mobileVisibility = mobile.getByRole("checkbox", { name: "Show solution" });
    assert.equal(await mobileVisibility.isVisible(), true);
    await mobileVisibility.uncheck();
    assert.equal(await mobile.evaluate(() => window.penpaEditorHideSolution), true);
    assert.deepEqual(pageErrors, []);
  } finally {
    await browser?.close();
    await server.close();
  }
});

