import test from 'node:test';
import assert from 'node:assert/strict';
import engine from '../docs/js/wsc_topology.js';
import {penpaData,penpaLinks} from '../docs/src/geometry/penpa.mjs';
import {inflateRawSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {parquet,parquetExample,enterDigit} from '../docs/src/geometry/layouts.mjs';
import {star,starExample,hex,isodoku,rhombus,isoUnits,editIsodoku,analyze,solverInput,validateLayout,drawing,fitBoard} from '../docs/src/geometry/layouts.mjs';

test('Star reproduces all six triangular regions and three directions, including tips and gaps',()=>{
 const b=star();
 assert.equal(b.cells.length,54);
 assert.equal(b.units.length,24);
 assert.ok(b.units.every(u=>u.cells.length===9&&new Set(u.cells).size===9));
 for(let i=0;i<54;i++)assert.equal(b.units.filter(u=>u.cells.includes(i)).length,4);
 const top=b.cells.findIndex(c=>c.points.some(([q,r])=>q===0&&r===0));
 assert.equal(b.units.filter(u=>u.kind==='horizontal'&&u.cells.includes(top)).length,1);
 assert.ok(b.units.filter(u=>u.kind==='horizontal').some(u=>{
  const centers=u.cells.map(i=>drawing(b).cells[i].center[0]).sort((a,b)=>a-b);
  return centers.some((x,i)=>i&&x-centers[i-1]>1);
 }));
});

test('Proof extraction distinguishes forced digits from coincidentally matching witnesses',()=>{
 const p={digitCount:2,values:[1,0,0,0],units:[[0,1],[2,3]]};
 const result=engine.deduce(p);assert.equal(result.status,'multiple');assert.equal(result.truthComplete,true);
 assert.deepEqual(result.truths,[{index:1,value:2}]);
 const ambiguous={digitCount:3,values:[0,0,0],units:[[0,1,2]]};
 const first=engine.solve(ambiguous);assert.equal(first.solutions[0][0],first.solutions[1][0]);
 assert.deepEqual(engine.deduce(ambiguous).truths,[],'agreement in two solutions does not imply a truth');
 const unfinished=engine.deduce(ambiguous,{maxNodes:first.nodes});assert.equal(unfinished.truthComplete,false);assert.deepEqual(unfinished.truths,[]);
 const limited=engine.deduce(p,{maxNodes:1});assert.equal(limited.status,'limit');assert.equal(limited.truthComplete,false);assert.deepEqual(limited.truths,[]);
 const unique=engine.deduce(solverInput(starExample()));assert.equal(unique.truths.length,35);assert.equal(unique.truthComplete,true);
});
test('Centre notes toggle independently of givens and survive import, cell edits and digit range checks',()=>{
 const empty=parquet();let b=enterDigit(empty,0,4,'center');b=enterDigit(b,0,2,'center');
 assert.deepEqual(b.notes[0],[2,4]);assert.equal(b.values[0],0);assert.equal(empty.notes,undefined);
 assert.deepEqual(solverInput(b),solverInput(empty),'pencil marks never constrain the solve');
 assert.deepEqual(validateLayout(JSON.parse(JSON.stringify(b))),b);
 b=enterDigit(b,0,4,'center');assert.deepEqual(b.notes[0],[2]);
 b=enterDigit(b,0,7);assert.equal(b.values[0],7);assert.deepEqual(b.notes[0],[]);
 b=enterDigit(b,0,3,'center');assert.equal(b.values[0],7);assert.deepEqual(b.notes[0],[]);
 assert.throws(()=>validateLayout({...b,notes:[[99]]}),/notes/);
 let iso=enterDigit(isodoku(),1,3,'center');iso=editIsodoku(iso,{type:'remove',index:0});assert.deepEqual(iso.notes[0],[3]);
});

test('Parquet reproduces every supplied SVG edge and covers each lattice square exactly once',()=>{
 const b=parquet(),edges=new Map(),owners=new Map();
 const key=(a,z)=>[a.join(','),z.join(',')].sort().join('|');
 for(const c of b.cells){
  for(const slot of c.slots){assert.ok(!owners.has(slot.join(',')));owners.set(slot.join(','),c);}
  c.points.forEach((p,i)=>{const k=key(p,c.points[(i+1)%c.points.length]);if(!edges.has(k))edges.set(k,[]);edges.get(k).push(c.region);});
 }
 assert.equal(owners.size,144);assert.equal(b.cells.length,81);
 const svg=readFileSync(new URL('../docs/public/geometry/parquet.svg',import.meta.url),'utf8'),expected=new Map();
 for(const match of svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*stroke-width="([^"]+)"/g)){
  const [x,y,X,Y]=match[1].match(/-?\d+(?:\.\d+)?/g).map(v=>(Number(v)-1.5)/38),k=key([x,y],[X,Y]);
  expected.set(k,Math.max(expected.get(k)||0,Number(match[2])));
 }
 assert.equal(edges.size,expected.size);
 for(const [k,regions] of edges){assert.ok(expected.has(k));assert.equal(regions.length===1||regions[0]!==regions[1],expected.get(k)===3,k);}
 assert.equal(b.units.length,33);assert.ok(b.units.every(u=>u.cells.length===9&&new Set(u.cells).size===9));
 const example=parquetExample();let givens=0;
 for(const text of svg.matchAll(/<text fill="#000000"[^>]*x="([^"]+)" y="([^"]+)"[^>]*>(\d)<\/text>/g)){
  const position=[(Number(text[1])-1.5)/38,(Number(text[2])-1.5-9.728)/38];
  const index=example.cells.findIndex(c=>c.labelPoint.every((v,i)=>Math.abs(v-position[i])<1e-6));
  assert.ok(index>=0);assert.equal(example.values[index],Number(text[3]));givens++;
 }
 assert.equal(givens,9);
});
test('Parquet spanning cells constrain all covered rows and columns, and export one digit per shape',async()=>{
 const b=parquet();b.values[0]=1;b.values[13]=1;
 assert.equal(analyze(b).conflicts.size,2,'L-shaped cell also participates in the second row');
 b.values[13]=0;b.values[35]=1;assert.equal(analyze(b).conflicts.size,2,'L-shaped cell also participates in the second column');
 const example=parquetExample(),result=engine.solve(solverInput(example));assert.equal(result.status,'multiple');
 const complete={...example,values:result.solutions[0]};assert.equal(analyze(complete).conflicts.size,0);
 assert.deepEqual(validateLayout({...example,units:[]}),example);
 const data=penpaData(example,result.solutions[0]);assert.equal(data.centerlist.length,144);assert.equal(new Set(data.numberIds).size,81);
 assert.equal(JSON.parse(data.solution)[4].length,72);assert.ok(data.solve.startsWith('square,12,12,'));
 const nearComplete={...complete,values:complete.values.map((v,i)=>i%7===0?0:v)};
 assert.equal(engine.solve(solverInput(nearComplete)).status,'unique');
});

