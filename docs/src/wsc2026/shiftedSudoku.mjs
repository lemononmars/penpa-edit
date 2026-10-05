export function normalizeSector(sector, count = 9) {
  return ((Math.trunc(Number(sector) || 0) % count) + count) % count;
}

export function shortestAngularDelta(startDegrees, endDegrees) {
  return ((endDegrees - startDegrees + 540) % 360) - 180;
}

// Data has 54 playable columns; the drawing also has six separator sectors.
export const SHIFTED_OUTER_PHASE = -17;
export const outerDrawColumn = col => Math.floor(col / 9) * 10 + col % 9;

import { solveUnitSudoku } from './unitSudokuSolver.mjs';
export function shiftedModel(rotations = [0,0,0], includeOuter = false, outerRotation = 0) {
 const count = includeOuter ? 567 : 81;
 const parent = Array.from({length:count},(_,i)=>i);
 const root = i => parent[i]===i ? i : (parent[i]=root(parent[i]));
 const outerCell = (grid,row,col) => 81+row*54+grid*9+col;
 if(includeOuter) for(let grid=0;grid<6;grid++) for(const col of [0,8]) {
  const physical = ((grid*10+col+.5+outerRotation/9*10)*6+SHIFTED_OUTER_PHASE)/40;
  const coreCol = normalizeSector(Math.floor(physical-rotations[2]));
  parent[root(outerCell(grid,0,col))]=root(72+coreCol);
 }
 const ids = [...new Set(parent.map((_,i)=>root(i)))];
 const mapping = parent.map((_,i)=>ids.indexOf(root(i)));
 const units=[];
 for(let row=0;row<9;row++)units.push(Array.from({length:9},(_,col)=>row*9+col));
 for(let col=0;col<9;col++)units.push(Array.from({length:9},(_,row)=>row*9+normalizeSector(col+rotations[0]-rotations[Math.floor(row/3)])));
 for(let band=0;band<3;band++)for(let stack=0;stack<3;stack++)units.push(Array.from({length:9},(_,i)=>(band*3+Math.floor(i/3))*9+stack*3+i%3));
 if(includeOuter)for(let grid=0;grid<6;grid++){
  for(let row=0;row<9;row++)units.push(Array.from({length:9},(_,col)=>outerCell(grid,row,col)));
  for(let col=0;col<9;col++)units.push(Array.from({length:9},(_,row)=>outerCell(grid,row,col)));
  for(let band=0;band<3;band++)for(let stack=0;stack<3;stack++)units.push(Array.from({length:9},(_,i)=>outerCell(grid,band*3+Math.floor(i/3),stack*3+i%3)));
 }
 return {mapping,units:units.map(unit=>unit.map(cell=>mapping[cell])),count:ids.length};
}
export function solveShifted(values, rotations=[0,0,0], includeOuter=false, outerRotation=0, options={}) {
 const model=shiftedModel(rotations,includeOuter,outerRotation), compressed=Array(model.count).fill(0);
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
export function solveShiftedAlignments(values, rotations=[0,0,0], includeOuter=false, outerRotation=0, options={}) {
 const limit=options.limitSolutions||1, solutions=[];
 let limited=false,nodes=0;
 const phase=rotations[0]%1;
 const candidates=preferred=>{const all=Array.from({length:9},(_,i)=>i+phase);return all.includes(preferred)?[preferred,...all.filter(i=>i!==preferred)]:all;};
 const middle=candidates(rotations[1]),outside=candidates(rotations[2]);
 for(const second of middle)for(const third of outside){
  const alignment=[rotations[0],second,third];
  // Reject almost every wrong alignment cheaply before building exact cover.
  let conflict=false;
  for(let col=0;col<9&&!conflict;col++){
   let mask=0;
   for(let row=0;row<9;row++){
    const digit=Number(values[row*9+normalizeSector(col+alignment[0]-alignment[Math.floor(row/3)])])||0;
    if(digit){const bit=1<<digit;if(mask&bit){conflict=true;break;}mask|=bit;}
   }
  }
  if(conflict)continue;
  const result=solveShifted(values,alignment,includeOuter,outerRotation,{...options,limitSolutions:limit-solutions.length});
  nodes+=result.nodes||0;
  if(result.status==='limit')limited=true;
  for(const solution of result.solutions)solutions.push({solution,rotations:alignment});
  if(solutions.length>=limit)return {status:'solved',solution:solutions[0].solution,rotations:solutions[0].rotations,solutions,nodes};
 }
 return {status:limited?'limit':solutions.length?'solved':'unsatisfiable',solution:solutions[0]?.solution||null,rotations:solutions[0]?.rotations||null,solutions,nodes};
}

export function generatePuzzleAtAlignment(rotations=[0,0,0], includeOuter=false, outerRotation=0, clues=32, attempts=8) {
 const count=includeOuter?567:81;
 let result=solveShifted(Array(81).fill(0),rotations,false,0,{randomize:true});
 if(!result.solution)return result;
 if(includeOuter){
  const model=shiftedModel(rotations,true,outerRotation), assigned=Array(model.count).fill(0), solution=[...result.solution,...Array(486).fill(0)];
  result.solution.forEach((digit,cell)=>assigned[model.mapping[cell]]=digit);
  for(let grid=0;grid<6;grid++){
   const cells=Array.from({length:81},(_,i)=>81+Math.floor(i/9)*54+grid*9+i%9);
   const seeds=cells.map(cell=>assigned[model.mapping[cell]]);
   const outer=solveUnitSudoku(seeds,shiftedModel().units,[1,2,3,4,5,6,7,8,9],{randomize:true});
   if(!outer.solution)return outer;
   cells.forEach((cell,i)=>{solution[cell]=outer.solution[i];assigned[model.mapping[cell]]=outer.solution[i];});
  }
  result={...result,solution};
 }
 const fullCheck=solveShiftedAlignments(result.solution,rotations,includeOuter,outerRotation,{limitSolutions:2});
 if(fullCheck.status!=='solved'||fullCheck.solutions.length!==1){
  return attempts>1?generatePuzzleAtAlignment(rotations,includeOuter,outerRotation,clues,attempts-1):{status:'ambiguous',solution:null};
 }
 const puzzle=result.solution.slice(), order=Array.from({length:count},(_,i)=>i);
 for(let i=count-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 let remaining=count;
 for(const cell of order){
  if(remaining<=clues*(includeOuter?7:1))break;
  const digit=puzzle[cell];puzzle[cell]=0;
  const check=solveShiftedAlignments(puzzle,rotations,includeOuter,outerRotation,{limitSolutions:2,maxNodes:20000});
  if(check.status==='solved'&&check.solutions.length===1)remaining--;else puzzle[cell]=digit;
 }
 return {...result,puzzle,clues:remaining,rotations:rotations.slice()};
}

export function generateShiftedPuzzle(currentRotations=[0,0,0], includeOuter=false, outerRotation=0, clues=32, rng=Math.random) {
 // Boxes belong to their individual rings. Their bold borders need not
 // line up across rings, so choose any of the 81 relative orientations.
 const phase=currentRotations[0]%1;
 const rotations=[currentRotations[0],Math.floor(rng()*9)+phase,Math.floor(rng()*9)+phase];
 return generatePuzzleAtAlignment(rotations,includeOuter,outerRotation,clues);
}

