import test from 'node:test';
import assert from 'node:assert/strict';
import {generatePracticeSet,solvePractice,checkPractice,loopEdges,ruleResults} from '../docs/src/wpc2026/vibhishana.mjs';

test('all four Round 19 sets contain unique puzzles with different traitors',()=>{
 for(const seed of [123,456])for(const type of ['loops','shading','numbers','objects']){
  const set=generatePracticeSet(type,seed);
  assert.deepEqual(set.puzzles.map(p=>p.traitor).sort(),[1,2,3,4]);
  for(const p of set.puzzles){
   const found=solvePractice(p);
   assert.equal(found.length,1,`${type}, seed ${seed}, traitor ${p.traitor}`);
   assert.equal(found[0].traitor,p.traitor);
   assert.deepEqual(found[0].answer,p.answer);
   assert.equal(ruleResults(p,p.answer).filter(Boolean).length,3);
   const input=type==='loops'?loopEdges(p.answer):p.answer;
   assert.equal(checkPractice(p,input,p.traitor).ok,true);
   assert.equal(checkPractice(p,input,p.traitor%4+1).ok,false);
  }
 }
});

test('incomplete numbers and open loops are rejected',()=>{
 const number=generatePracticeSet('numbers',789).puzzles[0];
 assert.equal(checkPractice(number,Array(25).fill(0),number.traitor).ok,false);
 const loop=generatePracticeSet('loops',789).puzzles[0];
 assert.equal(checkPractice(loop,loopEdges(loop.answer).slice(1),loop.traitor).ok,false);
});

test('6x6 and 8x8 sets prove uniqueness across all traitor choices',()=>{
 for(const n of [6,8])for(const type of ['loops','shading','numbers','objects']){
  const pack=generatePracticeSet(type,123,n);
  assert.deepEqual(pack.puzzles.map(p=>p.traitor).sort(),[1,2,3,4]);
  for(const p of pack.puzzles){
   assert.equal(p.n,n);
   assert.deepEqual(p.givens,[]);
   if(type==='loops'){
    assert.equal(p.blocked.filter(Boolean).length,2);assert.equal(p.clues.length,2);
    assert.equal(p.answer.length,n*n-(p.traitor===1?4:2));
    for(const [cell,blocked] of p.blocked.entries())if(blocked)assert.ok(p.clues.some(c=>c.cell===cell));
   }
   if(type==='objects')assert.deepEqual(p.fleet,n===8?[4,3,2,2,1,1,1]:[3,2,2,1,1,1]);
   if(type==='shading'){
    assert.ok(Object.keys(p.circles).length<=n);
    assert.ok(p.clues.length<=n);
    const covered=[];
    for(const region of p.regions){
     assert.equal(region.cells.length,region.height*region.width);
     for(const cell of region.cells){assert.ok(Math.floor(cell/n)>=region.r&&Math.floor(cell/n)<region.r+region.height);assert.ok(cell%n>=region.c&&cell%n<region.c+region.width);covered.push(cell);}
    }
    assert.equal(new Set(covered).size,n*n);assert.equal(covered.length,n*n);
   }
   const result=solvePractice(p);
   assert.equal(result.complete,true);
   assert.equal(result.length,1);
   assert.equal(result[0].traitor,p.traitor);
   const input=type==='loops'?loopEdges(result[0].answer):result[0].answer;
   assert.equal(checkPractice(p,input,p.traitor).ok,true);
  }
 }
});


test('loop constraint solver matches exhaustive cycles on a small embedded board',()=>{
 const n=6,white=[0,1,2,6,7,8,12,13,14],neighbours=i=>white.filter(j=>Math.abs(Math.floor(i/n)-Math.floor(j/n))+Math.abs(i%n-j%n)===1);
 for(const circles of [{0:'black',2:'white'},{0:'white',7:'black'},{0:'black',2:'black',14:'white'}]){
  const p={type:'loops',n,givens:[],blocked:Array.from({length:n*n},(_,i)=>white.includes(i)?0:1),circles,clues:[{cell:3,value:1},{cell:15,value:1}]},expected=new Set(),path=[0];
  function walk(i){for(const next of neighbours(i)){if(next===0){if(path.length>=4&&path[1]<i){const rules=ruleResults(p,path);if(rules.filter(Boolean).length===3&&checkPractice(p,loopEdges(path),rules.indexOf(false)+1).ok)expected.add(loopEdges(path).sort().join(';'));}continue;}if(path.includes(next))continue;path.push(next);walk(next);path.pop();}}
  walk(0);const found=solvePractice(p,10000);assert.equal(found.complete,true);assert.deepEqual(new Set(found.map(x=>loopEdges(x.answer).sort().join(';'))),expected);
 }
});

test('shading propagation matches exhaustive assignments on a small embedded board',()=>{
 const n=6,cells=[0,1,2,6,7,8,12,13,14],p={type:'shading',n,givens:Array.from({length:n*n},(_,cell)=>({cell,value:0})).filter(g=>!cells.includes(g.cell)),circles:{0:'white'},clues:[{cell:0,value:2}],regions:[{cells:[0,1,6,7],value:2},{cells:[2,8,14],value:1}]},expected=new Set();
 for(let mask=0;mask<1<<cells.length;mask++){const a=Array(n*n).fill(0);cells.forEach((cell,i)=>a[cell]=mask>>i&1);const rules=ruleResults(p,a);if(rules.filter(Boolean).length===3&&checkPractice(p,a,rules.indexOf(false)+1).ok)expected.add(a.join(''));}
 const found=solvePractice(p,10000);assert.equal(found.complete,true);assert.deepEqual(new Set(found.map(x=>x.answer.join(''))),expected);
});


test('number-placement cages never overlap and preserve unique solutions',()=>{
 for(const n of [6,8])for(const seed of [123,456])for(const p of generatePracticeSet('numbers',seed,n).puzzles){
  const cells=p.cages.flat();assert.equal(new Set(cells).size,cells.length);
  for(const [a,b] of p.cages)assert.equal(Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n),1);
  const found=solvePractice(p);assert.equal(found.complete,true);assert.equal(found.length,1);assert.equal(found[0].traitor,p.traitor);
 }
});
