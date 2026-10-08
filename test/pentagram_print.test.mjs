import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pentagramCutout} from '../docs/src/wsc2026/pentagramPrint.mjs';
test('Pentagram cut lines are 10 mm from every edge and fit A4 at the existing grid scale',()=>{
 const plan=pentagramCutout(190/600,10,(297-570*190/600)/2);
 for(let i=0;i<10;i++){
  const a=plan.outline[i],b=plan.outline[(i+1)%10],p=plan.cut[i],q=plan.cut[(i+1)%10];
  const distance=r=>Math.abs((b.x-a.x)*(r.y-a.y)-(b.y-a.y)*(r.x-a.x))/Math.hypot(b.x-a.x,b.y-a.y);
  assert.ok(Math.abs(distance(p)-10)<1e-8);assert.ok(Math.abs(distance(q)-10)<1e-8);
  assert.ok(p.x>=0&&p.x<=210&&p.y>=0&&p.y<=297);
 }
 assert.ok(Math.abs(plan.title.angle-18)<1e-8);
});
