<script lang="ts">
 import {onMount,onDestroy} from 'svelte';
 import {loadToolState,saveToolState,downloadToolBackup,readToolBackup} from './wsc2026/toolState.mjs';
 import {createToolSearch} from './wsc2026/toolSearch.mjs';
 let ready=false,saveAvailable=true,searchBusy=false;
 const search=createToolSearch(busy=>searchBusy=busy);
 function cancelSearch(){search.cancel();message='Search cancelled; board kept.';}
 async function runSearch(action:string,payload:any={}){message=action==='generate'?'Generating unique puzzle…':action==='random'?'Finding a random solution…':'Solving…';try{return await search.run('shifted',action,payload);}catch(error){message=error instanceof Error?error.message:'Search failed.';return null;}}
 onDestroy(()=>{search.cancel();cancelAnimationFrame(animation);});

 let editMode: 'set'|'solve' = 'set';
 import SudokuPuzzleControls from './SudokuPuzzleControls.svelte';
 import ShiftedPrintOptions from './ShiftedPrintOptions.svelte';
 let printMode='actual';
 import {downloadShiftedPdf} from './wsc2026/downloadShiftedPdf.mjs';
 let downloadingPages=false;
 async function downloadPages(){downloadingPages=true;try{const count=await downloadShiftedPdf(boardSvg,displayAngles[3],SHIFTED_OUTER_PHASE,view==='outer',printMode);message=`Downloaded ${count} A4 pages at actual size.`;}catch(error){message='Could not create PDF. Please try again.';console.error(error);}finally{downloadingPages=false;}}
 import { SHIFTED_OUTER_PHASE, normalizeSector, shortestAngularDelta } from './wsc2026/shiftedSudoku.mjs';
 export let initialView: 'classic'|'outer' = 'classic';
 type Cell={surface:'core'|'outer';row:number;col:number};
 // Twenty SVG units represent one centimetre.
 const C=600, unitsPerCm=20, coreInner=20, coreRow=20, coreOuter=200, outerInner=220, outerRow=20, outerRadius=400;
 const empty=(cols:number)=>Array.from({length:9},()=>Array(cols).fill(''));
 let arrows: Record<string,{dx:number;dy:number}[]> = {};
 let givens: Record<string,boolean> = {};
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
 const angleOf=(surface:string,row:number,col:number,angles=displayAngles)=>-90+(column(surface,col)+.5)*step(surface)+angles[ringOf(surface,row)]+(surface==='outer'?SHIFTED_OUTER_PHASE:0);
 function center(surface:string,row:number,col:number,angles=displayAngles){return polar((surface==='core'?coreInner+row*coreRow:outerInner+row*outerRow)+(surface==='core'?coreRow:outerRow)/2,angleOf(surface,row,col,angles));}
 function wedge(inner:number,outer:number,start:number,width:number){const a=polar(outer,start),b=polar(outer,start+width),c=polar(inner,start+width),d=polar(inner,start);return `M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y} Z`;}
 function cellPath(surface:string,row:number,col:number,angles=displayAngles){const inner=surface==='core'?coreInner+row*coreRow:outerInner+row*outerRow;return wedge(inner,inner+(surface==='core'?coreRow:outerRow),angleOf(surface,row,col,angles)-step(surface)/2,step(surface));}
 function remember(){if(searchBusy)cancelSearch();history=[...history,{arrows:structuredClone(arrows),givens:{...givens},coreDigits:coreDigits.map(r=>r.slice()),outerDigits:outerDigits.map(r=>r.slice()),rotations:rotations.slice(),notes:structuredClone(notes)}];}
 function undo(){if(searchBusy)cancelSearch();const previous=history.at(-1);if(!previous)return;cancelAnimationFrame(animation);({arrows,givens,coreDigits,outerDigits,rotations,notes}=previous);displayAngles=rotations.map((r,i)=>r*(i===3?20:40));history=history.slice(0,-1);}
 function select(surface:'core'|'outer',row:number,col:number){selected={surface,row,col};selectedRing=ringOf(surface,row);}
 function enter(digit:number){if(!selected)return;if(editMode==='solve'&&givens[id(selected.surface,selected.row,selected.col)])return;remember();const {surface,row,col}=selected,key=id(surface,row,col);if(digit&&entryMode!=='normal'){const noteKey=key+':'+entryMode,list=notes[noteKey]||[];notes={...notes,[noteKey]:list.includes(digit)?list.filter(n=>n!==digit):[...list,digit].sort()};return;}givens={...givens,[key]:!!digit&&editMode==='set'};notes={...notes,[key+':center']:[],[key+':corner']:[]};if(surface==='core'){coreDigits[row][col]=digit?String(digit):'';coreDigits=coreDigits.map(r=>r.slice());}else{outerDigits[row][col]=digit?String(digit):'';outerDigits=outerDigits.map(r=>r.slice());}}
 function addArrow(dx:number,dy:number){if(!selected||editMode!=='set')return;remember();const key=id(selected.surface,selected.row,selected.col),previous=arrows[key]||[],existing=previous.some(arrow=>arrow.dx===dx&&arrow.dy===dy);const next=existing?previous.filter(arrow=>arrow.dx!==dx||arrow.dy!==dy):[...previous.filter(arrow=>!(dx&&dy&&arrow.dx&&arrow.dy)),{dx,dy}];arrows={...arrows,[key]:next};}
 function removeArrow(){if(!selected||editMode!=='set')return;const key=id(selected.surface,selected.row,selected.col);if(!arrows[key])return;remember();const next={...arrows};delete next[key];arrows=next;}
 function arrowPath(dx:number,dy:number,radius:number,width:number){const diagonal=!!dx&&!!dy,halfWidth=radius*Math.sin(width*Math.PI/360),offsetX=diagonal?0:dy*Math.max(0,halfWidth-3),offsetY=diagonal?0:-dx*7,length=diagonal?9:8,norm=Math.hypot(dx,dy),ux=dx/norm,uy=dy/norm,x1=offsetX-ux*length/2,y1=offsetY-uy*length/2,x2=offsetX+ux*length/2,y2=offsetY+uy*length/2;return `M${x1},${y1} L${x2},${y2} M${x2-ux*2.5-uy*1.8},${y2-uy*2.5+ux*1.8} L${x2},${y2} L${x2-ux*2.5+uy*1.8},${y2-uy*2.5-ux*1.8}`;}
 function clearSolution(){remember();coreDigits=coreDigits.map((row,r)=>row.map((digit,c)=>givens[id('core',r,c)]?digit:''));outerDigits=outerDigits.map((row,r)=>row.map((digit,c)=>givens[id('outer',r,c)]?digit:''));message='Solution cleared; givens kept.';}
 function clearBoard(){remember();cancelAnimationFrame(animation);coreDigits=empty(9);outerDigits=empty(54);rotations=[0,0,0,0];displayAngles=[0,0,0,0];notes={};givens={};arrows={};selected=null;selectedRing=0;message='Board cleared.';}
 function addExample(){clearBoard();view='classic';coreDigits=[['','4','','','','','3','8','2'],['','','','','','','','9','5'],['','','5','','2','','','6',''],...Array.from({length:6},()=>Array(9).fill(''))];givens=Object.fromEntries(coreDigits.flatMap((row,r)=>row.map((digit,c)=>[id('core',r,c),!!digit])));}
 function applyValues(values:number[],asGivens=false){coreDigits=Array.from({length:9},(_,r)=>values.slice(r*9,r*9+9).map(v=>v?String(v):''));if(view==='outer'&&values.length>81)outerDigits=Array.from({length:9},(_,r)=>values.slice(81+r*54,81+(r+1)*54).map(v=>v?String(v):''));notes=values.length>81?{}:Object.fromEntries(Object.entries(notes).filter(([key])=>key.startsWith('circular-cell-outer-')));if(asGivens){givens=values.length>81?{}:{...givens};for(let r=0;r<9;r++){for(let c=0;c<9;c++)givens[id('core',r,c)]=!!coreDigits[r][c];if(view==='outer'&&values.length>81)for(let c=0;c<54;c++)givens[id('outer',r,c)]=!!outerDigits[r][c];}}editMode='solve';}
 async function solve(){const values=[...coreDigits.flat(),...(view==='outer'?outerDigits.flat():[])].map(Number);const result=await runSearch('solve',{values,rotations:rotations.slice(0,3),includeOuter:view==='outer',outerRotation:rotations[3]*3});if(!result)return;if(result.solution){remember();applyValues(result.solution);alignRings(result.rotations);message='Solved after checking relative ring alignments.';}else message=result.status==='invalid'?'Conflicting digits or spoke matches.':result.status==='limit'?'Search limit reached. Add more digits and try again.':'No completion found across the 81 ring alignments.';}
 async function generate(){const result=await runSearch('generate',{rotations:rotations.slice(0,3),clues:Math.max(20,Math.min(80,Number(generationClues)||32))});if(!result)return;if(result.puzzle){remember();applyValues(result.puzzle,true);alignRings([result.rotations[0],(result.rotations[1]+1+Math.floor(Math.random()*8))%9,(result.rotations[2]+1+Math.floor(Math.random()*8))%9]);message=`Generated a uniquely solvable puzzle across all 81 alignments with ${result.clues} clues. Rings 2 and 3 scrambled.`;}else message='Generation failed at this alignment.';}
 function alignRings(next:number[]){cancelAnimationFrame(animation);const start=displayAngles.slice(),target=start.map((angle,i)=>i<3?angle+shortestAngularDelta(angle,next[i]*40):angle),started=performance.now();rotations=[...next,rotations[3]];function frame(now:number){const t=Math.min(1,(now-started)/450),ease=1-(1-t)**3;displayAngles=start.map((angle,i)=>angle+(target[i]-angle)*ease);if(t<1)animation=requestAnimationFrame(frame);}animation=requestAnimationFrame(frame);}
 function animateSnap(ring:number,target:number){cancelAnimationFrame(animation);const start=displayAngles[ring],started=performance.now();function frame(now:number){const t=Math.min(1,(now-started)/160);displayAngles[ring]=start+(target-start)*(1-(1-t)**3);displayAngles=displayAngles.slice();if(t<1)animation=requestAnimationFrame(frame);}animation=requestAnimationFrame(frame);}
 function rotateSelected(direction:number){remember();const size=selectedRing===3?18:9, degrees=selectedRing===3?20:40;rotations[selectedRing]=((rotations[selectedRing]+direction)%size+size)%size;rotations=rotations.slice();animateSnap(selectedRing,displayAngles[selectedRing]+direction*degrees);}
 function pointerAngle(event:PointerEvent){const point=boardSvg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const local=point.matrixTransform(boardSvg.getScreenCTM()?.inverse());return Math.atan2(local.y-C,local.x-C)*180/Math.PI;}
 function beginSpin(event:PointerEvent,surface:string,row:number){if(event.button!==2)return;event.preventDefault();remember();cancelAnimationFrame(animation);const ring=ringOf(surface,row),target=event.currentTarget as SVGPathElement;target.setPointerCapture(event.pointerId);selectedRing=ring;drag={id:event.pointerId,ring,last:pointerAngle(event),angle:displayAngles[ring],start:displayAngles[ring],target};}
 function moveSpin(event:PointerEvent){if(!drag||event.pointerId!==drag.id)return;event.preventDefault();const angle=pointerAngle(event);drag.angle+=shortestAngularDelta(drag.last,angle);drag.last=angle;displayAngles[drag.ring]=drag.angle;displayAngles=displayAngles.slice();}
 function endSpin(event:PointerEvent){if(!drag||drag.id!==event.pointerId)return;moveSpin(event);const {ring,angle,target}=drag,degrees=ring===3?20:40;const snapped=Math.round(angle/degrees)*degrees;rotations[ring]=((snapped/(ring===3?20:40)%(ring===3?18:9))+(ring===3?18:9))%(ring===3?18:9);rotations=rotations.slice();drag=null;if(target.hasPointerCapture(event.pointerId))target.releasePointerCapture(event.pointerId);animateSnap(ring,snapped);}
 function keydown(event:KeyboardEvent,surface:'core'|'outer',row:number,col:number){select(surface,row,col);if(/^[1-9]$/.test(event.key)){event.preventDefault();enter(Number(event.key));}else if(['Backspace','Delete','0'].includes(event.key)){event.preventDefault();enter(0);}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo();}else if(['z','x','c'].includes(event.key.toLowerCase())){entryMode=event.key.toLowerCase()==='z'?'normal':event.key.toLowerCase()==='x'?'center':'corner';}else if(event.key.startsWith('Arrow')){event.preventDefault();if(event.shiftKey&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){rotateSelected(event.key==='ArrowLeft'?-1:1);return;}row=normalizeSector(row+(event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0));col=normalizeSector(col+(event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0),surface==='core'?9:54);select(surface,row,col);document.getElementById(id(surface,row,col))?.focus();}}

 $: savedState={coreDigits,outerDigits,rotations,view,givens,arrows,notes,selected,selectedRing,editMode,generationClues,printMode,mode:entryMode};
 $: if(ready)saveAvailable=saveToolState('shifted',savedState);
 function restoreState(state:any){({coreDigits,outerDigits,rotations,view,givens,arrows,notes,selected,selectedRing,editMode,generationClues}=state);entryMode=state.mode;printMode=state.printMode==='fit'?'fit':'actual';cancelAnimationFrame(animation);displayAngles=rotations.map((r,i)=>r*(i===3?20:40));}
 onMount(()=>{const saved=loadToolState('shifted');if(saved){restoreState(saved);message='Saved board restored.';}ready=true;});
 function exportBackup(){downloadToolBackup('shifted',savedState);}
 async function importBackup(file:File){try{const state=await readToolBackup(file,'shifted');remember();restoreState(state);message='Backup restored.';}catch(error){message=error instanceof Error?error.message:'Could not import backup.';throw error;}}
