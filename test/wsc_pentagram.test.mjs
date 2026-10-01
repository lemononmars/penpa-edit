import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PENTAGRAM_UNITS, PENTAGRAM_CELL_UNITS, pentagramGeometry, pentagramConflicts } from '../docs/src/wsc2026/pentagram.mjs';

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

test('duplicate digits across two star points and the omitted digit are conflicts', () => {
  const values = Array(80).fill(0);
  const [first, second] = [PENTAGRAM_UNITS[0][0], PENTAGRAM_UNITS[0][4]];
  values[first] = values[second] = 3;
  assert.deepEqual(pentagramConflicts(values), new Set([first, second]));
  values[second] = 0;
  assert.deepEqual(pentagramConflicts(values, 3), new Set([first]));
});
