import {pentagramGeometry,pentagramPosition} from './pentagram.mjs';
const pointKey=p=>`${p.x.toFixed(4)},${p.y.toFixed(4)}`;
const geometries=Array.from({length:80},(_,i)=>pentagramGeometry(i));
const edges=new Map();
geometries.forEach((geometry,cell)=>geometry.vertices.forEach((a,i)=>{
 const b=geometry.vertices[(i+1)%4],key=[pointKey(a),pointKey(b)].sort().join('|');
 const edge=edges.get(key)||{key,a,b,cells:[],center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
 edge.cells.push(cell);edges.set(key,edge);
}));
export const PENTAGRAM_DECORATION_EDGES=[...edges.values()].filter(edge=>edge.cells.length===2);
export function pentagramCageGeometry(cells,inset=3) {
 const selected=new Set(cells), boundary=[];
 if(!selected.size)return null;
 // Require a connected cage, including shared edges between star points.
 const seen=new Set([cells[0]]),queue=[cells[0]];
 for(const cell of queue)for(const edge of PENTAGRAM_DECORATION_EDGES)if(edge.cells.includes(cell))for(const neighbor of edge.cells)if(selected.has(neighbor)&&!seen.has(neighbor)){seen.add(neighbor);queue.push(neighbor);}
 if(seen.size!==selected.size)return null;
 for(const cell of selected){const vertices=geometries[cell].vertices;
  vertices.forEach((a,i)=>{const b=vertices[(i+1)%4],key=[pointKey(a),pointKey(b)].sort().join('|'),owners=edges.get(key).cells;if(owners.filter(owner=>selected.has(owner)).length===1)boundary.push({a,b});});
 }
 const byStart=new Map(boundary.map(edge=>[pointKey(edge.a),edge])),loops=[];
 while(byStart.size){const first=byStart.values().next().value,loop=[];let edge=first;
  do{loop.push(edge.a);byStart.delete(pointKey(edge.a));edge=byStart.get(pointKey(edge.b));}while(edge&&edge!==first);
  loops.push(loop);
 }
 function offset(points){return points.map((p,i)=>{
  const before=points[(i+points.length-1)%points.length],after=points[(i+1)%points.length];
  const ax=p.x-before.x,ay=p.y-before.y,bx=after.x-p.x,by=after.y-p.y,al=Math.hypot(ax,ay),bl=Math.hypot(bx,by);
  const q={x:p.x-ay/al*inset,y:p.y+ax/al*inset},r={x:p.x-by/bl*inset,y:p.y+bx/bl*inset},cross=ax*by-ay*bx;
  if(Math.abs(cross)<1e-6)return q;
  const t=((r.x-q.x)*by-(r.y-q.y)*bx)/cross;
  return {x:q.x+t*ax,y:q.y+t*ay};
 });}
 const outlines=loops.map(offset),vertices=outlines.flat();
 const cagePetals=new Set([...selected].map(cell=>geometries[cell].point));
 const petal=[4,0,1,3,2].find(point=>cagePetals.has(point));
 const origin=pentagramPosition(petal,0,0),u=pentagramPosition(petal,1,0),v=pentagramPosition(petal,0,1);
 const ux=u.x-origin.x,uy=u.y-origin.y,vx=v.x-origin.x,vy=v.y-origin.y,det=ux*vy-uy*vx;
 const local=p=>({u:((p.x-origin.x)*vy-(p.y-origin.y)*vx)/det,v:(ux*(p.y-origin.y)-uy*(p.x-origin.x))/det});
 const petalVertices=vertices.filter(p=>{const q=local(p);return q.u>=-1e-5&&q.u<=1+1e-5&&q.v>=-1e-5&&q.v<=1+1e-5;});
 const anchorVertices=petalVertices.length?petalVertices:vertices;
 const top=anchorVertices.reduce((best,p)=>p.y<best.y-1e-5||Math.abs(p.y-best.y)<1e-5&&p.x<best.x?p:best);
 let clue={x:top.x+3,y:top.y+8,anchor:'start'};
 if(petal===0)clue={x:top.x,y:top.y+16,anchor:'middle'};
 else if(petal===1)clue={x:top.x-1,y:top.y+12,anchor:'start'};
 else if(petal===2)clue={x:top.x+3,y:top.y+12,anchor:'start'};
 else {
  const bottomLeft=anchorVertices.reduce((best,p)=>{
   const a=local(best),b=local(p);
   if(petal===4)return b.u+b.v>a.u+a.v+1e-5||Math.abs(b.u+b.v-a.u-a.v)<1e-5&&b.u>a.u?p:best;
   return b.v>a.v+1e-5||Math.abs(b.v-a.v)<1e-5&&b.u<a.u?p:best;
  });
  // Inset toward the cell in the petal's own right/up directions.
  const ul=Math.hypot(ux,uy),vl=Math.hypot(vx,vy);
  if(petal===4)clue={x:bottomLeft.x-5*(ux/ul+vx/vl),y:bottomLeft.y-5*(uy/ul+vy/vl)+3,anchor:'start'};
  else clue={x:bottomLeft.x+5*(ux/ul-vx/vl),y:bottomLeft.y+5*(uy/ul-vy/vl)+3,anchor:'start'};
 }
 return {path:outlines.map(loop=>loop.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')+' Z').join(' '),clue};
}
