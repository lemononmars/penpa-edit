import test from 'node:test';
import assert from 'node:assert/strict';
import {isComplete,mostRecentCells,generateBlindPips,solveBlindPips,pipCandidates,PIP_MASKS,pipBit,BLIND_UNITS} from '../docs/src/wsc2026/blindPractice.mjs';
const empty=()=>Array.from({length:6},()=>Array(6).fill(0));
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);

test('partial pips act as candidate restrictions; missing pips are unknown',()=>{
 assert.deepEqual(pipCandidates(pipBit(5)),[1,3,5]);
 assert.deepEqual(pipCandidates(PIP_MASKS[4]),[4,5,6]);
 assert.deepEqual(pipCandidates(pipBit(4)),[6]);
 assert.deepEqual(pipCandidates(pipBit(2)),[]);
 const clues=Array(36).fill(0);clues[0]=pipBit(5);const entries=empty();entries[0][0]=2;
 assert.equal(solveBlindPips(clues,entries).status,'invalid');
 entries[0][0]=3;assert.equal(solveBlindPips(clues,entries).status,'solved');
});
test('generation removes individual pips while keeping exactly one classic completion',()=>{
 for(const seed of [123,456,789]){
  const generated=generateBlindPips({rng:rng(seed),targetPips:40});
  assert.equal(generated.unique,true);assert.ok(generated.clues.some(mask=>mask&&!Object.values(PIP_MASKS).includes(mask)));
  const result=solveBlindPips(generated.clues,undefined,{limitSolutions:2});
  assert.equal(result.status,'solved');assert.equal(result.solutions.length,1);assert.deepEqual(result.solution,generated.solution);
  const flat=result.solution.flat();for(const unit of BLIND_UNITS)assert.equal(new Set(unit.map(i=>flat[i])).size,6);
  assert.equal(isComplete(generated.clues,empty()),false);assert.equal(isComplete(generated.clues,result.solution),true);
  const entered=result.solution.map(row=>row.slice()),given=generated.clues.findIndex(Boolean);entered[Math.floor(given/6)][given%6]=0;
  assert.equal(isComplete(generated.clues,entered),false,'even clue cells must be filled');
 }
});
test('a search limit is never treated as a unique puzzle',()=>{
 assert.equal(generateBlindPips({maxNodes:1}).clues,null);
 const result=solveBlindPips(Array(36).fill(0),undefined,{limitSolutions:2});assert.equal(result.solutions.length,2);
});
test('only the two most recently selected distinct cells remain visible',()=>{
 let visible=[];for(const selected of [0,7,35,7])visible=mostRecentCells(visible,selected);
 assert.deepEqual(visible,[35,7]);assert.throws(()=>mostRecentCells(visible,36),RangeError);
});