</script>
<section class="circular-tool" aria-labelledby="circular-title">
 <header><p class="eyebrow">ROUND 15 · CHAKRAVYUHA</p><h2 id="circular-title">Shifted Sudoku editor &amp; solver</h2><p>Right-click and drag to spin a ring. Digits move with it, then snap to the grid on release.</p>
 <div class="view-switch" role="group" aria-label="Shifted Sudoku layout"><button class:active={view==='classic'} aria-pressed={view==='classic'} onclick={()=>{if(searchBusy)cancelSearch();view='classic';selected=null;selectedRing=0;}}>Classic · 3 rings</button><button class:active={view==='outer'} aria-pressed={view==='outer'} onclick={()=>{if(searchBusy)cancelSearch();view='outer';selected=null;selectedRing=0;}}>Add outer ring · 6 grids</button></div></header>
 <div class="practice-layout">
  <div class="board-column"><p class="selected-label">{selected?`${selected.surface==='core'?'Core':'Grid '+String.fromCharCode(65+Math.floor(selected.col/9))} · row ${selected.row+1} · cell ${selected.col%9+1}`:'Select a cell and enter a digit.'}</p>
   <svg bind:this={boardSvg} data-units-per-cm={unitsPerCm} viewBox={view==='classic'?'392 392 416 416':'180 180 840 840'} role="group" aria-label="Shifted Sudoku board" onpointermove={moveSpin} onpointerup={endSpin} onpointercancel={endSpin} oncontextmenu={event=>event.preventDefault()}>
    {#each (view==='outer'?['core','outer']:['core']) as surface}
     {#each Array.from({length:9},(_,r)=>r) as row}
      {#each Array.from({length:surface==='core'?9:54},(_,c)=>c) as col}
       {@const point=center(surface,row,col,displayAngles)}{@const digit=surface==='core'?coreDigits[row][col]:outerDigits[row][col]}{@const key=id(surface,row,col)}
       <path id={key} d={cellPath(surface,row,col,displayAngles)} class="sudoku-cell" class:outer-cell={surface==='outer'} class:chosen={selected?.surface===surface&&selected?.row===row&&selected?.col===col} role="button" aria-label={`${surface==='core'?'Core':'Grid '+String.fromCharCode(65+Math.floor(col/9))}, row ${row+1}, cell ${col%9+1}${digit?', digit '+digit:', empty'}`} aria-pressed={selected?.surface===surface&&selected?.row===row&&selected?.col===col} tabindex={selected?.surface===surface&&selected.row===row&&selected.col===col||!selected&&row===0&&col===0?0:-1} onclick={()=>select(surface as 'core'|'outer',row,col)} onfocus={()=>select(surface as 'core'|'outer',row,col)} onkeydown={event=>keydown(event,surface as 'core'|'outer',row,col)} onpointerdown={event=>beginSpin(event,surface,row)}/>
       {#if arrows[key]}
        {@const radius=(surface==='core'?coreInner+row*coreRow:outerInner+row*outerRow)+10}
        <g transform={`translate(${point.x} ${point.y}) rotate(${angleOf(surface,row,col,displayAngles)+90})`}>
         {#each arrows[key] as arrow}
         <path d={arrowPath(arrow.dx,arrow.dy,radius,step(surface))} class="arrow-mark" class:diagonal-arrow={!!arrow.dx&&!!arrow.dy}/>
         {/each}
        </g>
       {/if}
       <g transform={`rotate(${angleOf(surface,row,col,displayAngles)+270} ${point.x} ${point.y})`}>
        {#if digit}<text x={point.x} y={point.y} class="digit" class:given-digit={givens[key]} class:solved-digit={!givens[key]}>{digit}</text>
        {:else}{#if notes[key+':center']?.length}<text x={point.x} y={point.y} class="digit note">{notes[key+':center'].join('')}</text>{/if}
        {#if notes[key+':corner']?.length}<text x={point.x} y={point.y-7} class="digit note">{notes[key+':corner'].join('')}</text>{/if}{/if}
       </g>
      {/each}
     {/each}
    {/each}
    {#if view==='outer'}{#each Array.from({length:6},(_,g)=>g) as grid}<path d={wedge(outerInner,outerRadius,-90+(grid*10+9)*6+displayAngles[3]+SHIFTED_OUTER_PHASE,6)} class="separator"/>{/each}{/if}
    {#each Array.from({length:10},(_,b)=>b) as boundary}
     <circle cx={C} cy={C} r={coreInner+boundary*coreRow} class="grid-circle" class:box-circle={boundary%3===0}/>
     {#if view==='outer'}<circle cx={C} cy={C} r={outerInner+boundary*outerRow} class="grid-circle" class:box-circle={boundary%3===0}/>{/if}
    {/each}
    {#each Array.from({length:3},(_,r)=>r) as ring}{#each Array.from({length:9},(_,b)=>b) as boundary}
     {@const angle=-90+boundary*40+displayAngles[ring]}{@const start=polar(coreInner+ring*3*coreRow,angle)}{@const end=polar(coreInner+(ring+1)*3*coreRow,angle)}
     <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line core-column" class:box-line={boundary%3===0}/>
    {/each}{/each}
    {#if view==='outer'}
     {#each Array.from({length:60},(_,b)=>b) as boundary}{@const angle=-90+boundary*6+displayAngles[3]+SHIFTED_OUTER_PHASE}{@const start=polar(outerInner,angle)}{@const end=polar(outerRadius,angle)}<line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line outer-spoke" class:box-line={boundary%10%3===0}/>{/each}
     {#each Array.from({length:6},(_,g)=>g) as grid}
      {#each [grid*10+.5,grid*10+8.5] as boundary}{@const angle=-90+boundary*6+displayAngles[3]+SHIFTED_OUTER_PHASE}{@const start=polar(coreOuter,angle)}{@const end=polar(outerInner,angle)}<line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="connector-spoke"/>

      {/each}
      {@const label=polar(outerRadius+10,-90+(grid*10+4.5)*6+displayAngles[3]+SHIFTED_OUTER_PHASE)}<text x={label.x} y={label.y} class="grid-letter" transform={`rotate(${(grid*10+4.5)*6+displayAngles[3]+SHIFTED_OUTER_PHASE+180} ${label.x} ${label.y})`}>{String.fromCharCode(65+grid)}</text>
     {/each}
    {/if}
    <circle cx={C} cy={C} r={coreInner} class="hub"/>
   </svg>
   <div class="ring-picker" role="group" aria-label="Choose a ring to spin">{#each [0,1,2] as ring}<button class:active={selectedRing===ring} aria-pressed={selectedRing===ring} onclick={()=>{selectedRing=ring;selected=null;}}>Ring {ring+1} <small>rows {ring*3+1}–{ring*3+3}</small></button>{/each}{#if view==='outer'}<button class:active={selectedRing===3} aria-pressed={selectedRing===3} onclick={()=>{selectedRing=3;selected=null;}}>Outer ring <small>grids A–F</small></button>{/if}</div>
   <div class="rotation-controls"><strong>{selectedRing===3?'Outer ring':'Ring '+(selectedRing+1)}</strong><button aria-label={selectedRing===3?'Rotate selected ring counterclockwise one orientation':'Rotate selected ring counterclockwise 40 degrees'} onclick={()=>rotateSelected(-1)}>↶ {selectedRing===3?'20°':'40°'}</button><button aria-label={selectedRing===3?'Rotate selected ring clockwise one orientation':'Rotate selected ring clockwise 40 degrees'} onclick={()=>rotateSelected(1)}>{selectedRing===3?'20°':'40°'} ↷</button></div>
   <p class="status" aria-live="polite">{message}</p>
  </div>
  <SudokuPuzzleControls busy={searchBusy} onCancel={cancelSearch} onExportBackup={exportBackup} onImportBackup={importBackup} {saveAvailable} onDownloadPages={downloadPages} {downloadingPages} mode={entryMode} {editMode} canUndo={history.length>0} onDigit={enter} onMode={next=>entryMode=next} onEditMode={next=>editMode=next} onDelete={()=>enter(0)} onUndo={undo} onSolve={solve} onClearBoard={clearBoard} onClearSolution={clearSolution} onExample={addExample} onArrow={addArrow} onClearArrow={removeArrow} onGenerate={generate} bind:generationClues maxClues={80} cluesLabel="Clues per grid" {boardSvg} filename={view==='classic'?'shifted-sudoku':'circular-sudoku'} bookletPage={view==='classic'?60:64}>
  <ShiftedPrintOptions slot="print-options" {boardSvg} outerAngle={displayAngles[3]} phase={SHIFTED_OUTER_PHASE} includeOuter={view==='outer'} bind:printMode/>
  </SudokuPuzzleControls>
 </div>
</section>
<style>


 .circular-tool{margin:24px 0;padding:24px;background:white;border:1px solid #dce1d6;border-radius:10px;color:#20382e}h2{font-size:22px;margin:0 0 8px}header>p:not(.eyebrow){color:#697467;line-height:1.5}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869}.practice-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:32px;align-items:start;margin-top:20px}.board-column{min-width:0;max-width:760px;width:100%;margin:auto}svg{display:block;width:100%;height:auto;touch-action:none}.selected-label,.status{font-size:13px;color:#697467;line-height:1.5;text-align:center}.sudoku-cell{fill:white;stroke:none;cursor:crosshair;touch-action:none}.sudoku-cell.chosen{fill:#d8e9c9}.sudoku-cell:focus{outline:none}.separator{fill:#c8cbc9;pointer-events:none}.grid-circle{fill:none;stroke:#252b27;stroke-width:1;pointer-events:none}.box-circle{stroke-width:3.5}.grid-line{stroke:#57605a;stroke-width:1;pointer-events:none}.box-line{stroke:#252b27;stroke-width:3.5}.connector-spoke{stroke:#999f9b;stroke-width:4;pointer-events:none}.digit,.grid-letter{font:500 12px Inter,Arial,sans-serif;text-anchor:middle;dominant-baseline:central;fill:#142519;pointer-events:none}.digit.note{font-size:7px}.hub{fill:#676767;stroke:#252b27;stroke-width:2;pointer-events:none}.view-switch,.ring-picker,.rotation-controls{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:12px 0}button{font:inherit}.view-switch button,.ring-picker button,.rotation-controls button{border:1px solid #c5cec4;background:#f8faf6;color:#244d3b;padding:8px 11px;border-radius:6px;cursor:pointer}.active{background:#244d3b!important;color:white!important}.ring-picker small{display:block;font-size:10px;margin-top:2px}@media(max-width:760px){.circular-tool{padding:16px}.practice-layout{grid-template-columns:1fr;gap:20px}}
 .given-digit{fill:#000}.solved-digit{fill:#2469bf}
 .arrow-mark{fill:none;stroke:#000;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.diagonal-arrow{stroke:#999;stroke-width:.65}
</style>
