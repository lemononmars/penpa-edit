import {pentagramGeometry} from './pentagram.mjs';
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
 const top=vertices.reduce((best,p)=>p.y<best.y-1e-5||Math.abs(p.y-best.y)<1e-5&&p.x<best.x?p:best);
 return {path:outlines.map(loop=>loop.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')+' Z').join(' '),clue:{x:top.x+3,y:top.y+8}};
}
