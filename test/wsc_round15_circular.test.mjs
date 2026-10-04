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

import { circularModel, solveCircular, generateCircular, outerDrawColumn, solveCircularAlignments } from '../docs/src/wsc2026/circularSudoku.mjs';
test('six outer grids have nine playable columns and a separate separator',()=>{
 for(let grid=0;grid<6;grid++)assert.deepEqual(Array.from({length:9},(_,col)=>outerDrawColumn(grid*9+col)),Array.from({length:9},(_,col)=>grid*10+col));
});
test('solver respects rotated columns, all regions and spoke matches',()=>{
 const rotations=[0,1,2],model=circularModel(rotations,true,9);
 const result=solveCircular(Array(567).fill(0),rotations,true,9);
 assert.equal(result.status,'solved');
 const compressed=Array(model.count).fill(0);
 model.mapping.forEach((id,cell)=>{if(compressed[id])assert.equal(result.solution[cell],compressed[id]);compressed[id]=result.solution[cell];});
 for(const unit of model.units)assert.equal(new Set(unit.map(id=>compressed[id])).size,9);
 const invalid=result.solution.slice();invalid[0]=invalid[1];assert.equal(solveCircular(invalid,rotations,true,9).status,'invalid');
});
test('generated puzzles have blanks and exactly one completion across all alignments',()=>{
 for(const outer of [false,true]){
  const result=generateCircular([0,1,2],outer,9,40);
  assert.ok(result.puzzle.includes(0));
  const check=solveCircularAlignments(result.puzzle,[0,6,7],outer,9,{limitSolutions:2});
  assert.equal(check.status,'solved');assert.equal(check.solutions.length,1);
 }
});

test('solving finds the correct orientation even when both outer core rings are scrambled',()=>{
 const generated=generateCircular([0,1,2],false,0,40);
 const solved=solveCircularAlignments(generated.puzzle,[0,6,7]);
 assert.equal(solved.status,'solved');assert.deepEqual(solved.rotations,[0,1,2]);assert.deepEqual(solved.solution,generated.solution);
});
test('identical completed digits at different orientations count as distinct solutions',()=>{
 const completed=Array.from({length:81},(_,i)=>(Math.floor(i/9)*3+Math.floor(i/27)+i%9)%9+1);
 const result=solveCircularAlignments(completed,[0,0,0],false,0,{limitSolutions:2});
 assert.equal(result.solutions.length,2);
 assert.deepEqual(result.solutions[0].solution,result.solutions[1].solution);
 assert.notDeepEqual(result.solutions[0].rotations,result.solutions[1].rotations);
});

test('three grey column centers align exactly with core grid lines after the counterclockwise phase',async()=>{
 const {CIRCULAR_OUTER_PHASE}=await import('../docs/src/wsc2026/circularSudoku.mjs');
 const centers=Array.from({length:6},(_,grid)=>(grid*10+9.5)*6+CIRCULAR_OUTER_PHASE);
 assert.equal(centers.filter(angle=>angle%40===0).length,3);
 assert.ok(CIRCULAR_OUTER_PHASE<0);
});

test('generation and solving allow staggered bold region borders',async()=>{
 const {generateShiftedPuzzle}=await import('../docs/src/wsc2026/circularSudoku.mjs');
 const random=[.2,.5];
 const generated=generateShiftedPuzzle([0,0,0],false,0,40,()=>random.shift());
 assert.deepEqual(generated.rotations,[0,1,4]);
 const solved=solveCircularAlignments(generated.puzzle,[0,0,0],false,0,{limitSolutions:2});
 assert.equal(solved.status,'solved');assert.equal(solved.solutions.length,1);
 assert.deepEqual(solved.rotations,[0,1,4]);
 assert.deepEqual(solved.solution,generated.solution);
});

test('solving keeps a twenty-degree anchor and aligns half-step rings correctly',()=>{
 const solution=solveCircular(Array(81).fill(0),[.5,1.5,4.5]).solution;
 const solved=solveCircularAlignments(solution,[.5,0,0]);
 assert.equal(solved.status,'solved');
 assert.ok(solved.rotations.every(rotation=>rotation%1===.5));
 assert.deepEqual(solved.solution,solution);
});
