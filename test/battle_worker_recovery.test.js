const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { chromium } = require("playwright");

test("battle generation retries after one self-contained worker network failure", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.resolve(__dirname, "../vite.config.js"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator,
    );
    let abortedRequests = 0;
    await page.route("**/js/sudoku_generator_worker_bundle.js*", async (route) => {
      if (abortedRequests++ === 0) await route.abort("failed");
      else await route.continue();
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 20000);
      document.addEventListener("sudoku-generated", (event) => {
        clearTimeout(timeout);
        resolve({ type: "result", givens: event.detail.givens });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(6);
      window.SudokuTools.generatePuzzle(6, ["classic"], {}, null, 123, "easy");
    }));
    assert.equal(abortedRequests >= 1, true);
    assert.equal(result.type, "result", result.message || "generation timed out");
  } finally {
    await browser.close();
    await server.close();
  }
});

test("Windoku generation cache-busts the self-contained worker after startup fails", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({
    configFile: path.resolve(__dirname, "../vite.config.js"),
    logLevel: "silent",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator);
    await page.route("**/js/sudoku_generator_worker_bundle.js*", async (route) => {
      const retry = new URL(route.request().url()).searchParams.has("retry");
      if (retry) await route.continue();
      else await route.abort("failed");
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({
        type: "timeout",
        message: `${document.getElementById("sudoku-solver-status")?.textContent || ""}: ${document.getElementById("sudoku-solver-log-output")?.textContent || ""}`,
      }), 20000);
      document.addEventListener("sudoku-generated", (event) => {
        clearTimeout(timeout);
        resolve({ type: "result", givens: event.detail.givens });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(9);
      window.SudokuTools.generatePuzzle(9, ["classic", "windoku"], {}, null, 321, "easy");
    }));
    assert.equal(result.type, "result", result.message || "generation timed out");
  } finally {
    await browser.close();
    await server.close();
  }
});

test("variant generation does not leak an uncaught importScripts error", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile: path.resolve(__dirname, "../vite.config.js"), logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const uncaught = [];
    page.on("pageerror", (error) => uncaught.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") uncaught.push(message.text()); });
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator);
    let failures = 0;
    await page.route("**/js/sudoku_csp_variants/browser.js*", async (route) => {
      if (failures++ < 2) await route.abort("failed");
      else await route.continue();
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 20000);
      document.addEventListener("sudoku-generated", () => { clearTimeout(timeout); resolve({ type: "result" }); }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => { clearTimeout(timeout); resolve({ type: "error", message: event.detail }); }, { once: true });
      window.SudokuTools.prepareBattleGrid(6);
      window.SudokuTools.generatePuzzle(6, ["classic"], {}, null, 456, "easy");
    }));
    assert.equal(result.type, "result", result.message || "generation timed out");
    assert.deepEqual(uncaught.filter((message) => /importScripts/.test(message)), []);
  } finally {
    await browser.close();
    await server.close();
  }
});

test("battle generation does not depend on runtime importScripts variant requests", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile: path.resolve(__dirname, "../vite.config.js"), logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const uncaught = [];
    page.on("pageerror", (error) => uncaught.push(error.message));
    await page.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzle && window.SudokuGenerator);
    let variantRequests = 0;
    await page.route("**/js/sudoku_csp_variants/browser.js*", (route) => {
      variantRequests += 1;
      return route.abort("failed");
    });
    const result = await page.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 20000);
      document.addEventListener("sudoku-generated", () => {
        clearTimeout(timeout);
        resolve({ type: "result" });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(6);
      window.SudokuTools.generatePuzzle(6, ["classic"], {}, null, 789, "easy");
    }));
    assert.equal(result.type, "result", result.message || "generation timed out");
    assert.equal(variantRequests, 0);
    assert.deepEqual(uncaught.filter((message) => /importScripts/.test(message)), []);
    const mark = await page.evaluate(() => {
      for (let row = 0; row < 6; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const key = window.SudokuSolver.cellKey(window.pu, row, col);
          if (window.pu.pu_q.number[key]) continue;
          window.SudokuTools.setBattleDigit(row, col, 1, "#ff0000", "rgba(255,0,0,.14)");
          return {
            color: window.pu.pu_a_col.number[key],
            shade: window.pu.pu_a_col.surface[key],
            customColors: window.UserSettings ? window.UserSettings.custom_colors_on : true,
          };
        }
      }
      return null;
    });
    assert.deepEqual(mark, { color: "#ff0000", shade: "rgba(255,0,0,.14)", customColors: true });
    const battleHelpers = await page.evaluate(() => {
      let editableCell = null;
      for (let row = 0; row < 6 && !editableCell; row += 1) {
        for (let col = 0; col < 6; col += 1) {
          const key = window.SudokuSolver.cellKey(window.pu, row, col);
          if (!window.pu.pu_q.number[key] && !window.pu.pu_a.number[key]) {
            editableCell = { row, col, key };
            break;
          }
        }
      }
      if (!editableCell) throw new Error("Generated board has no editable cell");
      const focused = window.SudokuTools.focusBattleCell(editableCell.row, editableCell.col);
      const entered = window.SudokuTools.enterBattleDigit(2, "normal");
      const placedDigit = window.pu.pu_a.number[editableCell.key]?.[0] ?? null;
      const normalMode = window.pu.mode.pu_a.sudoku[0];
      window.SudokuTools.setBattleInputMode("center");
      return {
        focused,
        entered,
        placedDigit,
        normalMode,
        layer: window.pu.mode.qa,
        editMode: window.pu.mode.pu_a.edit_mode,
        noteMode: window.pu.mode.pu_a.sudoku[0],
        answerLink: window.SudokuTools.battleAnswerCheckLink(),
      };
    });
    assert.equal(battleHelpers.focused, true);
    assert.equal(battleHelpers.entered, true);
    assert.equal(battleHelpers.placedDigit, "2");
    assert.deepEqual(
      { layer: battleHelpers.layer, editMode: battleHelpers.editMode, normalMode: battleHelpers.normalMode, noteMode: battleHelpers.noteMode },
      { layer: "pu_a", editMode: "sudoku", normalMode: "1", noteMode: "3" },
    );
    assert.match(battleHelpers.answerLink, /#m=solve&p=/);
    assert.match(battleHelpers.answerLink, /&variants=classic/);
  } finally {
    await browser.close();
    await server.close();
  }
});

