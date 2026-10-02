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


// Data has 54 playable columns; the drawing also has six separator sectors.
export const CIRCULAR_OUTER_DRAW_STEP = 6;
export const CIRCULAR_OUTER_PHASE = -17;
export const outerDrawColumn = col => Math.floor(col / 9) * 10 + col % 9;

import { solveUnitSudoku } from './unitSudokuSolver.mjs';
export function circularModel(rotations = [0,0,0], includeOuter = false, outerRotation = 0) {
 const count = includeOuter ? 567 : 81;
 const parent = Array.from({length:count},(_,i)=>i);
 const root = i => parent[i]===i ? i : (parent[i]=root(parent[i]));
 const outerCell = (grid,row,col) => 81+row*54+grid*9+col;
 if(includeOuter) for(let grid=0;grid<6;grid++) for(const col of [0,8]) {
  const physical = ((grid*10+col+.5+outerRotation/9*10)*6+CIRCULAR_OUTER_PHASE)/40;
  const coreCol = normalizeCircularSector(Math.floor(physical)-rotations[2]);
  parent[root(outerCell(grid,0,col))]=root(72+coreCol);
 }
 const ids = [...new Set(parent.map((_,i)=>root(i)))];
 const mapping = parent.map((_,i)=>ids.indexOf(root(i)));
 const units=[];
 for(let row=0;row<9;row++)units.push(Array.from({length:9},(_,col)=>row*9+col));
 for(let col=0;col<9;col++)units.push(Array.from({length:9},(_,row)=>row*9+normalizeCircularSector(col-rotations[Math.floor(row/3)])));
 for(let band=0;band<3;band++)for(let stack=0;stack<3;stack++)units.push(Array.from({length:9},(_,i)=>(band*3+Math.floor(i/3))*9+stack*3+i%3));
 if(includeOuter)for(let grid=0;grid<6;grid++){
  for(let row=0;row<9;row++)units.push(Array.from({length:9},(_,col)=>outerCell(grid,row,col)));
  for(let col=0;col<9;col++)units.push(Array.from({length:9},(_,row)=>outerCell(grid,row,col)));
  for(let band=0;band<3;band++)for(let stack=0;stack<3;stack++)units.push(Array.from({length:9},(_,i)=>outerCell(grid,band*3+Math.floor(i/3),stack*3+i%3)));
 }
 return {mapping,units:units.map(unit=>unit.map(cell=>mapping[cell])),count:ids.length};
}
export function solveCircular(values, rotations=[0,0,0], includeOuter=false, outerRotation=0, options={}) {
 const model=circularModel(rotations,includeOuter,outerRotation), compressed=Array(model.count).fill(0);
 for(let cell=0;cell<model.mapping.length;cell++){
  const digit=Number(values[cell])||0, id=model.mapping[cell];
  if(digit&&compressed[id]&&compressed[id]!==digit)return {status:'invalid',solution:null,solutions:[]};
  if(digit)compressed[id]=digit;
 }
 const result=solveUnitSudoku(compressed,model.units,[1,2,3,4,5,6,7,8,9],options);
 return {...result,solution:result.solution?model.mapping.map(id=>result.solution[id]):null,solutions:result.solutions.map(solution=>model.mapping.map(id=>solution[id]))};
}

// Fix the innermost ring: a common rotation changes no core constraints.
// Count orientations as well as digit completions; two valid alignments are
// two solutions even when their digits happen to be identical.
export function solveCircularAlignments(values, rotations=[0,0,0], includeOuter=false, outerRotation=0, options={}) {
 const limit=options.limitSolutions||1, solutions=[];
 let limited=false,nodes=0;
 const middle=[rotations[1],...Array.from({length:9},(_,i)=>i).filter(i=>i!==rotations[1])];
 const outside=[rotations[2],...Array.from({length:9},(_,i)=>i).filter(i=>i!==rotations[2])];
 for(const second of middle)for(const third of outside){
  const alignment=[rotations[0],second,third];
  // Reject almost every wrong alignment cheaply before building exact cover.
  let conflict=false;
  for(let col=0;col<9&&!conflict;col++){
   let mask=0;
   for(let row=0;row<9;row++){
    const digit=Number(values[row*9+normalizeCircularSector(col-alignment[Math.floor(row/3)])])||0;
    if(digit){const bit=1<<digit;if(mask&bit){conflict=true;break;}mask|=bit;}
   }
  }
  if(conflict)continue;
  const result=solveCircular(values,alignment,includeOuter,outerRotation,{...options,limitSolutions:limit-solutions.length});
  nodes+=result.nodes||0;
  if(result.status==='limit')limited=true;
  for(const solution of result.solutions)solutions.push({solution,rotations:alignment});
  if(solutions.length>=limit)return {status:'solved',solution:solutions[0].solution,rotations:solutions[0].rotations,solutions,nodes};
 }
 return {status:limited?'limit':solutions.length?'solved':'unsatisfiable',solution:solutions[0]?.solution||null,rotations:solutions[0]?.rotations||null,solutions,nodes};
}

export function generateCircular(rotations=[0,0,0], includeOuter=false, outerRotation=0, clues=32, attempts=8) {
 const count=includeOuter?567:81;
 let result=solveCircular(Array(81).fill(0),rotations,false,0,{randomize:true});
 if(!result.solution)return result;
 if(includeOuter){
  const model=circularModel(rotations,true,outerRotation), assigned=Array(model.count).fill(0), solution=[...result.solution,...Array(486).fill(0)];
  result.solution.forEach((digit,cell)=>assigned[model.mapping[cell]]=digit);
  for(let grid=0;grid<6;grid++){
   const cells=Array.from({length:81},(_,i)=>81+Math.floor(i/9)*54+grid*9+i%9);
   const seeds=cells.map(cell=>assigned[model.mapping[cell]]);
   const outer=solveUnitSudoku(seeds,circularModel().units,[1,2,3,4,5,6,7,8,9],{randomize:true});
   if(!outer.solution)return outer;
   cells.forEach((cell,i)=>{solution[cell]=outer.solution[i];assigned[model.mapping[cell]]=outer.solution[i];});
  }
  result={...result,solution};
 }
 const fullCheck=solveCircularAlignments(result.solution,rotations,includeOuter,outerRotation,{limitSolutions:2});
 if(fullCheck.status!=='solved'||fullCheck.solutions.length!==1){
  return attempts>1?generateCircular(rotations,includeOuter,outerRotation,clues,attempts-1):{status:'ambiguous',solution:null};
 }
 const puzzle=result.solution.slice(), order=Array.from({length:count},(_,i)=>i);
 for(let i=count-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 let remaining=count;
 for(const cell of order){
  if(remaining<=clues*(includeOuter?7:1))break;
  const digit=puzzle[cell];puzzle[cell]=0;
  const check=solveCircularAlignments(puzzle,rotations,includeOuter,outerRotation,{limitSolutions:2,maxNodes:20000});
  if(check.status==='solved'&&check.solutions.length===1)remaining--;else puzzle[cell]=digit;
 }
 return {...result,puzzle,clues:remaining};
}
