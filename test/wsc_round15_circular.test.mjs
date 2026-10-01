import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CIRCULAR_OUTER_GRID_COUNT, CIRCULAR_OUTER_ORIENTATION_COUNT, CIRCULAR_OUTER_SECTOR_COUNT, CIRCULAR_OUTER_STEP, CIRCULAR_SUDOKU_SIZE, CIRCULAR_SUDOKU_STEP, normalizeCircularSector, outerRotationFromDrag, rotateCircularOuterRing, rotateCircularRing, rotationFromDrag } from '../docs/src/wsc2026/circularSudoku.mjs';

test('the three inner rings snap together in 40 degree steps', () => {
  assert.equal(CIRCULAR_SUDOKU_SIZE, 9);
  assert.equal(CIRCULAR_SUDOKU_STEP, 40);
  assert.equal(rotateCircularRing(0, -1), 8);
  assert.equal(rotateCircularRing(8, 1), 0);
  assert.equal(normalizeCircularSector(-10), 8);
  assert.equal(Array.from({ length: 9 }).reduce((rotation) => rotateCircularRing(rotation, 1), 0), 0);
});

test('the six-grid outer ring snaps to its 54 cell columns', () => {
  assert.equal(CIRCULAR_OUTER_GRID_COUNT, 6);
  assert.equal(CIRCULAR_OUTER_SECTOR_COUNT, 54);
  assert.equal(CIRCULAR_OUTER_STEP, 360 / 54);
  assert.equal(rotateCircularRing(53, 1, CIRCULAR_OUTER_SECTOR_COUNT), 0);
});

test('the outer ring has six spoke-aligned orientations, nine sectors apart', () => {
  assert.equal(CIRCULAR_OUTER_ORIENTATION_COUNT, 6);
  assert.equal(rotateCircularOuterRing(0, -1), 45);
  assert.equal(rotateCircularOuterRing(45, 1), 0);
  assert.equal(outerRotationFromDrag(0, -90, -30), 9);
  assert.equal(outerRotationFromDrag(45, 150, -150), 0);
});

test('right-drag rotation snaps to cells and handles the angle wrap', () => {
  assert.equal(rotationFromDrag(0, 0, 39, CIRCULAR_SUDOKU_STEP, 9), 1);
  assert.equal(rotationFromDrag(0, 179, -179, CIRCULAR_OUTER_STEP, 54), 0);
  assert.equal(rotationFromDrag(12, 179, -176, CIRCULAR_OUTER_STEP, 54), 13);
});