test('Fit respects both viewport dimensions on wide, narrow and short screens',()=>{
 for(const b of [star(),hex(),isodoku()])for(const [w,h] of [[900,400],[280,500],[400,220]]){
  const fit=fitBoard(drawing(b).viewBox,w,h);assert.ok(fit.width<=w+1e-6&&fit.height<=h+1e-6);
  assert.ok(Math.abs(fit.width-w)<1e-6||Math.abs(fit.height-h)<1e-6);
 }
});
test('Empty Isodoku grows a custom tiling with regions across orientations',()=>{
 let b={...isodoku(),cells:[],values:[],units:[]};
 assert.ok(!drawing(b,true).viewBox.includes('Infinity'));assert.deepEqual(validateLayout(b),b);
 b=editIsodoku(b,{type:'add',q:0,r:0,orientation:'left',region:0});
 b=editIsodoku(b,{type:'add',q:0,r:0,orientation:'right',region:0});
 assert.equal(b.units.find(u=>u.kind==='region').cells.length,2);
 b=editIsodoku(b,{type:'remove',index:1});b=editIsodoku(b,{type:'remove',index:0});assert.equal(b.cells.length,0);
 assert.throws(()=>solverInput(b),/Add cells/);
});
test('Penpa links preserve geometry, givens, borders and checked solution entries',async()=>{
 for(const b of [starExample(),hex(),isodoku()]){
  if(b.kind==='hex')b.values=b.cells.map(c=>(c.q+3*(c.r%3)+Math.floor(c.r/3))%9+1);
  const solved=engine.solve(solverInput(b),{maxSolutions:1}).solutions[0];
  b.values[0]=solved[0];b.values[1]=0;
  const data=penpaData(b,solved),link=await penpaLinks(b,solved);
  assert.equal(new Set(data.numberIds).size,b.cells.length);
  assert.equal(data.centerlist.length,b.cells.length*(b.kind==='isodoku'?2:1));
  const parts=Object.fromEntries(link.solve.split('#')[1].split('&').map(p=>[p.slice(0,p.indexOf('=')),p.slice(p.indexOf('=')+1)]));
  const decoded=inflateRawSync(Buffer.from(parts.p,'base64')).toString();assert.equal(decoded,data.solve);
  const answers=JSON.parse(inflateRawSync(Buffer.from(parts.a,'base64')).toString())[4];
  assert.equal(answers.length,b.values.filter(v=>!v).length);assert.ok(answers.includes(data.numberIds[1]+','+solved[1]));
  assert.ok(Object.keys(JSON.parse(decoded.split('\n')[3]).lineE).length>b.cells.length);
 }
});

