import { solveUnitSudoku } from './unitSudokuSolver.mjs';
export const PENTAGRAM_CELL_COUNT = 80;
const cell = (point, u, v) => ((point + 5) % 5) * 16 + v * 4 + u;
export const PENTAGRAM_UNITS = [];
for (let point = 0; point < 5; point++) {
  for (let offset = 0; offset < 4; offset++) {
    PENTAGRAM_UNITS.push([
      ...Array.from({ length: 4 }, (_, u) => cell(point, u, offset)),
      ...Array.from({ length: 4 }, (_, v) => cell(point + 1, offset, v)),
    ]);
  }
}
for (let point = 0; point < 5; point++) {
  for (let half = 0; half < 2; half++) {
    PENTAGRAM_UNITS.push(Array.from({ length: 8 }, (_, i) => cell(point, half * 2 + i % 2, Math.floor(i / 2))));
  }
}
export const PENTAGRAM_CELL_UNITS = Array.from({ length: 80 }, (_, index) => PENTAGRAM_UNITS.map((unit, id) => unit.includes(index) ? id : -1).filter((id) => id >= 0));
const center = { x: 300, y: 305 };
const spoke = (point) => {
  const angle = (-126 + point * 72) * Math.PI / 180;
  return { x: 178 * Math.cos(angle), y: 178 * Math.sin(angle) };
};
export function pentagramPosition(point, u, v) {
  const left = spoke(point), right = spoke(point + 1);
  return { x: center.x + left.x * u + right.x * v, y: center.y + left.y * u + right.y * v };
}
export function pentagramGeometry(index) {
  const point = Math.floor(index / 16), u = index % 4, v = Math.floor(index % 16 / 4);
  const vertices = [[u, v], [u + 1, v], [u + 1, v + 1], [u, v + 1]].map(([a, b]) => pentagramPosition(point, a / 4, b / 4));
  return { point, u, v, path: vertices.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ') + ' Z', center: pentagramPosition(point, (u + .5) / 4, (v + .5) / 4) };
}
export function pentagramConflicts(values, omitted = null) {
  const conflicts = new Set();
  values.forEach((digit, index) => { if (digit === omitted) conflicts.add(index); });
  for (const unit of PENTAGRAM_UNITS) {
    const seen = new Map();
    for (const index of unit) {
      const digit = values[index];
      if (!digit) continue;
      if (seen.has(digit)) { conflicts.add(index); conflicts.add(seen.get(digit)); }
      else seen.set(digit, index);
    }
  }
  return conflicts;
}

export function solvePentagram(values, {maxNodes=500_000, limitSolutions=1, ...options} = {}) {
  if (values.length!==80 || values.some((v)=>!Number.isInteger(v)||v<0||v>9)) throw new Error('Enter 80 cells using digits 1–9.');
  if (pentagramConflicts(values).size || new Set(values.filter(Boolean)).size>8) return {status:'invalid',solution:null,solutions:[],nodes:0};
  let nodes=0, solutions=[];
  for (let omitted=1;omitted<=9;omitted++) {
    if (values.includes(omitted)) continue;
    const digits=Array.from({length:9},(_,i)=>i+1).filter((digit)=>digit!==omitted);
    const result=solveUnitSudoku(values,PENTAGRAM_UNITS,digits,{...options,maxNodes:maxNodes-nodes,limitSolutions:limitSolutions-solutions.length});
    nodes+=result.nodes; solutions.push(...result.solutions);
    if(result.status==='limit')return {status:'limit',solution:solutions[0]||null,solutions,nodes};
    if(solutions.length>=limitSolutions)break;
  }
  return {status:solutions.length?'solved':'unsatisfiable',solution:solutions[0]||null,solutions,nodes};
}
export function randomPentagramSolution({rng=Math.random,maxNodes=500_000}={}) {
  const omitted=1+Math.floor(rng()*9), digits=Array.from({length:9},(_,i)=>i+1).filter((d)=>d!==omitted);
  return solveUnitSudoku(Array(80).fill(0),PENTAGRAM_UNITS,digits,{randomize:true,rng,maxNodes});
}
export function generatePentagramPuzzle({clues=32,rng=Math.random,maxNodes=500_000}={}) {
  const solved=randomPentagramSolution({rng,maxNodes});
  if(!solved.solution)return {...solved,puzzle:null,clues:0};
  const puzzle=solved.solution.slice(), order=Array.from({length:80},(_,i)=>i);
  for(let i=79;i>0;i--){const j=Math.floor(rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  let count=80;
  for(const cell of order) {
    if(count<=clues)break;
    const digit=puzzle[cell];puzzle[cell]=0;
    const check=solvePentagram(puzzle,{maxNodes,limitSolutions:2});
    if(check.status==='solved'&&check.solutions.length===1)count--;else puzzle[cell]=digit;
  }
  return {status:'solved',puzzle,solution:solved.solution,clues:count};
}
