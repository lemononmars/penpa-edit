// Shared keyboard modifiers and additive/drag selection for the shaped editors.
export function sudokuInteraction(node, options) {
 let chosen=new Set(), dragging=false, replay=false, ctrl=false, shift=false;
 const cells=()=>[...node.querySelectorAll(options.cells)];
 const paint=()=>cells().forEach(c=>c.classList.toggle('multi-selected',chosen.has(c.id)));
 const cell=e=>e.target.closest?.(options.cells);
 function down(e){const c=cell(e);if(!c||e.button!==0)return;if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey)chosen.clear();chosen.add(c.id);dragging=e.pointerType==='mouse';paint();}
 function move(e){if(!dragging)return;const c=document.elementFromPoint(e.clientX,e.clientY)?.closest(options.cells);if(c&&node.contains(c)){chosen.add(c.id);paint();}}
 function up(){dragging=false;}
 function key(e){if(replay||e.target.matches('input,textarea,select'))return;ctrl=e.ctrlKey||e.metaKey;shift=e.shiftKey;
  if(e.key==='F2'||e.key==='F3'){e.preventDefault();options.edit(e.key==='F2'?'set':'solve');return;}
  if(e.key.startsWith('Arrow')&&node.contains(document.activeElement)){chosen.clear();paint();return;}
  const digit=e.code.match(/^(?:Digit|Numpad)([0-9])$/),input=digit?digit[1]:e.key;
  if(!node.contains(document.activeElement)||!(/^[0-9]$/.test(input)||['Delete','Backspace'].includes(input)))return;
  e.preventDefault();e.stopImmediatePropagation();apply(input);
 }
 function apply(key){const targets=chosen.size?[...chosen].map(id=>document.getElementById(id)).filter(Boolean):[document.activeElement];const old=options.mode();options.notes(shift?'corner':ctrl?'center':old);replay=true;for(const c of targets){c.focus();c.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));}replay=false;options.notes(old);paint();}
 function click(e){const button=e.target.closest('button');if(!button||!chosen.size)return;const digit=button.className.match(/digit-([1-9])/),remove=button.getAttribute('aria-label')==='Delete selected cell';if(!digit&&!remove)return;e.preventDefault();e.stopImmediatePropagation();apply(remove?'Delete':digit[1]);}
 function release(e){ctrl=e.ctrlKey||e.metaKey;shift=e.shiftKey;}
 node.addEventListener('pointerdown',down,true);node.addEventListener('click',click,true);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('keydown',key,true);window.addEventListener('keyup',release);
 return {update(next){options=next;},destroy(){node.removeEventListener('pointerdown',down,true);node.removeEventListener('click',click,true);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',release);}};
}
