<script lang="ts">
 import SudokuAnswerControls from './SudokuAnswerControls.svelte';
 import { CIRCULAR_OUTER_PHASE, normalizeCircularSector, shortestAngularDelta, solveCircularAlignments, generateCircular } from './wsc2026/circularSudoku.mjs';
 export let initialView: 'classic'|'outer' = 'classic';
 type Cell={surface:'core'|'outer';row:number;col:number};
 const C=600, coreInner=52, coreRow=28, coreOuter=304, outerInner=321, outerRow=24, outerRadius=537;
 const empty=(cols:number)=>Array.from({length:9},()=>Array(cols).fill(''));
 let view=initialView, coreDigits=empty(9), outerDigits=empty(54);
 let rotations=[0,0,0,0], selectedRing=0, selected:Cell|null=null;
 let entryMode:'normal'|'center'|'corner'='normal', notes:Record<string,number[]>={}, history:any[]=[];
 let generationClues=32, message='', boardSvg:SVGSVGElement;
 let drag:{id:number;ring:number;last:number;angle:number;start:number;target:SVGPathElement}|null=null;
 let displayAngles=[0,0,0,0], animation=0;
 const id=(surface:string,row:number,col:number)=>`circular-cell-${surface}-${row}-${col}`;
 const polar=(radius:number,angle:number)=>({x:C+radius*Math.cos(angle*Math.PI/180),y:C+radius*Math.sin(angle*Math.PI/180)});
 const column=(surface:string,col:number)=>surface==='core'?col:Math.floor(col/9)*10+col%9;
 const step=(surface:string)=>surface==='core'?40:6;
 const ringOf=(surface:string,row:number)=>surface==='core'?Math.floor(row/3):3;
 const angleOf=(surface:string,row:number,col:number,angles=displayAngles)=>-90+(column(surface,col)+.5)*step(surface)+angles[ringOf(surface,row)]+(surface==='outer'?CIRCULAR_OUTER_PHASE:0);
 function center(surface:string,row:number,col:number,angles=displayAngles){return polar((surface==='core'?coreInner+row*coreRow:outerInner+row*outerRow)+(surface==='core'?coreRow:outerRow)/2,angleOf(surface,row,col,angles));}
 function wedge(inner:number,outer:number,start:number,width:number){const a=polar(outer,start),b=polar(outer,start+width),c=polar(inner,start+width),d=polar(inner,start);return `M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y} Z`;}
 function cellPath(surface:string,row:number,col:number,angles=displayAngles){const inner=surface==='core'?coreInner+row*coreRow:outerInner+row*outerRow;return wedge(inner,inner+(surface==='core'?coreRow:outerRow),angleOf(surface,row,col,angles)-step(surface)/2,step(surface));}
 function remember(){history=[...history,{coreDigits:coreDigits.map(r=>r.slice()),outerDigits:outerDigits.map(r=>r.slice()),rotations:rotations.slice(),notes:structuredClone(notes)}];}
 function undo(){const previous=history.at(-1);if(!previous)return;cancelAnimationFrame(animation);({coreDigits,outerDigits,rotations,notes}=previous);displayAngles=rotations.map((r,i)=>r*(i===3?60:40));history=history.slice(0,-1);}
 function select(surface:'core'|'outer',row:number,col:number){selected={surface,row,col};selectedRing=ringOf(surface,row);}
 function enter(digit:number){if(!selected)return;remember();const {surface,row,col}=selected,key=id(surface,row,col);if(digit&&entryMode!=='normal'){const noteKey=key+':'+entryMode,list=notes[noteKey]||[];notes={...notes,[noteKey]:list.includes(digit)?list.filter(n=>n!==digit):[...list,digit].sort()};return;}notes={...notes,[key+':center']:[],[key+':corner']:[]};if(surface==='core'){coreDigits[row][col]=digit?String(digit):'';coreDigits=coreDigits.map(r=>r.slice());}else{outerDigits[row][col]=digit?String(digit):'';outerDigits=outerDigits.map(r=>r.slice());}}
 function clearBoard(){remember();cancelAnimationFrame(animation);coreDigits=empty(9);outerDigits=empty(54);rotations=[0,0,0,0];displayAngles=[0,0,0,0];notes={};selected=null;selectedRing=0;message='Board cleared.';}
 function addExample(){clearBoard();view='classic';coreDigits=[['','4','','','','','3','8','2'],['','','','','','','','9','5'],['','','5','','2','','','6',''],...Array.from({length:6},()=>Array(9).fill(''))];}
 function applyValues(values:number[]){coreDigits=Array.from({length:9},(_,r)=>values.slice(r*9,r*9+9).map(v=>v?String(v):''));if(view==='outer')outerDigits=Array.from({length:9},(_,r)=>values.slice(81+r*54,81+(r+1)*54).map(v=>v?String(v):''));notes={};}
 function solve(){const values=[...coreDigits.flat(),...(view==='outer'?outerDigits.flat():[])].map(Number);const result=solveCircularAlignments(values,rotations.slice(0,3),view==='outer',rotations[3]*9);if(result.solution){remember();applyValues(result.solution);alignRings(result.rotations);message='Solved after checking relative ring alignments.';}else message=result.status==='invalid'?'Conflicting digits or spoke matches.':'No completion found across the 81 ring alignments.';}
 function generate(){const result=generateCircular(rotations.slice(0,3),view==='outer',rotations[3]*9,Math.max(20,Math.min(80,Number(generationClues)||32)));if(result.puzzle){remember();applyValues(result.puzzle);alignRings([rotations[0],normalizeCircularSector(rotations[1]+1+Math.floor(Math.random()*8)),normalizeCircularSector(rotations[2]+1+Math.floor(Math.random()*8))]);message=`Generated a uniquely solvable puzzle across all 81 alignments with ${result.clues} clues. Rings 2 and 3 scrambled.`;}else message='Generation failed at this alignment.';}
 function alignRings(next:number[]){cancelAnimationFrame(animation);const start=displayAngles.slice(),target=start.map((angle,i)=>i<3?angle+shortestAngularDelta(angle,next[i]*40):angle),started=performance.now();rotations=[...next,rotations[3]];function frame(now:number){const t=Math.min(1,(now-started)/450),ease=1-(1-t)**3;displayAngles=start.map((angle,i)=>angle+(target[i]-angle)*ease);if(t<1)animation=requestAnimationFrame(frame);}animation=requestAnimationFrame(frame);}
 function animateSnap(ring:number,target:number){cancelAnimationFrame(animation);const start=displayAngles[ring],started=performance.now();function frame(now:number){const t=Math.min(1,(now-started)/160);displayAngles[ring]=start+(target-start)*(1-(1-t)**3);displayAngles=displayAngles.slice();if(t<1)animation=requestAnimationFrame(frame);}animation=requestAnimationFrame(frame);}
 function rotateSelected(direction:number){remember();const size=selectedRing===3?6:9, degrees=selectedRing===3?60:40;rotations[selectedRing]=normalizeCircularSector(rotations[selectedRing]+direction,size);rotations=rotations.slice();animateSnap(selectedRing,displayAngles[selectedRing]+direction*degrees);}
 function pointerAngle(event:PointerEvent){const point=boardSvg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const local=point.matrixTransform(boardSvg.getScreenCTM()?.inverse());return Math.atan2(local.y-C,local.x-C)*180/Math.PI;}
 function beginSpin(event:PointerEvent,surface:string,row:number){if(event.button!==2)return;event.preventDefault();remember();cancelAnimationFrame(animation);const ring=ringOf(surface,row),target=event.currentTarget as SVGPathElement;target.setPointerCapture(event.pointerId);selectedRing=ring;drag={id:event.pointerId,ring,last:pointerAngle(event),angle:displayAngles[ring],start:displayAngles[ring],target};}
 function moveSpin(event:PointerEvent){if(!drag||event.pointerId!==drag.id)return;event.preventDefault();const angle=pointerAngle(event);drag.angle+=shortestAngularDelta(drag.last,angle);drag.last=angle;displayAngles[drag.ring]=drag.angle;displayAngles=displayAngles.slice();}
 function endSpin(event:PointerEvent){if(!drag||drag.id!==event.pointerId)return;moveSpin(event);const {ring,angle,target}=drag,degrees=ring===3?60:40;const snapped=Math.round(angle/degrees)*degrees;rotations[ring]=normalizeCircularSector(snapped/degrees,ring===3?6:9);rotations=rotations.slice();drag=null;if(target.hasPointerCapture(event.pointerId))target.releasePointerCapture(event.pointerId);animateSnap(ring,snapped);}
 function keydown(event:KeyboardEvent,surface:'core'|'outer',row:number,col:number){select(surface,row,col);if(/^[1-9]$/.test(event.key)){event.preventDefault();enter(Number(event.key));}else if(['Backspace','Delete','0'].includes(event.key)){event.preventDefault();enter(0);}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo();}else if(['z','x','c'].includes(event.key.toLowerCase())){entryMode=event.key.toLowerCase()==='z'?'normal':event.key.toLowerCase()==='x'?'center':'corner';}else if(event.key.startsWith('Arrow')){event.preventDefault();if(event.shiftKey&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){rotateSelected(event.key==='ArrowLeft'?-1:1);return;}row=normalizeCircularSector(row+(event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0));col=normalizeCircularSector(col+(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0),surface==='core'?9:54);select(surface,row,col);document.getElementById(id(surface,row,col))?.focus();}}
