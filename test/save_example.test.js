const assert = require("node:assert/strict");
const test = require("node:test");

test("Save Example resolves active variant names to a canonical metadata id", async () => {
  const { metadataVariantIdForActiveVariants } = await import("../docs/src/exampleSave.mjs");

  const variants = [
    { id: "antiKing", name: "Anti King" },
    { id: "littleKiller", name: "Little Killer" },
  ];

  assert.equal(metadataVariantIdForActiveVariants(["anti king"], variants), "antiKing");
  assert.equal(metadataVariantIdForActiveVariants(["little killer"], variants), "littleKiller");
  assert.equal(metadataVariantIdForActiveVariants(["classic", "anti_king"], variants), "antiKing");
  assert.equal(metadataVariantIdForActiveVariants(["anti king", "little killer"], variants), null);

  const api = require("node:fs").readFileSync("vite.config.js", "utf8");
  assert.match(api, /variant\.id === variantId/);
});

test("wiki validator and regression snippets expose useful implementation details", () => {
  const fs = require("node:fs");
  const marks = fs.readFileSync("docs/src/variantMarks.ts", "utf8");
  const catalog = fs.readFileSync("docs/src/VariantCatalogApp.svelte", "utf8");

  assert.doesNotMatch(marks, /loadVariantFixture/);
  assert.doesNotMatch(marks, /throw new Error/);
  assert.match(catalog, /Partial validator/);
  assert.match(catalog, /Full validator/);
  assert.match(marks, /const validValues =/);
  assert.match(marks, /const invalidValues =/);
});
