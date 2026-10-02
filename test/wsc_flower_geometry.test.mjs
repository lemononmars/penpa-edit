import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FLOWER_GEOMETRIES,FLOWER_REGION_BORDERS,flowerHighlightMask } from '../docs/src/wsc2026/flowerGeometry.mjs';
import { FLOWER_CELL_UNITS } from '../docs/src/wsc2026/flowerSudoku.mjs';

test('all ninety cells, including E, span eighteen degrees',()=>{
 assert.equal(FLOWER_GEOMETRIES.length,90);
 assert.ok(FLOWER_GEOMETRIES.every((geometry)=>geometry.angleWidth===18));
});
test('bold borders occur at region changes and exposed edges only',()=>{
 const edges=new Map();
 FLOWER_GEOMETRIES.forEach((geometry,cell)=>geometry.edges.forEach((edge)=>{
  const owners=edges.get(edge.key)||[];owners.push({path:edge.path,region:FLOWER_CELL_UNITS[cell].find((id)=>id>=20)});edges.set(edge.key,owners);
 }));
 for(const owners of edges.values()){
  const border=FLOWER_REGION_BORDERS.includes(owners[0].path);
  assert.equal(border,owners.length===1||owners[0].region!==owners[1].region);
 }
});
test('the selected cell highlights both column directions and its region separately',()=>{
 assert.equal(flowerHighlightMask(0,0),7);
 const masks=Array.from({length:90},(_,cell)=>flowerHighlightMask(0,cell));
 assert.ok(masks.includes(1));assert.ok(masks.includes(2));assert.ok(masks.includes(4));
});
