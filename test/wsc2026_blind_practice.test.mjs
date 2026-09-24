import test from 'node:test';
import assert from 'node:assert/strict';
import SudokuCSP from '../docs/js/sudoku_csp.js';
import SudokuGenerator from '../docs/js/sudoku_generator.js';
import { isComplete, mostRecentCells } from '../docs/src/wsc2026/blindPractice.mjs';

test('practice uses a unique 6x6 Classic puzzle from the shared generator', () => {
  for (const seed of [123, 456, 789]) {
    const puzzle = SudokuGenerator.generate({size:6, variants:['classic'], seed});
    const answers = SudokuCSP.createProblem(puzzle.board, puzzle.constraints).enumerateAnswers(2);
    assert.equal(puzzle.unique, true);
    assert.equal(answers.length, 1);
    assert.deepEqual(answers[0], puzzle.solution);
    assert(puzzle.board.flat().some(value => value === 0));
    const entries = Array.from({length:6},()=>Array(6).fill(0));
    assert.equal(isComplete(puzzle.board, entries, puzzle.solution), false);
    for (let r=0; r<6; r++) for (let c=0; c<6; c++) if (!puzzle.board[r][c]) entries[r][c] = puzzle.solution[r][c];
    assert.equal(isComplete(puzzle.board, entries, puzzle.solution), true);
    const blank = puzzle.board.flat().findIndex(value => value === 0);
    entries[Math.floor(blank/6)][blank%6] = (puzzle.solution[Math.floor(blank/6)][blank%6] % 6) + 1;
    assert.equal(isComplete(puzzle.board, entries, puzzle.solution), false);
  }
});

test('only the two most recently selected distinct cells remain visible', () => {
  let visible = [];
  for (const selected of [0, 7, 35, 7]) visible = mostRecentCells(visible, selected);
  assert.deepEqual(visible, [35, 7]);
  assert.throws(() => mostRecentCells(visible, 36), RangeError);
});
