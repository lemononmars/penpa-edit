export function emptyLayoutSvg(board, includeSolution = false) {
 const clone = board.cloneNode(true);
 const originals = [board, ...board.querySelectorAll('*')];
 const copies = [clone, ...clone.querySelectorAll('*')];
 const properties = ['fill','fill-rule','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','opacity','font-family','font-size','font-weight','text-anchor','dominant-baseline'];
 originals.forEach((element,index)=>{
  const copy=copies[index], computed=getComputedStyle(element);
  copy.removeAttribute('style');
  for(const property of properties)copy.style.setProperty(property,computed.getPropertyValue(property));
  if(element.matches('.cell,.sudoku-cell'))copy.style.fill='#fff';
  for(const attribute of [...copy.attributes])if(attribute.name==='id'||attribute.name==='tabindex'||attribute.name==='role'||attribute.name.startsWith('aria-')||attribute.name.startsWith('on'))copy.removeAttribute(attribute.name);
 });
 clone.querySelectorAll(includeSolution?'text:not(.grid-letter):not(.given-digit):not(.solved-digit)':'text:not(.grid-letter):not(.given-digit)').forEach(element=>element.remove());
 const box=board.viewBox.baseVal;
 clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 clone.setAttribute('width',String(box.width));
 clone.setAttribute('height',String(box.height));
 return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone);
}

export function downloadEmptySvg(board, filename, includeSolution = false) {
 const url=URL.createObjectURL(new Blob([emptyLayoutSvg(board, includeSolution)],{type:'image/svg+xml;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=filename;
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
