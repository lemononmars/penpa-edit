<script lang="ts">
 import { PENTAGRAM_CELL_COUNT, PENTAGRAM_UNITS, PENTAGRAM_CELL_UNITS, pentagramGeometry, pentagramPosition, pentagramConflicts } from './wsc2026/pentagram.mjs';
 let values = Array(PENTAGRAM_CELL_COUNT).fill(0), selected = 0, omitted = 9;
 $: conflicts = pentagramConflicts(values, Number(omitted));
 $: related = new Set(PENTAGRAM_CELL_UNITS[selected].flatMap((id) => PENTAGRAM_UNITS[id]));
 $: digits = Array.from({length:9}, (_, i) => i + 1).filter((digit) => digit !== Number(omitted));
 $: complete = values.every(Boolean) && conflicts.size === 0;
 const geometries = Array.from({length:80}, (_, i) => pentagramGeometry(i));
 const line = (point:number, u1:number, v1:number, u2:number, v2:number) => {
  const a = pentagramPosition(point,u1,v1), b = pentagramPosition(point,u2,v2);
  return `M${a.x},${a.y} L${b.x},${b.y}`;
 };
 function enter(value:number) { values[selected] = value; values = values.slice(); }
 function keydown(event:KeyboardEvent,index:number) {
  if (/^[1-9]$/.test(event.key)) { event.preventDefault(); selected=index; enter(Number(event.key)); }
  else if (['Backspace','Delete','0'].includes(event.key)) { event.preventDefault(); selected=index; enter(0); }
  else if (event.key.startsWith('Arrow')) {
   event.preventDefault();
   const direction = event.key === 'ArrowLeft' ? [-1,0] : event.key === 'ArrowRight' ? [1,0] : event.key === 'ArrowUp' ? [0,-1] : [0,1];
   const origin = geometries[index].center;
   const candidates = geometries.map((g,i) => ({i,dx:g.center.x-origin.x,dy:g.center.y-origin.y})).filter((g) => g.dx*direction[0]+g.dy*direction[1]>1);
   candidates.sort((a,b) => {
    const score = (g:{dx:number,dy:number}) => Math.hypot(g.dx,g.dy) + 3*Math.abs(g.dx*direction[1]-g.dy*direction[0]);
    return score(a)-score(b);
   });
   if (candidates.length) { selected=candidates[0].i; document.getElementById(`pentagram-${selected}`)?.focus(); }
  }
 }
</script>

<section class="pentagram-tool" aria-labelledby="pentagram-title">
 <header><div><p class="eyebrow">ROUND 9 · PAGE 29</p><h2 id="pentagram-title">Pentagram Sudoku editor</h2><p>Enter the same eight digits in every row, column, and bold region. Each row or column runs across two adjacent star points.</p></div><button onclick={()=>{values=Array(80).fill(0);selected=0;}}>Clear board</button></header>
 <label class="omit">Omitted digit <select bind:value={omitted}>{#each Array.from({length:9},(_,i)=>i+1) as digit}<option value={digit}>{digit}</option>{/each}</select></label>
 <svg viewBox="0 0 600 570" role="group" aria-label="80-cell Pentagram Sudoku board">
  {#each geometries as geometry,index}
   <path id={`pentagram-${index}`} d={geometry.path} class="cell" class:related={related.has(index)} class:selected={selected===index} class:conflict={conflicts.has(index)} role="button" tabindex={selected===index?0:-1} aria-pressed={selected===index} aria-label={`Star point ${geometry.point+1}, cell ${geometry.u+1}, ${geometry.v+1}${values[index]?`, digit ${values[index]}`:', empty'}`} onclick={(event)=>{selected=index;event.currentTarget.focus();}} onfocus={()=>selected=index} onkeydown={(event)=>keydown(event,index)}/>
   {#if values[index]}<text x={geometry.center.x} y={geometry.center.y} class="digit">{values[index]}</text>{/if}
  {/each}
  {#each Array.from({length:5},(_,i)=>i) as point}
   <path d={`${line(point,0,0,1,0)} ${line(point,1,0,1,1)} ${line(point,1,1,0,1)} ${line(point,0,1,0,0)} ${line(point,.5,0,.5,1)}`} class="bold"/>
  {/each}
 </svg>
 <div class="pad" aria-label="Digit entry">{#each digits as digit}<button class:active={values[selected]===digit} onclick={()=>enter(digit)}>{digit}</button>{/each}<button onclick={()=>enter(0)} aria-label="Clear selected cell">⌫</button></div>
 <p class="status" aria-live="polite">{complete?'Complete':conflicts.size?'Check the highlighted conflicts.':'Select a cell and enter a digit.'}</p>
 <p class="reference">80 cells · 20 rows/columns · 10 regions · <a href="/wsc2026/WSC2026IB.pdf#page=29" target="_blank" rel="noreferrer">Booklet geometry and round rules ↗</a></p>
</section>

<style>
 .pentagram-tool{margin:24px 0;padding:24px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}header{display:flex;justify-content:space-between;gap:20px}h2{margin:0 0 8px}header p:not(.eyebrow){max-width:650px;color:#697467;line-height:1.5}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869;margin:0 0 6px}button,select{border:1px solid #c5cec4;background:#f8faf6;color:#244d3b;padding:8px 11px;border-radius:6px;cursor:pointer}.omit{display:flex;gap:8px;align-items:center;margin:12px 0}svg{display:block;width:100%;max-width:650px;height:auto;margin:auto}.cell{fill:white;stroke:#333;stroke-width:.8;cursor:pointer}.cell.related{fill:#e7f1ed}.cell.selected{fill:#ffe29a}.cell.conflict{fill:#f5b8ad}.cell:focus{outline:none}.digit{text-anchor:middle;dominant-baseline:central;font:500 22px Arial,sans-serif;fill:#1f3027;pointer-events:none}.bold{fill:none;stroke:#202020;stroke-width:4;stroke-linejoin:round;pointer-events:none}.pad{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:12px auto}.pad button{width:40px;height:40px;padding:0;font-size:17px}.pad button.active{background:#244d3b;color:white}.status,.reference{text-align:center;font-size:13px;color:#697467}.reference a{color:#315e43}@media(max-width:740px){.pentagram-tool{padding:16px}header{display:block}header button{margin-top:8px}}
</style>
