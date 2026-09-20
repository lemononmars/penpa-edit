import test from 'node:test';
import assert from 'node:assert/strict';
import {hundredCombinationGroups,hundredMixedCombinations,hundredTwoNumberCombinations,primeRunCombinations,primeRunSums} from '../docs/src/wsc2026/references.js';

test('Hundred reference enumerates every distinct-digit combination used by Round 3 patterns',()=>{
 assert.equal(hundredTwoNumberCombinations.length,18);
 assert.equal(hundredMixedCombinations.length,28);
 for(const expression of [...hundredTwoNumberCombinations,...hundredMixedCombinations]){
  const terms=expression.split(' + ').map(Number),digits=terms.flatMap(term=>String(term).split('').map(Number));
  assert.equal(terms.reduce((sum,value)=>sum+value,0),100,expression);
  assert.equal(new Set(digits).size,digits.length,expression);
 }
});

test('Hundred reference includes every grouping that can fit in a 9-cell row',()=>{
 const expectedCounts=[6,18,28,18,78,156,24];
 assert.deepEqual(hundredCombinationGroups.map(group=>group.combinations.length),expectedCounts);
 assert.equal(hundredCombinationGroups.flatMap(group=>group.combinations).length,328);
 for(const group of hundredCombinationGroups){
  for(const expression of group.combinations){
   const terms=expression.split(' + ').map(Number);
   const digits=terms.flatMap(term=>String(term).split('').map(Number));
   assert.equal(terms.reduce((sum,value)=>sum+value,0),100,expression);
   assert.equal(new Set(digits).size,digits.length,expression);
   assert.ok(digits.length+terms.length-1<=9,`${expression} must fit with separators in one row`);
   assert.equal(terms.filter(value=>value>=10).length,group.twoDigitCount);
   assert.equal(terms.filter(value=>value<10).length,group.singleCount);
  }
 }
});

test('Prime Run reference contains every distinct non-empty subset sum of 2, 3, 5 and 7',()=>{
 assert.deepEqual(primeRunSums,[2,3,5,7,8,9,10,12,14,15,17]);
 assert.equal(primeRunCombinations.flatMap(entry=>entry.digitSets).length,15);
 assert.deepEqual(primeRunCombinations.find(entry=>entry.sum===5)?.digitSets,[[2,3],[5]]);
 assert.deepEqual(primeRunCombinations.find(entry=>entry.sum===7)?.digitSets,[[2,5],[7]]);
 for(const {sum,digitSets} of primeRunCombinations){
  for(const digits of digitSets)assert.equal(digits.reduce((total,digit)=>total+digit,0),sum);
 }
});
