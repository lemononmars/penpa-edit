# Jules: implementing a Sudoku variant (genre)

This is the repository checklist for adding a new Sudoku variant or finishing a
variant currently marked `planned`. Do not mark a variant as supported merely
because it appears in the editor. In this project, editor input, Penpa parsing,
CSP validation, generation, metadata, and wiki documentation are separate
layers.

## 1. Start with one canonical identifier

Use the existing `id` in `variant_metadata.json` when one exists. Runtime code
usually compares a normalized value made by splitting camelCase and converting
it to lowercase. For example, metadata id `littleKiller` becomes runtime value
`little killer`.

Before adding another alias, check:

- `variant_metadata.json` → `scrapedAliases`
- `docs/src/variationCatalog.ts` → construction of `Variation.value`
- `docs/js/sudoku_solver.js` → `canonicalVariantName()`

Use the same canonical runtime value in `variantEnabled(...)`,
`constraints.supported`, editor settings, generator support, and tests. Do not
silently introduce a second spelling.

## 2. Describe the variant in `variant_metadata.json`

Update the matching object in `variant_metadata.json`:

- `name`: full user-facing name; never use the id as a label.
- `rules`: rules by supported board size.
- `status`: keep `planned` until parsing and CSP enforcement are tested.
- `scratchGeneratable`: keep `false` unless scratch generation is implemented.
- `inputType.categories`: one or more of `no-input`, `line`, `cage`,
  `shading`, `outside`, `cell`, `edge`, or `intersection`.
- `inputType.instructions`: exact authoring instructions and Penpa mode when the
  generic inference is insufficient.
- `tags`: semantic hints such as `outside` or `region`; do not use tags in place
  of an accurate input category.

Use `cage` for a Penpa cage or a grouped region. Use `shading` when the author
paints individual cells with Surface. A variant can require multiple categories,
for example `cage + shading` or `outside + shading`.

There are no per-variant icons in metadata. `docs/src/App.svelte` displays the
icon associated with the variant's primary input type.

## 3. Make the editor expose the correct Penpa tools

The catalog is installed by `installVariationCatalog()` in
`docs/src/variationCatalog.ts`. Its `genericSetting(variation)` returns the
legacy Penpa setting consumed by both the Svelte input panel and the old editor:

- `show`: legacy control element ids to expose.
- `modeset`: Penpa modes such as `surface`, `cage`, `line`, `number`, `symbol`,
  or `special`.
- `submodeset`: the matching submode for every mode.
- `styleset`: the matching style for every mode.
- `outside`: whether margin space/input is required.
- `regionEditor`: only for the persisted region-number editor family.

First try to express the input through metadata plus the generic family logic.
Add a narrowly scoped branch in `genericSetting()` when the variant needs a
specific submode/style or multiple coordinated tools. Keep the three mode,
submode, and style arrays aligned by index.

If the input needs custom interaction rather than a standard Penpa mode, inspect
the variant-mode code near `addVariantModeButton()` in
`docs/js/sudoku_solver.js`. Region-number editing for Irregular, Scattered,
Deficit, and Surplus is the model for a custom board overlay. Update
`docs/src/App.svelte` only for genuinely new UI behavior; catalog names,
categories, filters, and ordinary tools should remain metadata-driven.

For a new outside clue, also verify:

- `outsideVariationValues` in `docs/src/variationCatalog.ts` recognizes it.
- `outsideVariants` in `docs/js/sudoku_solver.js` includes it when conflicting
  outside modes must be prevented.
- the editor extends only the required grid sides and uses the required Penpa
  number/arrow style.

## 4. Parse native Penpa objects into normalized constraints

All solver input normalization starts in `readConstraints(puzzle)` in
`docs/js/sudoku_solver.js`.

1. Add a clearly named array/property to the `constraints` object initialized at
   the top of `readConstraints()`.
2. Detect the variant with `variantEnabled(puzzle, "canonical name")`.
3. Read the native object that the editor actually creates (`number`, `numberS`,
   `surface`, `symbol`, `line`, `lineE`, `cage`, `arrows`, etc.). Do not parse a
   convenient object different from the one produced by the input mode.
4. Convert point indexes to `{ row, col }` cells and produce a small normalized
   clue object. Keep Penpa geometry/index arithmetic inside the parser rather
   than the validator.
5. Preserve partial or layered clues. If either layer of a two-layer clue is
   independently meaningful, emit/validate it instead of discarding the whole
   clue because its partner is absent.
6. Push the canonical variant value into `constraints.supported` only after the
   parser recognized the expected clue representation. A selected variant with
   missing/malformed required clues must not be reported as successfully parsed.

