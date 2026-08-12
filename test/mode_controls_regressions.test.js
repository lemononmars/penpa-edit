const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "docs/src/App.svelte"), "utf8");
const floating = fs.readFileSync(path.join(root, "docs/src/FloatingInputPanel.svelte"), "utf8");
const keypad = fs.readFileSync(path.join(root, "docs/src/SudokuKeypad.svelte"), "utf8");

test("symbol previews use legacy bitmask arrays so compound shapes are visible", () => {
  assert.match(app, /function symbolPreviewNumber[\s\S]*?onoff_symbolmode_list[\s\S]*?Array\.from\(\{ length: count \}/);
  assert.match(app, /num:\s*mode === "symbol"[\s\S]*?symbolPreviewNumber\(symbolname, index\)/);
  assert.match(app, /previewAction:\s*categoryLabel\?\.id === "ms3"/);
  assert.match(app, /pickerItemPreview\(item\)[\s\S]*?<canvas use:renderSymbol/);
});

test("shape picker removes empty entries and folds Digital Frame into Seven Segment", () => {
  assert.match(app, /filter\(\(choice\) => choice\.id\.startsWith\(actionPrefix\) && Boolean\(choice\.label\)\)/);
  assert.match(app, /filter\(\(item\) => Boolean\(item\.label\) && Boolean\(item\.actionId \|\| item\.properties\.length\)\)/);
  assert.match(app, /actionId === "ms_degital_f"/);
  assert.match(app, /label: "Gray bg"/);
  assert.match(app, /numberCategory\.items = numberCategory\.items\.filter\(\(item\) => item !== frame\)/);
});

test("input buttons are light gray and the floating panel actions occupy columns three and four", () => {
  assert.match(app, /\.tool-input-panel button \{[\s\S]*?background:\s*#f1f3f5/);
  assert.match(floating, /class="panel-handle"[\s\S]*?on:pointerdown=\{startDrag\}/);
  assert.match(floating, /\.large-button-grid > button \{[\s\S]*?background:\s*#f1f3f5/);
  assert.match(floating, /\.erase-action \{ grid-column: 3; \}/);
  assert.match(floating, /\.clear-action \{ grid-column: 4; \}/);
});

test("number and symbol style buttons replace labels with visual previews", () => {
  assert.match(app, /class="number-style-svg"/);
  assert.match(app, /class="symbol-layer-style-svg"/);
  assert.match(app, /class="layer-arrows"/);
  assert.match(app, /class="layer-line"/);
});

test("cage styles use the requested order, names, and cage previews", () => {
  assert.match(app, /"10": "Black dash"[\s\S]*"16": "Black line"[\s\S]*"15": "Grey dash"[\s\S]*"7": "Grey line"/);
  assert.match(app, /const order = \["10", "16", "15", "7"\]/);
  assert.match(app, /pickerMode === "cage"[\s\S]*class="cage-style-svg"/);
});

test("shape groups show one symbol and arrows have a framed white-relative preview", () => {
  assert.match(app, /"circle", "square", "triup", "tridown", "triright", "trileft", "hexpoint", "hexflat"/);
  assert.match(app, /return sym \? \{ sym, num: symbolPreviewNumber\(sym, 0\) \}/);
  assert.match(app, /class:arrow-item-preview/);
  assert.match(app, /button\.arrow-item-preview[\s\S]*background: #fff/);
});

test("surface swatches use Penpa's actual palette", () => {
  for (const color of ["#b3ffb3", "#c0e0ff", "#ffa3a3", "#ffffa3", "#ffb3ff", "#ffcc80", "#cc99ff", "#eecab1"])
    assert.match(app, new RegExp(color.replace("#", "#")));
  assert.match(app, /style:background-color=\{\(pickerMode === "surface" \|\| pickerMode === "multicolor"\) \? surfaceSwatchColors\[option\.value\]/);
});

test("solve mode always uses the shared battle Sudoku keypad", () => {
  assert.match(app, /const mode = layer === "solution" \? "sudoku"/);
  assert.match(app, /class:hidden-section=\{layer !== "problem"\}/);
  assert.match(app, /<SudokuKeypad[\s\S]*onMode=\{chooseKeypadMode\}/);
  assert.match(keypad, /aria-label=\{t\("sudokuKeypad"\)\}/);
});
