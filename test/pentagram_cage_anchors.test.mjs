import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pentagramCageGeometry} from '../docs/src/wsc2026/pentagramDecorations.mjs';
import {pentagramGeometry,pentagramPosition} from '../docs/src/wsc2026/pentagram.mjs';
test('killer clues use petal-specific anchors',()=>{
 for(let petal=0;petal<5;petal++){
  const geometry=pentagramCageGeometry([petal*16]);
  const vertices=[...geometry.path.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));
  const top=vertices.reduce((a,b)=>b.y<a.y?b:a),bottom=vertices.reduce((a,b)=>b.y>a.y?b:a);
  if(petal===0){assert.equal(geometry.clue.anchor,'middle');assert.equal(geometry.clue.y,top.y+16);}
  if(petal===1){assert.equal(geometry.clue.x,top.x-1);assert.equal(geometry.clue.y,top.y+12);}
  if(petal===2)assert.equal(geometry.clue.y,top.y+12);
  if(petal===3||petal===4){
   const target=pentagramGeometry(petal*16).vertices[petal===4?2:3];
   const corner=vertices.reduce((a,b)=>Math.hypot(b.x-target.x,b.y-target.y)<Math.hypot(a.x-target.x,a.y-target.y)?b:a);
   const origin=pentagramPosition(petal,0,0),u=pentagramPosition(petal,1,0),v=pentagramPosition(petal,0,1),ul=Math.hypot(u.x-origin.x,u.y-origin.y),vl=Math.hypot(v.x-origin.x,v.y-origin.y);
   const dx=petal===4?-5*((u.x-origin.x)/ul+(v.x-origin.x)/vl):5*((u.x-origin.x)/ul-(v.x-origin.x)/vl);
   const dy=petal===4?-5*((u.y-origin.y)/ul+(v.y-origin.y)/vl):5*((u.y-origin.y)/ul-(v.y-origin.y)/vl);
   assert.ok(Math.abs(geometry.clue.x-(corner.x+dx))<1e-8);
   assert.ok(Math.abs(geometry.clue.y-(corner.y+dy+3))<1e-8);
  }
 }
});

test('a cage spanning both bottom petals uses the bottom-left anchor',()=>{
 const geometry=pentagramCageGeometry([32,48]);
 assert.ok(geometry);
 const left= pentagramCageGeometry([48]).clue;
 assert.ok(Math.abs(geometry.clue.x-left.x)<1e-8);
 assert.ok(Math.abs(geometry.clue.y-left.y)<1e-8);
});
