import assert from 'node:assert/strict';
import {test} from 'node:test';
import {directionalArrowValidator,solveCircular} from '../docs/src/wsc2026/circularSudoku.mjs';
const index=(r,c)=>81+r*54+c;
test('3 Up checks all eight directions and partial increasing triples',()=>{
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
  const values=Array(567).fill(0),check=directionalArrowValidator([{row:4,col:4,dx,dy}],'threeup');
  [2,5,8].forEach((v,i)=>values[index(4+i*dy,4+i*dx)]=v);assert.ok(check(values));
  values[index(4+2*dy,4+2*dx)]=4;assert.equal(check(values),false);
  values[index(4+dy,4+dx)]=0;values[index(4+2*dy,4+2*dx)]=3;assert.equal(check(values),false);
 }
 assert.equal(directionalArrowValidator([{row:0,col:8,dx:1,dy:0}],'threeup')(Array(567).fill(0)),false);
});
test('Inside Skyscraper counts visibility after the clue and enforces multiple arrows',()=>{
 const arrows=[{row:4,col:4,dx:1,dy:0},{row:4,col:4,dx:0,dy:1}],values=Array(567).fill(0),check=directionalArrowValidator(arrows,'insideskyscraper');
 values[index(4,4)]=2;
 [3,1,4,2].forEach((v,i)=>{values[index(4,5+i)]=v;values[index(5+i,4)]=v;});
 assert.ok(check(values));values[index(8,4)]=5;assert.equal(check(values),false);
 values[index(8,4)]=0;assert.ok(check(values));
});
test('solver applies every arrow in a cell',()=>{
 const arrows=[{row:0,col:0,dx:1,dy:0},{row:0,col:0,dx:0,dy:1}],values=Array(567).fill(0);values[index(0,0)]=1;
 const result=solveCircular(values,[0,0,0],true,0,{directionalArrows:arrows,arrowRule:'threeup'});
 assert.equal(result.status,'solved');assert.ok(directionalArrowValidator(arrows,'threeup')(result.solution));
 values[index(2,0)]=2;assert.equal(solveCircular(values,[0,0,0],true,0,{directionalArrows:arrows,arrowRule:'threeup'}).status,'invalid');
});
test('solver completes Inside Skyscraper with multiple directions',()=>{
 const arrows=[{row:4,col:4,dx:1,dy:0},{row:4,col:4,dx:0,dy:1}],values=Array(567).fill(0);values[index(4,4)]=2;
 const result=solveCircular(values,[0,0,0],true,0,{directionalArrows:arrows,arrowRule:'insideskyscraper'});
 assert.equal(result.status,'solved');assert.ok(directionalArrowValidator(arrows,'insideskyscraper')(result.solution));
});
