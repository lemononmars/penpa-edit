import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLOWER_GEOMETRIES,FLOWER_REGION_BORDERS,FLOWER_LAYOUTS,flowerCircleRotation,flowerHighlightMask } from '../docs/src/wsc2026/flowerGeometry.mjs';
import { FLOWER_CELL_UNITS } from '../docs/src/wsc2026/flowerSudoku.mjs';

test('all ninety cells, including E, span eighteen degrees',()=>{
 assert.equal(FLOWER_GEOMETRIES.length,90);
 assert.ok(FLOWER_GEOMETRIES.every((geometry)=>geometry.angleWidth===18));
});
test('reversed petal diagonals alternate the circle intersections',()=>{
 assert.deepEqual(Array.from({length:6},(_,i)=>flowerCircleRotation(i+1,'petals')),[-18,0,-18,0,-18,0]);
 FLOWER_LAYOUTS.petals.geometries.forEach((geometry,index)=>{
  const layer=Math.floor(index/20);
  assert.equal(geometry.innerOffset,layer%2 ? 0 : -18);
  assert.equal(geometry.outerOffset,layer%2 ? -18 : 0);
  assert.equal(geometry.angleWidth,18);
  assert.notEqual(geometry.path,FLOWER_GEOMETRIES[index].path);
 });
});
test('petal reconnections share one boundary between touching cells and retain the mapped regions',()=>{
 const edges=new Map();
 FLOWER_LAYOUTS.petals.geometries.forEach((geometry,cell)=>geometry.edges.forEach((edge)=>{
  const owners=edges.get(edge.key)||[];owners.push({path:edge.path,region:FLOWER_CELL_UNITS[cell].find(id=>id>=20)});edges.set(edge.key,owners);
 }));
 for(const owners of edges.values()) {
  assert.ok(owners.length<=2);
  assert.equal(FLOWER_LAYOUTS.petals.borders.includes(owners[0].path),owners.length===1||owners[0].region!==owners[1].region);
 }
});
test('every diagonal reverses, with odd A/C/E closing and odd B/D opening',()=>{
 for(const [layer,index] of [['A',0],['B',20],['C',40],['D',60],['E',80]]){
  const geometry=FLOWER_LAYOUTS.petals.geometries[index];
  assert.equal(Math.sign(geometry.leftTurn),['B','D'].includes(layer)?-1:1);
  assert.equal(Math.sign(geometry.rightTurn),['B','D'].includes(layer)?1:-1);
 }
 for(let layer=0;layer<4;layer++)for(let petal=0;petal<19;petal++){
  const left=FLOWER_LAYOUTS.petals.geometries[layer*20+petal],right=FLOWER_LAYOUTS.petals.geometries[layer*20+petal+1];
  assert.equal(left.rightTurn,right.leftTurn);
  assert.equal(left.leftTurn,-left.rightTurn);
 }
});
test('bold borders occur at region changes and exposed edges only',()=>{
 const edges=new Map();
 FLOWER_GEOMETRIES.forEach((geometry,cell)=>geometry.edges.forEach((edge)=>{
  const owners=edges.get(edge.key)||[];owners.push({path:edge.path,region:FLOWER_CELL_UNITS[cell].find((id)=>id>=20)});edges.set(edge.key,owners);
 }));
 for(const [key,owners] of edges){
  const border=FLOWER_REGION_BORDERS.includes(owners[0].path);
  assert.equal(border,!key.startsWith('arc:360:') && (owners.length===1||owners[0].region!==owners[1].region));
 }
});
test('the outermost circle is absent from both outlines while all ninety cells remain',()=>{
 for(const layout of Object.values(FLOWER_LAYOUTS)){
  assert.equal(layout.geometries.length,90);
  assert.ok(layout.borders.every(path=>!path.includes('A360,360')));
  assert.ok(layout.geometries.every(geometry=>!geometry.outline.includes('A360,360')));
 }
});
test('the selected cell highlights both column directions and its region separately',()=>{
 assert.equal(flowerHighlightMask(0,0),7);
 const masks=Array.from({length:90},(_,cell)=>flowerHighlightMask(0,cell));
 assert.ok(masks.includes(1));assert.ok(masks.includes(2));assert.ok(masks.includes(4));
});
