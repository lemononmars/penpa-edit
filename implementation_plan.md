# Penpa-Edit Multi-Feature Implementation Plan

## Overview

9 changes spanning bug fixes, UX improvements, and new constraint implementations.

---

## Open Questions

> [!IMPORTANT]
> **Position sums semantics**: The description says "leftmost outside clue gives the sum of digits in positions A and B, and the second leftmost gives the sum of A and B." Both descriptions are identical — please clarify what A, B are for each slot. My current interpretation: **outer clue = sum of cell 1 + cell 2 from the grid edge; inner clue = sum of cell 1 + cell 2 from the opposite edge** (like a positional variant with two fixed endpoints).

> [!IMPORTANT]
> **Sum sandwich vs. existing sandwich**: Is "sum sandwich" the standard sandwich (sum between 1 and 9 endpoints), but restricting clues to left+top only (not right+bottom) and using large numbers (number:long)? Or is it a truly different rule?

---

## Proposed Changes

### 1 — Bug: Color Theme Selector

**Root cause**: `THEME_LIGHT = 1`, `THEME_DARK = 2` in settings.js, but `toggleTheme` writes `darkTheme ? 1 : 0` and `start()` init reads `=== 1` as dark.

#### [MODIFY] [App.svelte](file:///c:/coding%20projects/penpa-edit/docs/src/App.svelte)
```diff
- settings.color_theme = darkTheme ? 1 : 0;
+ settings.color_theme = darkTheme ? 2 : 1;

- if (settings.color_theme === 1) {
-   darkTheme = true;
- } else if (settings.color_theme === 0) {
-   darkTheme = false;
+ if (settings.color_theme === 2) {
+   darkTheme = true;
+ } else if (settings.color_theme === 1) {
+   darkTheme = false;
```

---

### 2 — Bug: Starting Grid Size (6×6 not applied)

**Root cause**: `set_default_sudoku_board_options()` always sets `nb_sudoku5.checked = false`, ignoring the saved size.

#### [MODIFY] [general.js](file:///c:/coding%20projects/penpa-edit/docs/js/general.js)
```diff
  document.getElementById("nb_sudoku1").checked = false;
  ...
- document.getElementById("nb_sudoku5").checked = false;
+ document.getElementById("nb_sudoku5").checked = (size === 6);
  document.getElementById("nb_sudoku6").checked = false;
```

---

### 3 — Bug: Number + Long Input Parsing

**Root cause**: `outsideClueFromEntry` only reads `entry[2] === "1"`. Penpa's "long" number submode uses code `"10"`, so those entries return `null`.

#### [MODIFY] [sudoku_solver.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_solver.js)
```diff
  function outsideClueFromEntry(entry) {
-   if (!entry || entry[2] !== "1") return null;
+   if (!entry || (entry[2] !== "1" && entry[2] !== "10")) return null;
    var value = parseInt(entry[0], 10);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
```

---

### 4 — Feature: "Keep Variants" in New Grid Modal

Add a checkbox to the confirm-grid dialog. When checked, `resetForNewGrid()` (which resets variants back to "classic") is skipped.

#### [MODIFY] [App.svelte](file:///c:/coding%20projects/penpa-edit/docs/src/App.svelte)
- Add `let keepVariants = false;` state variable.
- In `requestNewGrid()`, reset `keepVariants = false`.
- In confirm-grid modal: add a `<label><input type="checkbox" bind:checked={keepVariants}> Keep current variants</label>`.
- In `createGrid()`: conditionally call `resetForNewGrid`.

---

### 5 — Feature: Solve → Switch to "Set" Editing Mode

After `applySolution` succeeds in `solveOnce`, dispatch a DOM mutation (or custom event) so the Svelte MutationObserver picks up the layer change. Also, `enterSolutionSudokuMode` already sets `sudoku[0] = "1"` (set mode), so we just need the UI to sync.

#### [MODIFY] [sudoku_solver.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_solver.js)
- After `pu.redraw()` in `solveOnce`, dispatch a `CustomEvent('sudoku-solved')` on `document.body` which App.svelte listens for to call `syncState()`.
- In App.svelte `onMount`, add `document.body.addEventListener('sudoku-solved', syncState)`.

---

### 6 — New: Unique Rectangles (no input)

A global constraint: no 2×2 (or larger rectangular) set of 4 cells sharing the same two distinct digits. This is a no-input constraint applied to the entire board.

#### [MODIFY] [sudoku_solver.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_solver.js)
- Add `uniqueRectangles: false` to the constraints init object.
- When `variantEnabled(puzzle, "uniquerectangles")`, set `constraints.uniqueRectangles = true` and push to `supported`.

