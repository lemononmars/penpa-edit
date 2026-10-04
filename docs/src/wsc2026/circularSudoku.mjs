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
  const coreCol = normalizeCircularSector(Math.floor(physical-rotations[2]));
  parent[root(outerCell(grid,0,col))]=root(72+coreCol);
 }
 const ids = [...new Set(parent.map((_,i)=>root(i)))];
 const mapping = parent.map((_,i)=>ids.indexOf(root(i)));
 const units=[];
 for(let row=0;row<9;row++)units.push(Array.from({length:9},(_,col)=>row*9+col));
 for(let col=0;col<9;col++)units.push(Array.from({length:9},(_,row)=>row*9+normalizeCircularSector(col+rotations[0]-rotations[Math.floor(row/3)])));
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
 const validate=options.directionalArrows?.length?directionalArrowValidator(options.directionalArrows,options.arrowRule):options.pointingArrows?.length?pointingDigitsValidator(options.pointingArrows):null;
 const result=solveUnitSudoku(compressed,model.units,[1,2,3,4,5,6,7,8,9],{...options,...(validate?{isValid:partial=>validate(model.mapping.map(id=>partial[id]))}:{})});
 return {...result,solution:result.solution?model.mapping.map(id=>result.solution[id]):null,solutions:result.solutions.map(solution=>model.mapping.map(id=>solution[id]))};
}

// Fix the innermost ring: a common rotation changes no core constraints.
// Count orientations as well as digit completions; two valid alignments are
// two solutions even when their digits happen to be identical.
export function solveCircularAlignments(values, rotations=[0,0,0], includeOuter=false, outerRotation=0, options={}) {
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
    const digit=Number(values[row*9+normalizeCircularSector(col+alignment[0]-alignment[Math.floor(row/3)])])||0;
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
 return {...result,puzzle,clues:remaining,rotations:rotations.slice()};
}

export function generateShiftedPuzzle(currentRotations=[0,0,0], includeOuter=false, outerRotation=0, clues=32, rng=Math.random) {
 // Boxes belong to their individual rings. Their bold borders need not
 // line up across rings, so choose any of the 81 relative orientations.
 const phase=currentRotations[0]%1;
 const rotations=[currentRotations[0],Math.floor(rng()*9)+phase,Math.floor(rng()*9)+phase];
 return generateCircular(rotations,includeOuter,outerRotation,clues);
}

export function pointingDigitsValidator(arrows){
 const constraints=arrows.map(({row,col,dx,dy})=>{
  const start=81+row*54+col,localCol=col%9,ray=[];
  for(let distance=1;distance<=8;distance++){
   const r=row+dy*distance,c=localCol+dx*distance;
   if(r<0||r>=9||c<0||c>=9)break;
   ray.push({cell:81+r*54+Math.floor(col/9)*9+c,sameUnit:r===row||c===localCol||(Math.floor(r/3)===Math.floor(row/3)&&Math.floor(c/3)===Math.floor(localCol/3))});
  }
  return {start,ray};
 });
 return values=>constraints.every(({start,ray})=>{const digit=values[start];if(!digit)return true;const target=ray[digit-1];return !!target&&!target.sameUnit&&(!values[target.cell]||values[target.cell]===digit);});
}

export function directionalArrowValidator(arrows,rule){
 if(rule==='pointingdigits')return pointingDigitsValidator(arrows);
 const lines=arrows.map(({row,col,dx,dy})=>{
  const cells=[81+row*54+col],grid=Math.floor(col/9),local=col%9;
  for(let distance=1;distance<=8;distance++){const r=row+dy*distance,c=local+dx*distance;if(r<0||r>=9||c<0||c>=9)break;cells.push(81+r*54+grid*9+c);}
  return cells;
 });
 const cache=new Map();
 return values=>lines.every(cells=>{
  const digits=cells.map(cell=>values[cell]||0);
  if(rule==='threeup'){
   if(digits.length<3)return false;
   const first=digits.slice(0,3);
   for(let i=0;i<3;i++)if(first[i]){
    if(first[i]<i+1||first[i]>7+i)return false;
    for(let j=i+1;j<3;j++)if(first[j]&&first[j]-first[i]<j-i)return false;
   }
   return true;
  }
  if(rule==='insideskyscraper'){
   const clue=digits[0],ray=digits.slice(1);if(!clue)return true;
   if(clue>ray.length)return false;
   const key=digits.join(','),cached=cache.get(key);if(cached!==undefined)return cached;
   // Feasible visibility counts for partial rays. Unknown heights may be
   // 1–9; classic Sudoku constraints enforce their unit uniqueness separately.
   let states=new Set([0]);
   for(let i=0;i<ray.length;i++){
    const next=new Set(),choices=ray[i]?[ray[i]]:[1,2,3,4,5,6,7,8,9];
    for(const state of states){const tallest=Math.floor(state/10),seen=state%10;
     for(const height of choices){const count=seen+(height>tallest?1:0);if(count<=clue&&count+ray.length-i-1>=clue)next.add(Math.max(tallest,height)*10+count);}
    }
    states=next;if(!states.size)break;
   }
   const valid=[...states].some(state=>state%10===clue);
   if(cache.size>20000)cache.clear();cache.set(key,valid);return valid;
  }
  return true;
 });
}
