export const CIRCULAR_SUDOKU_SIZE = 9;
export const CIRCULAR_SUDOKU_STEP = 360 / CIRCULAR_SUDOKU_SIZE;
export const CIRCULAR_OUTER_GRID_COUNT = 6;
export const CIRCULAR_OUTER_SECTOR_COUNT = CIRCULAR_SUDOKU_SIZE * CIRCULAR_OUTER_GRID_COUNT;
export const CIRCULAR_OUTER_STEP = 360 / CIRCULAR_OUTER_SECTOR_COUNT;
export const CIRCULAR_OUTER_ORIENTATION_STEP = CIRCULAR_SUDOKU_SIZE;
export const CIRCULAR_OUTER_ORIENTATION_COUNT = CIRCULAR_OUTER_GRID_COUNT;

export function normalizeCircularSector(sector, count = CIRCULAR_SUDOKU_SIZE) {
  return ((Math.trunc(Number(sector) || 0) % count) + count) % count;
}

export function rotateCircularRing(rotation, direction, count = CIRCULAR_SUDOKU_SIZE) {
  return normalizeCircularSector(normalizeCircularSector(rotation, count) + Math.sign(direction), count);
}

export function rotateCircularOuterRing(rotation, direction) {
  const orientation = normalizeCircularSector(Math.round(rotation / CIRCULAR_OUTER_ORIENTATION_STEP), CIRCULAR_OUTER_ORIENTATION_COUNT);
  return normalizeCircularSector(orientation + Math.sign(direction), CIRCULAR_OUTER_ORIENTATION_COUNT) * CIRCULAR_OUTER_ORIENTATION_STEP;
}

export function shortestAngularDelta(startDegrees, endDegrees) {
  return ((endDegrees - startDegrees + 540) % 360) - 180;
}

export function rotationFromDrag(startRotation, startDegrees, endDegrees, stepDegrees, count) {
  const delta = shortestAngularDelta(startDegrees, endDegrees);
  return normalizeCircularSector(startRotation + Math.round(delta / stepDegrees), count);
}

export function outerRotationFromDrag(startRotation, startDegrees, endDegrees) {
  const orientation = normalizeCircularSector(Math.round(startRotation / CIRCULAR_OUTER_ORIENTATION_STEP), CIRCULAR_OUTER_ORIENTATION_COUNT);
  const deltaOrientations = Math.round(shortestAngularDelta(startDegrees, endDegrees) / (360 / CIRCULAR_OUTER_ORIENTATION_COUNT));
  return normalizeCircularSector(orientation + deltaOrientations, CIRCULAR_OUTER_ORIENTATION_COUNT) * CIRCULAR_OUTER_ORIENTATION_STEP;
}

