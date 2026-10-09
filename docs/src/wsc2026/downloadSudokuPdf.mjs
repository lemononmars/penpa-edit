import {puzzleSvg} from './downloadSudokuSvg.mjs';

export async function downloadSudokuPdf(board,filename,includeSolution=false,options={}){
 return downloadSudokuPdfPages([{board,includeSolution,...options}],filename);
}

export async function downloadSudokuPdfPages(pages,filename){
 const [{jsPDF}]=await Promise.all([import('jspdf'),import('svg2pdf.js')]);
 const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 for(const [index,options] of pages.entries()){
 if(index)doc.addPage();
 const {board,includeSolution=false}=options;
 const svg=new DOMParser().parseFromString(puzzleSvg(board,includeSolution),'image/svg+xml').documentElement;
 svg.querySelectorAll('text').forEach(text=>{
  const size=parseFloat(text.style.fontSize)||12;
  if(text.style.dominantBaseline==='central'||text.style.dominantBaseline==='middle'){
   text.setAttribute('y',String(Number(text.getAttribute('y'))+size*.35));
   text.style.dominantBaseline='alphabetic';
  }
  text.style.fontFamily='helvetica';text.style.fontWeight='normal';text.style.fontStyle='normal';
 });
 // Cage clues are plain black text without a background or outline.
 svg.querySelectorAll('.cage-number').forEach(text=>{
  text.style.stroke='none';text.style.strokeWidth='0';text.style.paintOrder='normal';
 });
 const box=svg.viewBox.baseVal,scale=Math.min((options.widthMm||190)/box.width,(options.title?257:277)/box.height);
 const width=box.width*scale,height=box.height*scale;
 if(options.title){doc.setFont('helvetica','bold');doc.setFontSize(16);doc.text(options.title,105,18,{align:'center'});}
 const x=(210-width)/2,y=options.title?30+(257-height)/2:(297-height)/2;
 await doc.svg(svg,{x,y,width,height});
 if(options.decorate)options.decorate(doc,{x,y,scale});
 }
 doc.save(filename);
}
