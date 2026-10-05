import {puzzleSvg} from './downloadSudokuSvg.mjs';

const NS='http://www.w3.org/2000/svg', C=600;
const polar=(r,a)=>[C+r*Math.cos(a*Math.PI/180),C+r*Math.sin(a*Math.PI/180)];
function sector(inner,outer,start,width){
 const [a,b,c,d]=[polar(outer,start),polar(outer,start+width),polar(inner,start+width),polar(inner,start)];
 return `M${a} A${outer},${outer} 0 0 1 ${b} L${c} A${inner},${inner} 0 0 0 ${d} Z`;
}
function fragment(source,inner,outer,start,width,rotation,box){
 const svg=source.cloneNode(true),defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath'),path=document.createElementNS(NS,'path'),group=document.createElementNS(NS,'g'),turn=document.createElementNS(NS,'g');
 clip.id='print-cut';path.setAttribute('d',sector(inner,outer,start,width));clip.append(path);defs.append(clip);
 while(svg.firstChild)group.append(svg.firstChild);
 group.setAttribute('clip-path','url(#print-cut)');turn.setAttribute('transform',`rotate(${rotation} ${C} ${C})`);turn.append(group);svg.append(defs,turn);
 svg.setAttribute('viewBox',box.join(' '));svg.setAttribute('width',String(box[2]));svg.setAttribute('height',String(box[3]));
 return new XMLSerializer().serializeToString(svg);
}
export function shiftedPrintPages(board,outerAngle=0,phase=-17,includeOuter=true){
 const source=new DOMParser().parseFromString(puzzleSvg(board),'image/svg+xml').documentElement;
 const pages=[];
 // One centimetre is 20 SVG units. Each wedge is turned toward the right,
 // fitting A4 at its original scale instead of shrinking the whole board.
 if(includeOuter)for(let grid=0;grid<6;grid++){
  const start=-90+grid*60+outerAngle+phase;
  pages.push({title:`Outer grid ${String.fromCharCode(65+grid)}`,pieces:[{svg:fragment(source,199,417,start,60,-start-30,[768,384,254,432]),x:41.5,y:37,width:127,height:216}]});
 }
 // Separate silhouettes: rings 1 and 2 share a page; ring 3 gets its own.
 const rings=[0,1,2].map(ring=>{
  const inner=20+ring*60,outer=inner+60,pad=4,diameter=(outer+pad)*2;
  // Two half-annuli avoid SVG's degenerate full-circle arc.
  const svg=source.cloneNode(true),clip=document.createElementNS(NS,'clipPath'),path=document.createElementNS(NS,'path'),defs=document.createElementNS(NS,'defs'),group=document.createElementNS(NS,'g');
  clip.id='print-cut';path.setAttribute('d',sector(inner-2,outer+2,0,180)+' '+sector(inner-2,outer+2,180,180));clip.append(path);defs.append(clip);
  while(svg.firstChild)group.append(svg.firstChild);group.setAttribute('clip-path','url(#print-cut)');svg.append(defs,group);
  svg.setAttribute('viewBox',`${C-outer-pad} ${C-outer-pad} ${diameter} ${diameter}`);svg.setAttribute('width',String(diameter));svg.setAttribute('height',String(diameter));
  return {svg:new XMLSerializer().serializeToString(svg),width:diameter/2,height:diameter/2};
 });
 pages.push({title:'Inner rings 1 and 2',pieces:[{...rings[0],x:(210-rings[0].width)/2,y:24},{...rings[1],x:(210-rings[1].width)/2,y:120}]});
 pages.push({title:'Inner ring 3',pieces:[{...rings[2],x:(210-rings[2].width)/2,y:45}]});
 return pages;
}

export function fitShiftedPrintPages(pages,mode='actual') {
 const scale=mode==='fit'?Math.min(1,...pages.flatMap(page=>page.pieces.map(piece=>190/piece.width))):1;
 return pages.map(page=>({...page,scale,pieces:page.pieces.map(piece=>({...piece,x:105+(piece.x-105)*scale,y:148.5+(piece.y-148.5)*scale,width:piece.width*scale,height:piece.height*scale}))}));
}
export async function downloadShiftedPdf(board,outerAngle,phase,includeOuter=true,mode='actual') {
 const [{jsPDF}]=await Promise.all([import('jspdf'),import('svg2pdf.js')]);
 const pages=fitShiftedPrintPages(shiftedPrintPages(board,outerAngle,phase,includeOuter),mode);
 const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 doc.setProperties({title:'Shifted Sudoku puzzles',subject:'Separate outer grids and inner rings',creator:'WSC2026 practice tools'});
 for(let i=0;i<pages.length;i++){
  if(i)doc.addPage();const page=pages[i];
  doc.setFont('helvetica');doc.setTextColor(51,51,51);doc.setFontSize(11);doc.text(`Shifted Sudoku - ${page.title}`,8,12);
  doc.setFontSize(8);doc.text(`A4 - Print at 100% / Actual size. Puzzle scale: ${(page.scale*100).toFixed(1)}%.`,8,18);
  for(const piece of page.pieces){
   const svg=new DOMParser().parseFromString(piece.svg,'image/svg+xml').documentElement;
   svg.querySelectorAll('text').forEach(text=>{text.style.fontFamily='helvetica';text.style.fontWeight='normal';text.style.fontStyle='normal';});
   // The board SVG is curated by our exporter; backups contain data only.
   await doc.svg(svg,{x:piece.x,y:piece.y,width:piece.width,height:piece.height});
  }
  doc.setDrawColor(51,51,51);doc.setLineWidth(.2);doc.line(8,283,8+50*page.scale,283);doc.line(8,281,8,285);doc.line(8+50*page.scale,281,8+50*page.scale,285);
  doc.setFontSize(8);doc.text(`50 mm puzzle scale check (${(50*page.scale).toFixed(1)} mm on paper)`,8,290);
 }
 doc.save('shifted-sudoku-puzzles-a4.pdf');return pages.length;
}
