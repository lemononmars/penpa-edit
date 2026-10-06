import test from 'node:test';
import assert from 'node:assert/strict';
import {pyramid,rotations,identity,turnOrientation,orientCube,generatePyramid,solvePyramid,checkAssembly} from '../docs/src/wpc2026/sanjeevani.mjs';

test('pyramids have the correct centered layers and quarter-face contacts',()=>{
 for(const layers of [2,3]){const board=pyramid(layers);assert.equal(board.slots.length,layers===2?5:14);for(const upper of board.slots.filter(s=>s.level>0)){const supports=board.contacts.filter(c=>c.b===upper.id&&c.fa===2);assert.equal(supports.length,4);assert.ok(supports.every(c=>c.half===.25));}}
});
test('all 24 cube rotations are proper, and quarter turns preserve the group',()=>{
 assert.equal(rotations.length,24);assert.equal(new Set(rotations.map(m=>m.flat().join())).size,24);
 for(let o=0;o<24;o++)for(const axis of ['x','y','z']){let next=o;for(let k=0;k<4;k++)next=turnOrientation(next,axis);assert.equal(next,o);assert.equal(turnOrientation(turnOrientation(o,axis),axis,true),o);}
});
test('both sizes generate and prove a unique valid assembly for varied seeds',()=>{
 for(const layers of [2,3])for(const seed of [1,123,456,789,1000]){const p=generatePyramid(layers,seed),proof=solvePyramid(p);assert.equal(proof.complete,true);assert.equal(proof.solutions.length,1);assert.equal(checkAssembly(p,p.solution).ok,true);assert.equal(checkAssembly(p,[]).ok,false);
  const bad=p.solution.map(v=>({...v}));bad[0].orientation=turnOrientation(bad[0].orientation,'x');assert.equal(checkAssembly(p,bad).ok,false);
  bad[0]={...bad[1]};assert.equal(checkAssembly(p,bad).ok,false);
 }
});
test('one corrupted upper-bottom quadrant breaks exactly one support contact',()=>{
 const p=generatePyramid(3,123),world={...p,cubes:p.cubes.map((cube,i)=>orientCube(cube,p.solution.find(a=>a.cube===i).orientation))},placements=p.solution.map(p=>({cube:p.cube,orientation:identity})),upper=pyramid(3).slots.find(s=>s.level===2),cube=world.cubes[placements[upper.id].cube];
 const mark=cube.faces[3][0];mark.kind='number';mark.value='99';
 const result=checkAssembly(world,placements);assert.equal(result.ok,false);assert.equal(result.mismatches,1);assert.equal(result.conflicts.length,2);
});
test('matching semicircles must have the same colour',()=>{
 const p=generatePyramid(3,123),world={...p,cubes:p.cubes.map((cube,i)=>orientCube(cube,p.solution.find(a=>a.cube===i).orientation))},placements=p.solution.map(p=>({cube:p.cube,orientation:identity}));
 const mark=world.cubes.flatMap(c=>c.faces[1]).find(m=>m.kind==='dot');assert.ok(mark);mark.value=mark.value==='black'?'white':'black';assert.equal(checkAssembly(world,placements).ok,false);
});
