import {puzzleSvg} from './downloadSudokuSvg.mjs';

export async function downloadSudokuPng(board,filename,includeSolution=true){
 const source=new DOMParser().parseFromString(puzzleSvg(board,includeSolution),'image/svg+xml').documentElement;
 const box=source.viewBox.baseVal;
 const width=Math.round(box.width*3),height=Math.round(box.height*3);
 source.setAttribute('width',String(width));source.setAttribute('height',String(height));
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(source)],{type:'image/svg+xml'}));
 try{
  const image=new Image();image.src=url;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0,width,height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('Could not render PNG.');
  const downloadUrl=URL.createObjectURL(blob),link=document.createElement('a');link.href=downloadUrl;link.download=filename;
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);
 }finally{URL.revokeObjectURL(url);}
}