test('Star solves the official example and matches the booklet solution in every cell',()=>{
 const b=starExample(),result=engine.solve(solverInput(b));
 assert.equal(result.status,'unique');
 const expectedRows=[[9],[8,7,5,1,2,6,3,4],[3,2,6,4,1,9,8,5,7],[4,1,5,9,3,7,6,2,8],[6,2,8,7,3,4,5,1,9],[7,5,4,6,1,9,8,2,3],[3,8,9,2,1,5,7,6],[4]];
 const cells=drawing(b).cells;
 for(let row=0;row<8;row++){
  const indices=b.cells.flatMap((c,i)=>Math.min(...c.points.map(p=>p[1]))===row?[i]:[]).sort((a,b)=>cells[a].center[0]-cells[b].center[0]);
  assert.deepEqual(indices.map(i=>result.solutions[0][i]),expectedRows[row]);
 }
});

test('Hex uses real hexagons and ascending top-right columns; rows, columns and boxes constrain values',()=>{
 const b=hex(),render=drawing(b);
 assert.equal(b.cells.length,81);
 assert.ok(b.cells.every(c=>c.points.length===6));
 assert.equal(b.units.filter(u=>u.kind==='rising').length,9);
 for(const u of b.units.filter(u=>u.kind==='rising')){
  for(let i=1;i<u.cells.length;i++){
   const before=render.cells[u.cells[i-1]].center,after=render.cells[u.cells[i]].center;
   assert.ok(after[0]>before[0]&&after[1]<before[1]);
  }
 }
 const solution=b.cells.map(c=>(c.q+3*(c.r%3)+Math.floor(c.r/3))%9+1);
 b.values=solution.slice();[0,14,28,42,56,70,80].forEach(i=>b.values[i]=0);
 const result=engine.solve(solverInput(b));assert.equal(result.status,'unique');assert.deepEqual(result.solutions[0],solution);
 b.values.fill(0);b.values[0]=4;b.values[10]=4;
 assert.equal(analyze(b).conflicts.size,2,'cells in the same box conflict');
});

test('Isodoku rows cross folds through opposite edges and regions use the requested digit range',()=>{
 const b=isodoku();
 assert.equal(b.cells.length,48);assert.equal(b.digitCount,8);
 assert.equal(b.units.length,18);assert.ok(b.units.every(u=>u.cells.length===8));
 assert.ok(b.units.filter(u=>u.kind==='row').every(u=>new Set(u.cells.map(i=>b.cells[i].orientation)).size===2));
 const result=engine.solve(solverInput(b));assert.equal(result.status,'multiple');
 const completed={...b,values:result.solutions[0]};assert.equal(analyze(completed).conflicts.size,0);
 const crossing=b.units.find(u=>u.kind==='row');completed.values[crossing.cells[0]]=completed.values[crossing.cells.at(-1)];
 assert.ok(analyze(completed).conflicts.size>=2);
});

test('Custom Isodoku can add each orientation and retraces rows without overlaps',()=>{
 const cells=[rhombus(0,0,'top')];
 let b={version:1,kind:'isodoku',digitCount:3,cells,units:isoUnits(cells),values:[0]};
 b=editIsodoku(b,{type:'add',q:0,r:0,orientation:'left'});
 b=editIsodoku(b,{type:'add',q:0,r:0,orientation:'right'});
 assert.equal(b.units.length,3);assert.ok(b.units.every(u=>u.cells.length===2));
 assert.equal(engine.solve(solverInput(b)).status,'multiple');
 assert.throws(()=>editIsodoku(b,{type:'replace',index:0,q:0,r:0,orientation:'left'}),/overlaps/);
 b=editIsodoku(b,{type:'remove',index:1});
 b=editIsodoku(b,{type:'replace',index:0,q:0,r:0,orientation:'left'});
 assert.equal(b.cells[0].orientation,'left');assert.equal(b.units.length,1);
 b=editIsodoku(b,{type:'region',index:0,region:2});assert.equal(b.cells[0].region,2);
 assert.deepEqual(validateLayout(JSON.parse(JSON.stringify(b))),b);
});

test('Imports reconstruct geometry and reject invalid or impossible definitions',()=>{
 const original=starExample();assert.deepEqual(validateLayout({...original,units:[]}),original);
 assert.throws(()=>validateLayout({...original,values:[99]}),/digit/);
 assert.throws(()=>validateLayout({...isodoku(),cells:[rhombus(0,0,'top'),rhombus(0,0,'top')]}),/overlap/);
 assert.throws(()=>rhombus(0,0,'invalid'),/orientation/);
 assert.throws(()=>solverInput({...isodoku(),digitCount:6}),/8 cells/);
 assert.equal(engine.solve({digitCount:2,values:[0,0],units:[[0,1]]}).status,'multiple');
 assert.equal(engine.solve({values:[1,2,3,4,5,6,7,8,0],units:[[0,1,2,3,4,5,6,7,8]]},{maxSolutions:1}).status,'solved','one found completion is not a uniqueness proof');
});

