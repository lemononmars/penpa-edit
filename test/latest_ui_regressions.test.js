const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "docs/src/App.svelte"), "utf8");
const general = fs.readFileSync(path.join(root, "docs/js/general.js"), "utf8");
const catalog = fs.readFileSync(path.join(root, "docs/src/variationCatalog.ts"), "utf8");
const solver = fs.readFileSync(path.join(root, "docs/js/sudoku_solver.js"), "utf8");

test("new-grid confirmation offers Cancel, Keep variants, and Classic actions", function() {
    const modal = app.match(/\{#if studioModal === "confirm-grid"\}([\s\S]*?)\{:else if/)?.[1] || "";
    assert.match(modal, />Cancel<\/button>/);
    assert.match(modal, />Keep variants<\/button>/);
    assert.match(modal, />Classic<\/button/);
    assert.doesNotMatch(modal, /type="checkbox"/);
});

test("7x7 grids draw each row as its default region", function() {
    assert.match(general, /requestedSudokuSize === 7[\s\S]*?rows\s*=\s*\[2,\s*3,\s*4,\s*5,\s*6,\s*7\][\s\S]*?cols\s*=\s*\[\]/);
});

test("mobile owns shortcut visibility, viewport sizing, and a square board host", function() {
    assert.match(app, /@media \(max-width: 768px\)[\s\S]*?\.tab-key-hint[\s\S]*?display:\s*none/);
    assert.match(app, /@media \(max-width: 768px\)[\s\S]*?\.mobile-input-panel[\s\S]*?kbd[\s\S]*?display:\s*none/);
    assert.match(app, /@media \(max-width: 768px\)[\s\S]*?\.studio-grid\s*\{[\s\S]*?flex:\s*1/);
    assert.match(app, /@media \(max-width: 768px\)[\s\S]*?\.board-host\s*\{[\s\S]*?aspect-ratio:\s*1/);
});

test("mobile input modes expose a keyboard-free Add variant menu", function() {
    assert.match(app, /class="mobile-add-variant"/);
    assert.match(app, /class="mobile-add-variant"[\s\S]*?>\+<\/button/);
    assert.match(app, /class="input-mode-scroll-hint"/);
    assert.match(app, /class="variant-menu input-mode-variant-menu"/);
});

test("region-family variants are available as no-input rules", function() {
    const metadata = JSON.parse(fs.readFileSync(path.join(root, "variant_metadata.json"), "utf8"));
    const byId = new Map(metadata.variants.map((variant) => [variant.id, variant]));
    ["scattered", "deficit", "surplus"].forEach(function(id) {
        assert.equal(byId.get(id).status, "available");
        assert.deepEqual(byId.get(id).inputType.categories, ["no-input"]);
    });
});

test("every region-number variant advertises Regions without polluting Penpa modes", function() {
    assert.match(catalog, /regionGridVariants[\s\S]*?regionEditor:\s*true/);
    assert.doesNotMatch(catalog, /add\("irregular",\s*"regions"/,
        "Regions is a custom editor capability, not a native pu.mode entry");
    assert.match(catalog, /regionGridVariants\.includes\(variation\.value\)[\s\S]*?genericSetting\(variation\)/);
});

test("region-number variants remain visible without a legacy Penpa setting", function() {
    assert.match(solver,
        /var isRegionGridVariant[\s\S]*?if \(!setting && !isRegionGridVariant\)[\s\S]*?return/);
});

test("variant input types separate cages from surface shading", function() {
    const metadata = JSON.parse(fs.readFileSync(path.join(root, "variant_metadata.json"), "utf8"));
    const byId = new Map(metadata.variants.map((variant) => [variant.id, variant]));
    const app = fs.readFileSync(path.join(root, "docs/src/App.svelte"), "utf8");

    assert.equal(Object.hasOwn(metadata, "icons"), false);
    assert.equal(metadata.variants.some((variant) => variant.inputType.categories.includes("region")), false);
    assert.deepEqual(byId.get("killer").inputType.categories, ["cage"]);
    assert.deepEqual(byId.get("difference2neighbours").inputType.categories, ["shading"]);
    assert.deepEqual(byId.get("samesum").inputType.categories, ["shading"]);
    assert.deepEqual(byId.get("renbankiller").inputType.categories, ["cage", "shading"]);
    assert.match(app, /value: "cage", label: "Cage"/);
    assert.match(app, /value: "shading", label: "Shading"/);
    assert.match(app, /inputTypeIcons\[primaryVariantTab\(variant\)\]/);
    assert.doesNotMatch(app, /variantMetadata\.icons/);
});

test("mobile actions place Clear Mark after Undo and keep About and Save Example in a bottom row", function() {
    assert.match(app, /class="action-group final-actions"[\s\S]*?>Undo<\/button[\s\S]*?>Clear mark<\/button/);
    assert.match(app, /class="action-group bottom-actions"[\s\S]*?>Save Example<\/button[\s\S]*?>About<\/button/);
});

test("mobile solver log has an in-row expand control", function() {
    assert.match(app, /class="solver-status"[\s\S]*?class="expand-btn"[\s\S]*?fullLogExpanded/);
});

test("variant modes expose both Dead or Alive arrows and the diagonal cursor", function() {
    assert.match(catalog, /const add = \([^)]*allowDuplicateMode = false/);
    assert.match(catalog, /add\("symbol", "arrow_B_W"[\s\S]*?add\("symbol", "arrow_B_G"[^;]*true\)/);
    assert.match(solver, /pu\.diagonal_consecutive_mode[\s\S]*?UserSettings\.draw_edges = true/);
    assert.match(solver, /variant === "deadoralivearrows"[\s\S]*?"White Arrow"[\s\S]*?"Grey Arrow"/);
});

test("translation initializer and language setting are no longer loaded", function() {
    const index = fs.readFileSync(path.join(root, "docs/index.html"), "utf8");
    const main = fs.readFileSync(path.join(root, "docs/js/main.js"), "utf8");

    assert.doesNotMatch(index, /\.\/js\/translate\.js/);
    assert.match(index, /\.\/js\/penpa_text\.js/);
    assert.match(index, /<tr class="permanently-hidden-control">[\s\S]*?id="language_opt"/);
});
