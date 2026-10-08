import {pentagramPosition} from './pentagram.mjs';

export function pentagramCutout(scale,x,y){
 const outline=Array.from({length:5},(_,point)=>[pentagramPosition(point,1,0),pentagramPosition(point,1,1)]).flat().map(p=>({x:x+p.x*scale,y:y+p.y*scale}));
 // Offset every edge by exactly 10 mm, intersecting adjacent parallel
 // lines at both tips and concave notches.
 const edges=outline.map((a,i)=>{
  const b=outline[(i+1)%outline.length],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
  return {a:{x:a.x+10*dy/length,y:a.y-10*dx/length},dx,dy};
 });
 const cut=edges.map((edge,i)=>{
  const prev=edges[(i+edges.length-1)%edges.length];
  const cross=prev.dx*edge.dy-prev.dy*edge.dx;
  const t=((edge.a.x-prev.a.x)*edge.dy-(edge.a.y-prev.a.y)*edge.dx)/cross;
  return {x:prev.a.x+t*prev.dx,y:prev.a.y+t*prev.dy};
 });
 const a=outline[9],b=outline[0],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
 return {outline,cut,title:{x:(a.x+b.x)/2+5*dy/length,y:(a.y+b.y)/2-5*dx/length,angle:-Math.atan2(dy,dx)*180/Math.PI,length}};
}

export function decoratePentagramPdf(doc,placement,title){
 const plan=pentagramCutout(placement.scale,placement.x,placement.y);
 doc.setDrawColor(120,120,120);doc.setLineWidth(.2);doc.setLineDashPattern([2,1],0);
 const path=[];
 for(let i=0;i<plan.cut.length;i++){
  const corner=plan.cut[i],prev=plan.cut[(i+9)%10],next=plan.cut[(i+1)%10];
  if(i%2===0){path.push({op:i===0?'m':'l',c:[corner.x,corner.y]});continue;}
  const toward=p=>{const length=Math.hypot(p.x-corner.x,p.y-corner.y);return {x:corner.x+(p.x-corner.x)*3/length,y:corner.y+(p.y-corner.y)*3/length};};
  const before=toward(prev),after=toward(next);
  path.push({op:'l',c:[before.x,before.y]},{op:'c',c:[before.x+(corner.x-before.x)*2/3,before.y+(corner.y-before.y)*2/3,after.x+(corner.x-after.x)*2/3,after.y+(corner.y-after.y)*2/3,after.x,after.y]});
 }
 path.push({op:'h',c:[]});doc.path(path).stroke();
 doc.setLineDashPattern([],0);doc.setTextColor(0,0,0);doc.setFont('helvetica','bold');doc.setFontSize(11);
 const textWidth=doc.getTextWidth(title);
 if(textWidth>plan.title.length-6)doc.setFontSize(11*(plan.title.length-6)/textWidth);
 const width=doc.getTextWidth(title),angle=plan.title.angle*Math.PI/180;
 // Centre along the rotated baseline explicitly: jsPDF's align:center
 // shifts in page X before rotating, pushing diagonal titles past the cut.
 doc.text(title,plan.title.x-width*Math.cos(angle)/2,plan.title.y+width*Math.sin(angle)/2,{angle:plan.title.angle});
}