test("generated visual clues survive a native Penpa URL round trip", { timeout: 90000 }, async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ configFile: path.resolve(__dirname, "../vite.config.js"), logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  const address = server.httpServer.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    const generator = await browser.newPage();
    await generator.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1`, { waitUntil: "domcontentloaded" });
    await generator.waitForFunction(() => window.pu && window.SudokuTools?.generatePuzzleFromScratch);
    const generated = await generator.evaluate(() => new Promise((resolve) => {
      const timeout = setTimeout(() => resolve({ type: "timeout" }), 65000);
      document.addEventListener("sudoku-generated", (event) => {
        clearTimeout(timeout);
        const detail = event.detail;
        window.SudokuTools.restoreGeneratedMarks(detail);
        const nativeUrl = window.pu.maketext_duplicate();
        detail.outsideMarks = [{ variant: "xsums", side: "top", index: 0, value: 12 }];
        window.SudokuTools.restoreGeneratedMarks(detail);
        const snapshot = (layer) => Object.fromEntries(Object.entries(layer || {}).filter(([key]) => !key.startsWith("command_")));
        const payload = {
          kropkiMarks: (detail.kropkiMarks || detail.marks?.kropki || []).filter((mark) => mark.kind !== "none"),
          outsideMarks: detail.outsideMarks,
          questionLayers: { pu_q: snapshot(window.pu.pu_q), pu_q_col: snapshot(window.pu.pu_q_col) },
        };
        resolve({
          type: "result",
          url: `${nativeUrl}&generatedMarks=${encodeURIComponent(JSON.stringify(payload))}`,
          symbols: Object.keys(window.pu.pu_q.symbol || {}).length,
        });
      }, { once: true });
      document.addEventListener("sudoku-generation-error", (event) => {
        clearTimeout(timeout);
        resolve({ type: "error", message: event.detail });
      }, { once: true });
      window.SudokuTools.prepareBattleGrid(9, ["classic", "kropki"]);
      window.SudokuTools.generatePuzzleFromScratch(9, ["classic", "kropki"], null, 98765, "easy");
    }));
    assert.equal(generated.type, "result", generated.message || "generation timed out");
    assert.ok(generated.symbols > 0, "generator should place Kropki dots");

    const loaded = await browser.newPage();
    await loaded.addInitScript(() => {
      window.__penpaReadyEvents = 0;
      document.addEventListener("penpa-board-ready", () => { window.__penpaReadyEvents += 1; });
    });
    const generatedHash = new URL(generated.url).hash;
    await loaded.goto(`${origin}/index.html?embed=1&hideSidebar=1&battle=1${generatedHash}`, { waitUntil: "load" });
    await loaded.waitForFunction(() => window.penpaBoardReady === true, null, { timeout: 3000 });
    await loaded.waitForTimeout(250);
    const loadedState = await loaded.evaluate(() => {
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      const pixels = () => context.getImageData(0, 0, canvas.width, canvas.height).data;
      const changedPixels = (before, after) => {
        let changed = 0;
        for (let index = 0; index < before.length; index += 4) {
          if (before[index] !== after[index] || before[index + 1] !== after[index + 1] || before[index + 2] !== after[index + 2] || before[index + 3] !== after[index + 3]) changed += 1;
        }
        return changed;
      };
      const withAllMarks = pixels();
      const symbols = window.pu.pu_q.symbol;
      window.pu.pu_q.symbol = {};
      window.pu.redraw();
      const withoutInternalMarks = pixels();
      const internalPaintedPixels = changedPixels(withAllMarks, withoutInternalMarks);
      window.pu.pu_q.symbol = symbols;
      const centers = new Set((window.pu.centerlist || []).map(String));
      const outsideNumbers = Object.fromEntries(Object.entries(window.pu.pu_q.number || {}).filter(([key]) => !centers.has(String(key))));
      for (const key of Object.keys(outsideNumbers)) delete window.pu.pu_q.number[key];
      window.pu.redraw();
      const withoutOutsideMarks = pixels();
      const outsidePaintedPixels = changedPixels(withAllMarks, withoutOutsideMarks);
      Object.assign(window.pu.pu_q.number, outsideNumbers);
      window.pu.redraw();
      return {
        symbols: Object.keys(symbols || {}).length,
        outsideNumbers: Object.keys(outsideNumbers).length,
        internalPaintedPixels,
        outsidePaintedPixels,
        readyEvents: window.__penpaReadyEvents,
      };
    });
    assert.equal(loadedState.readyEvents, 1, "the board should publish one hydration-ready event");
    assert.equal(loadedState.symbols, generated.symbols, "serialized Kropki dots should be visible after reload");
    assert.ok(loadedState.outsideNumbers > 0, "the battle handoff should restore outside clues");
    assert.ok(loadedState.internalPaintedPixels > 0, `internal marks should be painted on the battle canvas: ${JSON.stringify(loadedState)}`);
    assert.ok(loadedState.outsidePaintedPixels > 0, `outside marks should be painted on the battle canvas: ${JSON.stringify(loadedState)}`);
  } finally {
    await browser.close();
    await server.close();
  }
});