Reuse nearby extraction helpers for the same placement family. Outside diagonal
clues, edge-midpoint numbers, corner numbers, cages, and surface components use
different Penpa indexes; copying arithmetic from another family is a common
source of clues that appear correctly but are invisible to the solver.

## 5. Register CSP enforcement

Constraint handlers live in `docs/js/sudoku_csp.js`. Register one with:

```js
registerConstraint("normalizedConstraintProperty", {
    validatePartial: function(board, clue, helpers) {
        // Return false as soon as the current assignment cannot be completed.
        return true;
    },
    validateComplete: function(board, clue, helpers) {
        // Optional when the partial validator is also exact on a full board.
        return true;
    }
});
```

The registration name must exactly match the property emitted by
`readConstraints()`. `validatePartial` is mandatory. Use it for sound pruning:
never reject an incomplete board that could still satisfy the clue. Add
`validateComplete` when the final condition is stronger or cheaper to express
once all relevant cells are assigned.

Use the supplied `helpers` and existing registered constraints for bounds,
cell-value, distinctness, and mask patterns. Validators should consume normalized
cells/clues, not inspect Penpa point ids or UI state.

If a rule affects candidate masks beyond ordinary validation, trace
`compileConstraints()`, evaluator creation, and candidate filtering in
`docs/js/sudoku_csp.js`; do not bolt candidate logic into the editor.

## 6. Add solver regression tests before declaring support

Add focused tests to `test/sudoku_solver.test.js`. A complete implementation
normally needs all of these:

1. **Parser-positive:** construct the real Penpa object and assert the normalized
   clue fields/cells from `SudokuSolver.readConstraints(puzzle)`.
2. **Parser-negative:** a similar-looking wrong style/orientation/layer must not
   be mistaken for the clue.
3. **Partial validator:** an incomplete assignment that can still work passes;
   one that can no longer work fails.
4. **Complete validator:** explicit valid values pass and explicit violating
   values fail.
5. **Supported flag:** assert `constraints.supported.includes(canonicalId)` only
   for a recognized supported representation.
6. **End-to-end solve/check:** demonstrate that a board accepted without the new
   constraint is rejected when the parsed constraint is present.

Use actual clue values in the test. Avoid opaque helpers such as
`loadVariantFixture("name", "valid")` unless the assertion also exposes the
concrete board and clue that are being tested.

Run the focused test while iterating, then the full solver suite:

```text
node --test --test-name-pattern="Variant Name" test/sudoku_solver.test.js
npm run test:solver
```

UI/category changes should also get a regression in
`test/latest_ui_regressions.test.js` or `test/app_ui_regressions.test.js`.

## 7. Generation is a separate opt-in

“Generate from existing” can preserve parsed constraints and is broader than
scratch generation. Scratch generation is controlled in
`docs/js/sudoku_generator.js`:

- Add the canonical value to the local `supported` list in `generate()` only
  after the generator can construct a valid global constraint and/or native mark.
- Update `globalConstraints(...)`, `addGeneratedMarks(...)`, symmetry units, and
  clue serialization as required by the variant.
- Add deterministic seeded tests covering both generated solution validity and
  the emitted native Penpa marks.
- Only then set `scratchGeneratable: true` in `variant_metadata.json`.

If only generation from an existing authored puzzle works, leave
`scratchGeneratable` false.

## 8. Update wiki implementation documentation

The wiki derives its displayed input modes and status from metadata. Add or
update the concrete documentation snippets in `docs/src/variantMarks.ts`:

- `cspImplementationFor(...)`: show both meaningful partial and full validator
  behavior for the variant.
- `solverTestCasesFor(...)`: show concrete valid/invalid test values.
- `inferredMarkChoice(...)`: add a special case only when input metadata cannot
  identify the native Penpa mark accurately.

Do not set metadata `status` to `available` merely to move it out of the wiki
backlog. Set it only after the parser, validator, and regression tests above are
working.

## 9. Final verification checklist

Before handing off:

- The full variant name appears in Add Variant and Input Modes.
- Selecting it exposes every required tool and no unrelated tool.
- A puzzle round-trips through a duplicate link without losing its clue objects.
- `readConstraints()` finds the clue created by the editor.
- Valid partial and full assignments pass; explicit violations fail.
- Unsupported or malformed lookalike marks are not consumed.
- `constraints.supported` reports the canonical id only when appropriate.
- `variant_metadata.json` has the correct `status`, input categories, and
  `scratchGeneratable` value.
- Wiki detail shows useful partial/full validators and concrete regression data.
- `npm run test:solver`, relevant UI tests, `npm run build`, and
  `git diff --check` pass (report any known unrelated failures separately).

The most reliable implementation order is: failing parser/validator test →
metadata/editor input → parser → CSP handler → green solver test → wiki/status →
optional scratch generation.
