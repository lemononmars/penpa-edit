import test from 'node:test';
import assert from 'node:assert/strict';
import {generatePracticeSet,checkPractice,solvePractice,ruleResults} from '../docs/src/wpc2026/vibhishana.mjs';
function rectangular(values,n){const cells=values.map((v,i)=>v?i:-1).filter(i=>i>=0),rs=cells.map(i=>Math.floor(i/n)),cs=cells.map(i=>i%n);return cells.length===(Math.max(...rs)-Math.min(...rs)+1)*(Math.max(...cs)-Math.min(...cs)+1);}
test('shading practice generates general connected areas and multiple regions',()=>{
 for(const n of [6,8])for(const p of generatePracticeSet('shading',123,n).puzzles){assert.equal(rectangular(p.answer,n),false,'Shading is not restricted to a rectangle');assert.ok(p.regions.length>=3);assert.equal(checkPractice(p,p.answer,p.traitor).ok,true);}
});
test('shading evaluates each of the four IB rules independently on general shapes',()=>{
 for(const traitor of [1,2,3,4]){
  const n=6,answer=Array(36).fill(0);for(const cell of traitor===4?[0,1,2,3]:[0,1,6,7,8])answer[cell]=1;
  const p={type:'shading',n,givens:answer.map((value,cell)=>({cell,value})),circles:{},clues:[],regions:[{cells:Array.from({length:36},(_,i)=>i),value:traitor===2?4:answer.filter(Boolean).length}]};
  if(traitor===1||traitor===3){p.circles[13]='white';p.clues=[{cell:13,value:traitor===1?2:3}];}
  assert.deepEqual(ruleResults(p,answer),[1,2,3,4].map(rule=>rule!==traitor));assert.equal(checkPractice(p,answer,traitor).ok,true);
  const found=solvePractice(p);assert.equal(found.complete,true);assert.equal(found.length,1);assert.equal(found[0].traitor,traitor);
 }
});
test('loop and number clue counts do not disclose the traitor',()=>{
 for(const n of [6,8]){for(const p of generatePracticeSet('loops',123,n).puzzles)assert.ok(Object.keys(p.circles).length<p.answer.length*.85);for(const p of generatePracticeSet('numbers',123,n).puzzles){assert.ok(p.cages.length>=3);assert.equal(p.outside.length,n);}}
});
