import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLOWER_CELL_COUNT, createFlowerUnits, flowerConflicts, solveFlower, randomFlowerSolution, generateFlowerPuzzle } from '../docs/src/wsc2026/flowerSudoku.mjs';

function seededRng(initial = 1) {
  let seed = initial;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('random solution completes the empty board within its default search budget', () => {
  for (const seed of [1, 14]) {
    const result = randomFlowerSolution({ rng: seededRng(seed) });
    assert.equal(result.status, 'solved');
    assert.ok(result.nodes <= 500_000);
    assert.equal(result.solution.length, 90);
    for (const unit of createFlowerUnits()) assert.equal(new Set(unit.map((cell) => result.solution[cell])).size, 9);
  }
});

test('a budget limit is reported separately from an unsatisfiable puzzle', () => {
  const result = solveFlower(Array(90).fill(0), { maxNodes: 1 });
  assert.equal(result.status, 'limit');
  assert.equal(result.nodes, 1);
  assert.equal(result.solution, null);
});

test('Flower Sudoku topology has 90 cells and 30 nine-cell units', () => {
  const units = createFlowerUnits();
  assert.equal(FLOWER_CELL_COUNT, 90);
  assert.equal(units.length, 30);
  assert.ok(units.every((unit) => unit.length === 9 && new Set(unit).size === 9));
  const memberships = Array(FLOWER_CELL_COUNT).fill(0);
  units.flat().forEach((cell) => memberships[cell]++);
  assert.ok(memberships.every((count) => count === 3));
});

test('repeated digits in a Flower unit are highlighted and rejected', () => {
  const values = Array(FLOWER_CELL_COUNT).fill(0);
  values[0] = 4;
  values[1] = 4;
  assert.deepEqual([...flowerConflicts(values)].sort((a, b) => a - b), [0, 1]);
  assert.equal(solveFlower(values).status, 'invalid');
});

test('the solver fills a single empty Flower cell', () => {
  const values = randomFlowerSolution({ rng: seededRng() }).solution;
  const expected = values[42];
  values[42] = 0;
  const result = solveFlower(values);
  assert.equal(result.status, 'solved');
  assert.equal(result.solution[42], expected);
});

test('generated puzzle retains a unique completion and respects its clues', () => {
  const generated = generateFlowerPuzzle({ clues: 36, rng: seededRng() });
  assert.equal(generated.status, 'solved');
  const checked = solveFlower(generated.puzzle, { limitSolutions: 2 });
  assert.equal(checked.status, 'solved');
  assert.equal(checked.solutions.length, 1);
  assert.deepEqual(checked.solution, generated.solution);
  generated.puzzle.forEach((digit, cell) => { if (digit) assert.equal(checked.solution[cell], digit); });
});
