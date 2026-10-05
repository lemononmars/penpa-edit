import test from 'node:test';
import assert from 'node:assert/strict';
import { clueHolds, findAlternative, generateMiniLaxman, validateDrawnLoop } from '../docs/src/wpc2026/miniLaxman.mjs';

test('backward-generated mini puzzles have one loop satisfying all six clue types', () => {
  for (const size of [5, 8, 10]) {
    const puzzle = generateMiniLaxman(size, 123);
    const solution = validateDrawnLoop(puzzle.solution, size);
    assert.equal(solution.ok, true, `${size}×${size} loop is valid`);
    assert.deepEqual(new Set(puzzle.clues.map(clue => clue.type)), new Set(['polygraph', 'kurarin', 'parallel', 'sheep', 'myopia', 'sight']));
    assert.equal(puzzle.clues.every(clue => clueHolds(clue, solution.cells, size, solution.edges)), true);
    const search = findAlternative(size, puzzle.clues, solution.cells, 250000);
    assert.equal(search.proven, true, `${size}×${size} uniqueness search completed`);
    assert.equal(search.alternate, null, `${size}×${size} has no second loop`);
  }
});

test('an unfinished or branched line is not a valid solution', () => {
  const puzzle = generateMiniLaxman(5, 123);
  assert.match(validateDrawnLoop(puzzle.solution.slice(1), 5).message, /open end|branch/);
});
