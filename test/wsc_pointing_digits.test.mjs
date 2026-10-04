import assert from 'node:assert/strict';
import {test} from 'node:test';
import {solveCircular,pointingDigitsValidator,circularModel} from '../docs/src/wsc2026/circularSudoku.mjs';
test('all four diagonal directions enforce X at exactly X steps',()=>{
 for(const arrow of [{row:0,col:0,dx:1,dy:1},{row:0,col:8,dx:-1,dy:1},{row:8,col:0,dx:1,dy:-1},{row:8,col:8,dx:-1,dy:-1}]){
  const values=Array(567).fill(0),start=81+arrow.row*54+arrow.col,target=81+(arrow.row+3*arrow.dy)*54+arrow.col+3*arrow.dx;
  values[start]=3;
  const result=solveCircular(values,[0,0,0],true,0,{pointingArrows:[arrow]});
  assert.equal(result.status,'solved');assert.equal(result.solution[target],3);
  assert.ok(pointingDigitsValidator([arrow])(result.solution));
  for(const unit of circularModel([0,0,0],true).units){assert.equal(unit.length,9);}
  values[target]=4;assert.equal(solveCircular(values,[0,0,0],true,0,{pointingArrows:[arrow]}).status,'invalid');
 }
});
test('an arrow cannot leave its grid, wrap to the next grid or repeat within a box',()=>{
 const values=Array(567).fill(0);values[81+8]=3;
 assert.equal(pointingDigitsValidator([{row:0,col:8,dx:1,dy:1}])(values),false);
 values.fill(0);values[81]=1;
 assert.equal(pointingDigitsValidator([{row:0,col:0,dx:1,dy:1}])(values),false);
});
