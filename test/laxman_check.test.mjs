import assert from 'node:assert/strict';
import test from 'node:test';
import { checkLaxman } from '../docs/src/laxmanCheck.mjs';

function board() {
 const rows=4, cols=4, point=[], centerlist=[];
 for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) { const id=point.length; point.push({x:c+.5,y:r+.5,type:0,neighbor:[]}); centerlist.push(id); }
 const vertex=[];
 for(let r=0;r<=rows;r++) { vertex[r]=[]; for(let c=0;c<=cols;c++) { vertex[r][c]=point.length; point.push({x:c,y:r,type:1,neighbor:[]}); } }
 const lineE={};
 const add=(r1,c1,r2,c2)=>{ const a=vertex[r1][c1],b=vertex[r2][c2]; lineE[`${Math.min(a,b)},${Math.max(a,b)}`]=3; };
 for(let c=1;c<3;c++){ add(1,c,1,c+1); add(3,c,3,c+1); }
 for(let r=1;r<3;r++){ add(r,1,r+1,1); add(r,3,r+1,3); }
 return {nx:cols,ny:rows,size:1,point,centerlist,pu_a:{lineE},pu_q:{symbol:{},number:{}},vertex,add};
}
test('loop topology runs before clues and reports open, branched, and separate loops',()=>{
 const p=board(); assert.equal(checkLaxman(p).ok,true);
 const first=Object.keys(p.pu_a.lineE)[0]; delete p.pu_a.lineE[first]; assert.match(checkLaxman(p).message,/open end/i);
 p.pu_a.lineE[first]=3; p.add(1,1,0,1); assert.match(checkLaxman(p).message,/branches/i);
 const q=board(); for(let c=0;c<4;c++){ q.add(0,c,0,c+1); q.add(4,c,4,c+1); } for(let r=0;r<4;r++){ q.add(r,0,r+1,0); q.add(r,4,r+1,4); }
 assert.match(checkLaxman(q).message,/more than one loop/i);
});
test('all six Laxman clue types check and stop at the first wrong mark',()=>{
 const p=board(), cell=(r,c)=>p.centerlist[r*4+c];
 p.pu_q.symbol[cell(1,1)]=[[1,1,0,0,0,0,0,0],'arrow_cross',2];
 p.pu_q.number[cell(1,1)]=['2_0',1,'2']; // Up sees a two-edge segment.
 p.pu_q.number[cell(1,2)]=['2',2,'1']; // Two used cell edges.
 p.pu_q.number[cell(0,0)]=['W',1,'1'];
 const dot=p.vertex[1][1]; p.point[dot].neighbor=[cell(0,0),cell(0,1),cell(1,0),cell(1,1)];
 p.pu_q.symbol[dot]=[2,'circle_SS',2];
 const square=p.point.length; p.point.push({x:2,y:.5,type:2,neighbor:[cell(0,1),cell(0,2)]});
 p.pu_q.symbol[square]=[1,'square_S',2]; p.pu_q.number[square]=['3',1,'5'];
 assert.equal(checkLaxman(p).ok,true);
 p.pu_q.number[cell(0,0)]=['S',1,'1'];
 const bad=checkLaxman(p); assert.equal(bad.ok,false); assert.equal(bad.point,cell(0,0)); assert.match(bad.message,/wrong side/i);
});
