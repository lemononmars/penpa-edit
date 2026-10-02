import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PENTAGRAM_UNITS, PENTAGRAM_CELL_UNITS, pentagramGeometry, pentagramConflicts, randomPentagramSolution, generatePentagramPuzzle, solvePentagram } from '../docs/src/wsc2026/pentagram.mjs';

test('Pentagram has 80 cells, twenty cross-point lines, and ten eight-cell regions', () => {
  assert.equal(PENTAGRAM_CELL_UNITS.length, 80);
  assert.equal(PENTAGRAM_UNITS.length, 30);
  assert.ok(PENTAGRAM_UNITS.every((unit) => unit.length === 8 && new Set(unit).size === 8));
  assert.ok(PENTAGRAM_CELL_UNITS.every((units) => units.length === 3));
  for (const unit of PENTAGRAM_UNITS.slice(0, 20)) {
    assert.equal(new Set(unit.map((cell) => pentagramGeometry(cell).point)).size, 2);
  }
  for (const unit of PENTAGRAM_UNITS.slice(20)) {
    assert.equal(new Set(unit.map((cell) => pentagramGeometry(cell).point)).size, 1);
  }
});

test('Pentagram accepts 9 and infers the eight-digit set when solving and generating', () => {
  let seed=1;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const solved=randomPentagramSolution({rng});
  assert.equal(solved.status,'solved');
  assert.equal(new Set(solved.solution).size,8);
  assert.ok(solved.solution.includes(9));
  assert.equal(pentagramConflicts(solved.solution).size,0);
  const generated=generatePentagramPuzzle({rng,clues:32});
  const checked=solvePentagram(generated.puzzle,{limitSolutions:2});
  assert.equal(checked.solutions.length,1);
  assert.deepEqual(checked.solution,generated.solution);
  assert.ok(generated.puzzle.includes(0));
});

test('duplicate digits across two star points and the omitted digit are conflicts', () => {
  const values = Array(80).fill(0);
  const [first, second] = [PENTAGRAM_UNITS[0][0], PENTAGRAM_UNITS[0][4]];
  values[first] = values[second] = 3;
  assert.deepEqual(pentagramConflicts(values), new Set([first, second]));
  values[second] = 0;
  assert.deepEqual(pentagramConflicts(values, 3), new Set([first]));
});
