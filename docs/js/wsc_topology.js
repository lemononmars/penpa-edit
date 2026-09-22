(function(root,factory){const api=factory(typeof module!=='undefined'&&module.exports?require('./sudoku_variants/wsc_rules.js'):root.Wsc2026Rules);if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WscTopology=api;})(typeof globalThis!=='undefined'?globalThis:this,function(rules){
 function check(p){
  const digitCount=p?.digitCount??9;
  if(!Number.isInteger(digitCount)||digitCount<2||digitCount>9)throw new Error('digitCount must be from 2 to 9.');
  if(!p||!Array.isArray(p.values)||!p.values.length||p.values.length>1000||!p.values.every(d=>Number.isInteger(d)&&d>=0&&d<=digitCount))throw new Error('values must contain 1–1000 digits in range (0 for empty).');
  const index=i=>Number.isInteger(i)&&i>=0&&i<p.values.length;
  if(!Array.isArray(p.units)||!p.units.length||!p.units.every(u=>Array.isArray(u)&&u.length>=1&&u.length<=digitCount&&u.every(index)&&new Set(u).size===u.length))throw new Error('Every unit must list distinct cell indices, no more than the digit range.');
  const covered=new Set(p.units.flat());if(covered.size!==p.values.length)throw new Error('Every cell must belong to at least one unit. Include all row, column and region units.');
  if((p.grids||[]).some(g=>!Array.isArray(g.cells)||g.cells.length!==81||!g.cells.every(index)||new Set(g.cells).size!==81||!Array.isArray(g.clues)||!g.clues.every(rules.valid)))throw new Error('Each grid must map 81 distinct cells and contain valid WSC clues.');
  if((p.clones||[]).some(c=>!Array.isArray(c.a)||!Array.isArray(c.b)||!c.a.length||c.a.length!==c.b.length||![...c.a,...c.b].every(index)))throw new Error('Clone lines need equal-length lists of cell indices.');
 }
 function solve(p,{maxNodes=200000,maxSolutions=2,exclude=null}={}){
  check(p);const digits=Array.from({length:p.digitCount??9},(_,i)=>i+1),values=p.values.slice(), peers=values.map(()=>new Set()),solutions=[];let nodes=0,limited=false;
  if(!Number.isInteger(maxNodes)||maxNodes<1||!Number.isInteger(maxSolutions)||maxSolutions<1)throw new Error('Search limits must be positive integers.');
  p.units.forEach(u=>u.forEach(a=>u.forEach(b=>{if(a!==b)peers[a].add(b);})));const valid=()=>{
   if(exclude&&values[exclude.index]===exclude.value)return false;
   for(const u of p.units){const filled=u.map(i=>values[i]).filter(Boolean);if(new Set(filled).size!==filled.length)return false;}
   for(const g of p.grids||[]){const board=Array.from({length:9},(_,r)=>g.cells.slice(r*9,r*9+9).map(i=>values[i]));if(!g.clues.every(q=>rules.validate(board,q)))return false;}
   for(const c of p.clones||[]){const a=c.a.map(i=>values[i]),b=c.b.map(i=>values[i]);if(![b,...(c.reversible?[b.slice().reverse()]:[])].some(v=>a.every((d,i)=>!d||!v[i]||d===v[i])))return false;}
   return true;
  };
  if(!valid())return {status:'invalid',solutions:[],nodes};
  function search(){if(solutions.length>=maxSolutions||limited)return;if(++nodes>maxNodes){limited=true;return;}
   let target=-1,candidates=null;for(let i=0;i<values.length;i++){if(values[i])continue;const used=new Set([...peers[i]].map(j=>values[j]));const ds=digits.filter(d=>!used.has(d));if(!ds.length)return;if(!candidates||ds.length<candidates.length){target=i;candidates=ds;if(ds.length===1)break;}}
   if(target<0){if(valid())solutions.push(values.slice());return;}
   for(const d of candidates){values[target]=d;if(valid())search();values[target]=0;if(limited||solutions.length>=maxSolutions)break;}
  }
  search();return {status:limited?'limit':solutions.length===0?'unsatisfiable':solutions.length===1?(maxSolutions===1?'solved':'unique'):'multiple',solutions,nodes};
 }
 // A shared value in two witnesses is not a proof. For each still-possible
 // truth, exhaust the search with that value forbidden. Limits remain unknown.
 function deduce(p,{maxNodes=300000}={}){
  const result=solve(p,{maxNodes,maxSolutions:2}),truths=[];
  let remaining=Math.max(0,maxNodes-result.nodes),proofNodes=0,truthComplete=true;
  const first=result.solutions[0];
  if(!first)return {...result,truths,proofNodes,truthComplete:result.status!=='limit'};
  const stable=p.values.map((v,i)=>!v&&result.solutions.every(s=>s[i]===first[i]));
  for(let i=0;i<stable.length;i++){
   if(!stable[i])continue;
   if(result.status==='unique'){truths.push({index:i,value:first[i]});continue;}
   if(!remaining){truthComplete=false;break;}
   const attempt=solve(p,{maxNodes:remaining,maxSolutions:1,exclude:{index:i,value:first[i]}});
   proofNodes+=attempt.nodes;remaining=Math.max(0,remaining-attempt.nodes);
   if(attempt.status==='unsatisfiable')truths.push({index:i,value:first[i]});
   else if(attempt.solutions.length){const witness=attempt.solutions[0];stable.forEach((v,j)=>{if(v&&witness[j]!==first[j])stable[j]=false;});}
   else truthComplete=false;
  }
  return {...result,truths,proofNodes,truthComplete};
 }
 function samurai(){const lookup=new Map(),coordinates=[],units=[],grids=[];for(const [r,c] of [[0,0],[0,12],[6,6],[12,0],[12,12]]){const cells=[];for(let y=0;y<9;y++)for(let x=0;x<9;x++){const key=`${r+y},${c+x}`;if(!lookup.has(key)){lookup.set(key,coordinates.length);coordinates.push([r+y,c+x]);}cells.push(lookup.get(key));}for(let i=0;i<9;i++){units.push(Array.from({length:9},(_,j)=>cells[i*9+j]),Array.from({length:9},(_,j)=>cells[j*9+i]));}for(let y=0;y<9;y+=3)for(let x=0;x<9;x+=3)units.push(Array.from({length:9},(_,i)=>cells[(y+Math.floor(i/3))*9+x+i%3]));grids.push({cells,clues:[]});}return {values:coordinates.map(()=>0),units,grids,clones:[],coordinates};}
 return {check,solve,deduce,samurai};
});
