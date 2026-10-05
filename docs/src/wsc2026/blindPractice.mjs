export function mostRecentCells(previous, selected) {
  if (!Number.isInteger(selected) || selected < 0 || selected >= 36) {
    throw new RangeError('Select a cell from the 6x6 grid.');
  }
  return [...previous.filter(index => index !== selected), selected].slice(-2);
}

import {solveUnitSudoku} from './unitSudokuSolver.mjs';
export const PIP_POSITIONS={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
export const pipBit=position=>1<<(position-1);
export const PIP_MASKS=Object.fromEntries(Object.entries(PIP_POSITIONS).map(([digit,positions])=>[digit,positions.reduce((mask,p)=>mask|pipBit(p),0)]));
export const pipCandidates=mask=>[1,2,3,4,5,6].filter(digit=>(PIP_MASKS[digit]&mask)===mask);
export const pipCount=mask=>Array.from({length:9},(_,i)=>!!(mask&(1<<i))).filter(Boolean).length;
export const BLIND_UNITS=[
 ...Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>r*6+c)),
 ...Array.from({length:6},(_,c)=>Array.from({length:6},(_,r)=>r*6+c)),
 ...Array.from({length:6},(_,box)=>Array.from({length:6},(_,i)=>(Math.floor(box/2)*2+Math.floor(i/3))*6+(box%2)*3+i%3)),
];
const emptyEntries=()=>Array.from({length:6},()=>Array(6).fill(0));
export function solveBlindPips(clues,entries=emptyEntries(),options={}){
 if(!Array.isArray(clues)||clues.length!==36||clues.some(v=>!Number.isInteger(v)||v<0||v>511)||!Array.isArray(entries)||entries.length!==6||entries.some(row=>!Array.isArray(row)||row.length!==6||row.some(v=>!Number.isInteger(v)||v<0||v>6)))throw new Error('Enter 36 pip clues and a 6×6 answer grid.');
 const allowed=clues.map(pipCandidates);
 if(allowed.some(candidates=>!candidates.length))return {status:'invalid',solution:null,solutions:[],nodes:0};
 const result=solveUnitSudoku(entries.flat(),BLIND_UNITS,[1,2,3,4,5,6],{...options,isValid:values=>values.every((digit,cell)=>!digit||allowed[cell].includes(digit))});
 const grid=values=>Array.from({length:6},(_,r)=>values.slice(r*6,r*6+6));
 return {...result,solution:result.solution?grid(result.solution):null,solutions:result.solutions.map(grid)};
}
export function isComplete(clues,entries){
 if(!Array.isArray(clues)||clues.length!==36||!Array.isArray(entries)||entries.length!==6||entries.some(row=>!Array.isArray(row)||row.length!==6))return false;
 const values=entries.flat();
 return values.every((digit,cell)=>Number.isInteger(digit)&&digit>=1&&digit<=6&&(PIP_MASKS[digit]&clues[cell])===clues[cell])&&BLIND_UNITS.every(unit=>new Set(unit.map(cell=>values[cell])).size===6);
}
export function generateBlindPips({targetPips=40,rng=Math.random,maxNodes=100_000}={}){
 const result=solveUnitSudoku(Array(36).fill(0),BLIND_UNITS,[1,2,3,4,5,6],{randomize:true,rng,maxNodes});
 if(!result.solution)return {...result,clues:null};
 const clues=result.solution.map(digit=>PIP_MASKS[digit]),order=clues.flatMap((mask,cell)=>PIP_POSITIONS[result.solution[cell]].map(position=>({cell,bit:pipBit(position)})));
 for(let i=order.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 let count=order.length;
 for(const {cell,bit} of order){
  if(count<=targetPips)break;
  clues[cell]&=~bit;
  const check=solveBlindPips(clues,emptyEntries(),{limitSolutions:2,maxNodes});
  if(check.status==='solved'&&check.solutions.length===1)count--;else clues[cell]|=bit;
 }
 return {status:'solved',clues,pipCount:count,solution:Array.from({length:6},(_,r)=>result.solution.slice(r*6,r*6+6)),unique:true};
}
