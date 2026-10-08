import {FLOWER_LAYOUTS,FLOWER_CENTER} from './flowerGeometry.mjs';

export function flowerCutout({x,y,scale}){
 const cells=FLOWER_LAYOUTS.petals.geometries.slice(80),outline=[];
 function curve(from,to){
  const dx=to.x-from.x,dy=to.y-from.y,mx=(from.x+to.x)/2,my=(from.y+to.y)/2;
  const direction=(-dy*(mx-FLOWER_CENTER)+dx*(my-FLOWER_CENTER))>=0?1:-1;
  const control={x:mx-dy*.16*direction,y:my+dx*.16*direction};
  for(let i=0;i<16;i++){const t=i/16,u=1-t;outline.push({x:x+scale*(u*u*from.x+2*u*t*control.x+t*t*to.x),y:y+scale*(u*u*from.y+2*u*t*control.y+t*t*to.y)});}
 }
 cells.forEach((cell,i)=>{curve(cell.vertices[0],cell.vertices[2]);curve(cell.vertices[2],cells[(i+1)%cells.length].vertices[0]);});
 // Build the outer envelope of a 10 mm buffer around the sampled rim.
 // Taking the farthest intersection on each ray avoids the crossing loops
 // produced by parallel offsets at the flower's narrow concave valleys.
 const center={x:x+FLOWER_CENTER*scale,y:y+FLOWER_CENTER*scale};
 const cut=[];
 for(let step=0;step<720;step++){
  const angle=step*Math.PI/360,dx=Math.cos(angle),dy=Math.sin(angle);
  let radius=0;
  for(let i=0;i<outline.length;i++){
   const a=outline[i],b=outline[(i+1)%outline.length];
   const ax=a.x-center.x,ay=a.y-center.y,projection=ax*dx+ay*dy,perpendicular=ax*dy-ay*dx;
   if(perpendicular*perpendicular<=100)radius=Math.max(radius,projection+Math.sqrt(Math.max(0,100-perpendicular*perpendicular)));
   const ex=b.x-a.x,ey=b.y-a.y,length=Math.hypot(ex,ey),nx=ey/length*10,ny=-ex/length*10;
   for(const sign of [-1,1]){
    const px=ax+sign*nx,py=ay+sign*ny,cross=dx*ey-dy*ex;
    if(Math.abs(cross)<1e-10)continue;
    const t=(px*ey-py*ex)/cross,u=(px*dy-py*dx)/cross;
    if(u>=0&&u<=1&&t>radius)radius=t;
   }
  }
  cut.push({x:center.x+radius*dx,y:center.y+radius*dy});
 }

 return cut;
}

export function decorateFlowerPdf(doc,placement){
 const cut=flowerCutout(placement);
 doc.setDrawColor(120,120,120);doc.setLineWidth(.2);doc.setLineDashPattern([2,1],0);
 const segments=cut.slice(1).map((point,i)=>[point.x-cut[i].x,point.y-cut[i].y]);
 doc.lines(segments,cut[0].x,cut[0].y,[1,1],'S',true);
 doc.setLineDashPattern([],0);
}