#### [MODIFY] [sudoku_csp.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_csp.js)
- Add `registerConstraint("uniqueRectangles", {...})` that validates: for every pair of rows (r1, r2) and every pair of cols (c1, c2), the 4 cells can't be filled with exactly 2 distinct digits.

#### [MODIFY] [constraints.js](file:///c:/coding%20projects/penpa-edit/docs/js/constraints.js)
- Add `"unique rectangles"` to options and implemented_sudoku arrays; no `show` modes needed (no input).

#### [MODIFY] [variant_metadata.json](file:///c:/coding%20projects/penpa-edit/variant_metadata.json)
- Add `uniquerectangles` variant entry.

---

### 7 — New: Sum Skyscrapers

Like skyscrapers, but the outside clue is the **sum of heights of all visible buildings** (rather than the count of visible buildings).

#### [MODIFY] [sudoku_solver.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_solver.js)
- Add `sumskyscrapers: []` to constraints init.
- When `variantEnabled(puzzle, "sumskyscrapers")`, read outside clues with `outsideClueFromEntry` from all 4 sides (same indexing as skyscraper), push `{ clue, cells }` to `constraints.sumskyscrapers`.

#### [MODIFY] [sudoku_csp.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_csp.js)
- `registerConstraint("sumskyscrapers", { validatePartial: ... })`: for each sightline, simulate visibility (running max) and sum the visible heights. Return `sum === clue.clue` when all filled, `true` if blanks remain.

#### [MODIFY] [constraints.js](file:///c:/coding%20projects/penpa-edit/docs/js/constraints.js)
- Add `"sum skyscrapers"` to implemented list; show `sub_number1_lb` outside input; set `outside: true`.

---

### 8 — New: Sum Sandwich (left + top only, number:long)

Standard sandwich rule (sum of digits between 1 and 9) but clues appear **only on the left and top** sides, using large-number input (`number:long` = submode `"10"`).

#### [MODIFY] [sudoku_solver.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_solver.js)
- Add `sumsandwiches: []` to constraints init.
- When `variantEnabled(puzzle, "sumsandwich")`, read left + top clues only (no right/bottom) using `outsideClueFromEntry`, push `{ clue, cells }`.

#### [MODIFY] [sudoku_csp.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_csp.js)
- `registerConstraint("sumsandwiches", { validatePartial: ... })`: re-use existing sandwich logic (sum between 1 and 9).

#### [MODIFY] [constraints.js](file:///c:/coding%20projects/penpa-edit/docs/js/constraints.js)
- Add `"sum sandwich"` entry with `outside: true`, `sub_number10_lb` (long number input mode).

---

### 9 — New: Position Sums (2 outside layers)

> [!WARNING]
> Semantics need confirmation (see Open Questions). Proceeding with interpretation: **outer clue = sum of cell at position given by the inner clue**.  
> More specifically: two slots. Outer slot (layer 2) gives the position P; inner slot (layer 1) gives the expected digit value at that position. Equivalent to existing `position` but expands to 2 layers.

#### [MODIFY] [sudoku_solver.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_solver.js)
- Add `positionSums: []` to constraints init.
- When `variantEnabled(puzzle, "positionsum")`, read **2 layers** of outside clues (left + top only), pairing them as `{ position: outerClue, sum: innerClue, cells }`.

#### [MODIFY] [sudoku_csp.js](file:///c:/coding%20projects/penpa-edit/docs/js/sudoku_csp.js)
- Add handler for `positionSums` that validates `cells[position - 1] === sum` when both clues and the cell are filled.

#### [MODIFY] [constraints.js](file:///c:/coding%20projects/penpa-edit/docs/js/constraints.js)
- Add `"position sum"` entry with `outside: true`, 2-layer outside space.

---

## Verification Plan

### Automated Tests
- `npm run dev` — check the dev server compiles without TypeScript errors.

### Manual Verification
1. **Color theme**: Toggle theme button; verify it correctly applies dark/light and persists across reload.
2. **Grid size**: Set 6×6 as default in settings; reload; verify 6×6 grid loads.
3. **Long input**: Use number:long mode on an outside clue for skyscraper; verify solver reads it.
4. **Keep variants**: Open New Grid → 9×9 with a non-classic variant active; check "keep variants"; confirm grid resets but variant remains.
5. **Solve→set**: Click Solve button; verify the layer indicator switches to solution/"set" mode.
6. **Unique Rectangles**: Enable, verify it detects UR patterns during auto-solve.
7. **Sum Skyscrapers**: Place sum-skyscraper clues; verify solver respects them.
8. **Sum Sandwich**: Place sum-sandwich clues (left/top); verify solver respects them.
9. **Position Sums**: Place position-sum clues (2 cells outside); verify 2 slots are read.