</script>
<section class="circular-tool" aria-labelledby="circular-title">
 <header><p class="eyebrow">ROUND 15 · CHAKRAVYUHA</p><h2 id="circular-title">Shifted Sudoku editor &amp; solver</h2><p>Right-click and drag to spin a ring. Digits move with it, then snap to the grid on release.</p>
 <div class="view-switch" role="group" aria-label="Shifted Sudoku layout"><button class:active={view==='classic'} aria-pressed={view==='classic'} onclick={()=>{view='classic';selected=null;selectedRing=0;}}>Classic · 3 rings</button><button class:active={view==='outer'} aria-pressed={view==='outer'} onclick={()=>{view='outer';selected=null;selectedRing=0;}}>Add outer ring · 6 grids</button></div></header>
 <div class="practice-layout">
  <div class="board-column"><p class="selected-label">{selected?`${selected.surface==='core'?'Core':'Grid '+String.fromCharCode(65+Math.floor(selected.col/9))} · row ${selected.row+1} · cell ${selected.col%9+1}`:'Select a cell and enter a digit.'}</p>
   <svg bind:this={boardSvg} viewBox={view==='classic'?'288 288 624 624':'0 0 1200 1200'} role="group" aria-label="Shifted Sudoku board" onpointermove={moveSpin} onpointerup={endSpin} onpointercancel={endSpin} oncontextmenu={event=>event.preventDefault()}>
    {#each (view==='outer'?['core','outer']:['core']) as surface}
     {#each Array.from({length:9},(_,r)=>r) as row}
      {#each Array.from({length:surface==='core'?9:54},(_,c)=>c) as col}
       {@const point=center(surface,row,col,displayAngles)}{@const digit=surface==='core'?coreDigits[row][col]:outerDigits[row][col]}{@const key=id(surface,row,col)}
       <path id={key} d={cellPath(surface,row,col,displayAngles)} class="sudoku-cell" class:outer-cell={surface==='outer'} class:chosen={selected?.surface===surface&&selected?.row===row&&selected?.col===col} role="button" aria-label={`${surface==='core'?'Core':'Grid '+String.fromCharCode(65+Math.floor(col/9))}, row ${row+1}, cell ${col%9+1}${digit?', digit '+digit:', empty'}`} aria-pressed={selected?.surface===surface&&selected?.row===row&&selected?.col===col} tabindex={selected?.surface===surface&&selected.row===row&&selected.col===col||!selected&&row===0&&col===0?0:-1} onclick={()=>select(surface as 'core'|'outer',row,col)} onfocus={()=>select(surface as 'core'|'outer',row,col)} onkeydown={event=>keydown(event,surface as 'core'|'outer',row,col)} onpointerdown={event=>beginSpin(event,surface,row)}/>
       <g transform={`rotate(${angleOf(surface,row,col,displayAngles)+270} ${point.x} ${point.y})`}>
        {#if digit}<text x={point.x} y={point.y} class="digit">{digit}</text>
        {:else}{#if notes[key+':center']?.length}<text x={point.x} y={point.y} class="digit note">{notes[key+':center'].join('')}</text>{/if}
        {#if notes[key+':corner']?.length}<text x={point.x} y={point.y-7} class="digit note">{notes[key+':corner'].join('')}</text>{/if}{/if}
       </g>
      {/each}
     {/each}
    {/each}
    {#if view==='outer'}{#each Array.from({length:6},(_,g)=>g) as grid}<path d={wedge(outerInner,outerRadius,-90+(grid*10+9)*6+displayAngles[3]+CIRCULAR_OUTER_PHASE,6)} class="separator"/>{/each}{/if}
    {#each Array.from({length:10},(_,b)=>b) as boundary}
     <circle cx={C} cy={C} r={coreInner+boundary*coreRow} class="grid-circle" class:box-circle={boundary%3===0}/>
     {#if view==='outer'}<circle cx={C} cy={C} r={outerInner+boundary*outerRow} class="grid-circle" class:box-circle={boundary%3===0}/>{/if}
    {/each}
    {#each Array.from({length:3},(_,r)=>r) as ring}{#each Array.from({length:9},(_,b)=>b) as boundary}
     {@const angle=-90+boundary*40+displayAngles[ring]}{@const start=polar(coreInner+ring*3*coreRow,angle)}{@const end=polar(coreInner+(ring+1)*3*coreRow,angle)}
     <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line core-column" class:box-line={boundary%3===0}/>
    {/each}{/each}
    {#if view==='outer'}
     {#each Array.from({length:60},(_,b)=>b) as boundary}{@const angle=-90+boundary*6+displayAngles[3]+CIRCULAR_OUTER_PHASE}{@const start=polar(outerInner,angle)}{@const end=polar(outerRadius,angle)}<line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line outer-spoke" class:box-line={boundary%10%3===0}/>{/each}
     {#each Array.from({length:6},(_,g)=>g) as grid}
      {#each [grid*10+.5,grid*10+8.5] as boundary}{@const angle=-90+boundary*6+displayAngles[3]+CIRCULAR_OUTER_PHASE}{@const start=polar(coreOuter,angle)}{@const end=polar(outerInner+outerRow,angle)}<line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="connector-spoke"/>
       {@const thirdAngle=-90+boundary*6+displayAngles[2]+CIRCULAR_OUTER_PHASE}
       {@const innerMark=polar(coreOuter-coreRow/2,thirdAngle)}{@const thirdEnd=polar(coreOuter,thirdAngle)}
       <line x1={innerMark.x} y1={innerMark.y} x2={thirdEnd.x} y2={thirdEnd.y} class="connector-spoke third-ring-spoke"/>
      {/each}
      {@const label=polar(outerRadius+20,-90+(grid*10+4.5)*6+displayAngles[3]+CIRCULAR_OUTER_PHASE)}<text x={label.x} y={label.y} class="grid-letter" transform={`rotate(${(grid*10+4.5)*6+displayAngles[3]+CIRCULAR_OUTER_PHASE} ${label.x} ${label.y})`}>{String.fromCharCode(65+grid)}</text>
     {/each}
    {/if}
    <circle cx={C} cy={C} r={coreInner} class="hub"/>
   </svg>
   <div class="ring-picker" role="group" aria-label="Choose a ring to spin">{#each [0,1,2] as ring}<button class:active={selectedRing===ring} aria-pressed={selectedRing===ring} onclick={()=>{selectedRing=ring;selected=null;}}>Ring {ring+1} <small>rows {ring*3+1}–{ring*3+3}</small></button>{/each}{#if view==='outer'}<button class:active={selectedRing===3} aria-pressed={selectedRing===3} onclick={()=>{selectedRing=3;selected=null;}}>Outer ring <small>grids A–F</small></button>{/if}</div>
   <div class="rotation-controls"><strong>{selectedRing===3?'Outer ring':'Ring '+(selectedRing+1)}</strong><button aria-label={selectedRing===3?'Rotate selected ring counterclockwise one orientation':'Rotate selected ring counterclockwise one cell'} onclick={()=>rotateSelected(-1)}>↶ {selectedRing===3?'60°':'One cell'}</button><button aria-label={selectedRing===3?'Rotate selected ring clockwise one orientation':'Rotate selected ring clockwise one cell'} onclick={()=>rotateSelected(1)}>{selectedRing===3?'60°':'One cell'} ↷</button></div>
   <p class="status" aria-live="polite">{message}</p>
  </div>
  <SudokuAnswerControls mode={entryMode} canUndo={history.length>0} onDigit={enter} onMode={next=>entryMode=next} onDelete={()=>enter(0)} onUndo={undo}>
   <button class="primary" onclick={solve}>Solve</button><button onclick={clearBoard}>Clear board</button><button onclick={addExample}>Add example</button>
   <label>Clues per grid<input type="number" min="20" max="80" bind:value={generationClues}/></label><button onclick={generate}>Generate unique puzzle</button>
   <a href={`/wsc2026/WSC2026IB.pdf#page=${view==='classic'?60:64}`} target="_blank" rel="noreferrer">Booklet rules &amp; example ↗</a>
  </SudokuAnswerControls>
 </div>
</section>
<style>
 .circular-tool{margin:24px 0;padding:24px;background:white;border:1px solid #dce1d6;border-radius:10px;color:#20382e}h2{font-size:22px;margin:0 0 8px}header>p:not(.eyebrow){color:#697467;line-height:1.5}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869}.practice-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:32px;align-items:start;margin-top:20px}.board-column{min-width:0;max-width:760px;width:100%;margin:auto}svg{display:block;width:100%;height:auto;touch-action:none}.selected-label,.status{font-size:13px;color:#697467;line-height:1.5;text-align:center}.sudoku-cell{fill:white;stroke:none;cursor:crosshair;touch-action:none}.sudoku-cell.chosen{fill:#d8e9c9}.sudoku-cell:focus{outline:none}.separator{fill:#c8cbc9;pointer-events:none}.grid-circle{fill:none;stroke:#252b27;stroke-width:1;pointer-events:none}.box-circle{stroke-width:3.5}.grid-line{stroke:#57605a;stroke-width:1;pointer-events:none}.box-line{stroke:#252b27;stroke-width:3.5}.connector-spoke{stroke:#999f9b;stroke-width:4;pointer-events:none}.digit,.grid-letter{font:500 12px Inter,Arial,sans-serif;text-anchor:middle;dominant-baseline:central;fill:#142519;pointer-events:none}.digit.note{font-size:7px}.hub{fill:#676767;stroke:#252b27;stroke-width:2;pointer-events:none}.view-switch,.ring-picker,.rotation-controls{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:12px 0}button{font:inherit}.view-switch button,.ring-picker button,.rotation-controls button{border:1px solid #c5cec4;background:#f8faf6;color:#244d3b;padding:8px 11px;border-radius:6px;cursor:pointer}.active{background:#244d3b!important;color:white!important}.ring-picker small{display:block;font-size:10px;margin-top:2px}@media(max-width:760px){.circular-tool{padding:16px}.practice-layout{grid-template-columns:1fr;gap:20px}}
</style>
