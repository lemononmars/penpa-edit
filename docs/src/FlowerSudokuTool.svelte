<script lang="ts">
 import SudokuSetSolveControls from './SudokuSetSolveControls.svelte';
 let editMode: 'set'|'solve' = 'set';
 import { downloadEmptySvg } from './wsc2026/downloadEmptySvg.mjs';
 let boardSvg: SVGSVGElement;
 import SudokuAnswerControls from './SudokuAnswerControls.svelte';
 import { FLOWER_CELL_COUNT, flowerLabel, flowerConflicts, solveFlower, randomFlowerSolution, generateFlowerPuzzle } from './wsc2026/flowerSudoku.mjs';
 import { FLOWER_CENTER as CENTER, FLOWER_LAYOUTS, flowerHighlightMask } from './wsc2026/flowerGeometry.mjs';
 const EMPTY = () => Array(FLOWER_CELL_COUNT).fill(0);
 const EMPTY_NOTES = () => Array.from({length:FLOWER_CELL_COUNT},()=>[] as number[]);
 let values = EMPTY(), centerNotes = EMPTY_NOTES(), cornerNotes = EMPTY_NOTES();
 let givens = Array(FLOWER_CELL_COUNT).fill(false);
 let selected = 0, solution: number[] | null = null, generationClues = 36;
 let mode: 'normal'|'center'|'corner' = 'normal';
 const geometryLayout = FLOWER_LAYOUTS.petals;
 let showHighlights = true, showConflicts = true;
 let activeFeature: 'solution'|'generated'|null = null;
 let history: any[] = [];
 let message = 'Select a cell and enter a digit. Each cell belongs to two columns and one region.';
 const highlightColors = ['#fff','#c5eeee','#ccdffc','#cfddf4','#ffe4bd','#d6ecc4','#e4def0','#f4e4cf'];
 $: conflicts = flowerConflicts(values);
 $: labels = Array.from({length:FLOWER_CELL_COUNT},(_,i)=>flowerLabel(i));
 function remember() { history = [...history, { givens:givens.slice(), values:values.slice(), centerNotes:centerNotes.map(n=>n.slice()), cornerNotes:cornerNotes.map(n=>n.slice()), solution:solution?.slice()||null, activeFeature, selected, message }]; }
 function undo() {
  if (!history.length) return;
  const previous=history[history.length-1]; history=history.slice(0,-1);
  ({givens,values,centerNotes,cornerNotes,solution,activeFeature,selected,message}=previous);
 }
 function select(index:number,event?:Event) { selected=index; (event?.currentTarget as SVGPathElement)?.focus(); }
 function enter(digit:number) {
  if(editMode==='solve'&&givens[selected])return;
  remember();
  if (digit && mode !== 'normal') {
   const notes = mode==='center'?centerNotes:cornerNotes;
   notes[selected] = notes[selected].includes(digit) ? notes[selected].filter(n=>n!==digit) : [...notes[selected],digit].sort();
   if (mode==='center') centerNotes=notes.slice(); else cornerNotes=notes.slice();
  } else {
   givens[selected]=!!digit&&editMode==='set';givens=givens.slice();
   values[selected]=digit; values=values.slice();
   centerNotes[selected]=[]; cornerNotes[selected]=[];
   centerNotes=centerNotes.slice(); cornerNotes=cornerNotes.slice();
  }
  solution=null; activeFeature=null;
 }
 function keydown(event:KeyboardEvent,index:number) {
  if ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z') {event.preventDefault();undo();return;}
  if (/^[1-9]$/.test(event.key)) {event.preventDefault();select(index);enter(Number(event.key));}
  else if (['Backspace','Delete','0'].includes(event.key)) {event.preventDefault();select(index);enter(0);}
  else if (['z','x','c'].includes(event.key.toLowerCase())) {event.preventDefault();mode=event.key.toLowerCase()==='z'?'normal':event.key.toLowerCase()==='x'?'center':'corner';}
  else if (event.key.startsWith('Arrow')) {
   event.preventDefault(); selected=(index+(event.key==='ArrowUp'?-20:event.key==='ArrowDown'?20:event.key==='ArrowLeft'?-1:1)+90)%90;
   document.getElementById(`flower-cell-${selected}`)?.focus();
  }
 }
 function clearBoard() {remember();values=EMPTY();givens=Array(FLOWER_CELL_COUNT).fill(false);centerNotes=EMPTY_NOTES();cornerNotes=EMPTY_NOTES();selected=0;solution=null;activeFeature=null;message='Board cleared.';}
 function solve() {
  const result=solveFlower(values); if(result.solution)remember(); solution=result.solution;editMode='solve';activeFeature='solution';
  message=result.status==='solved'?'Completion shown in blue.':result.status==='invalid'?'Fix the repeated digits first.':result.status==='limit'?'Search limit reached. Add more digits and try again.':'No solution fits these entries.';
 }
 function makeRandomSolution() {
  const result=randomFlowerSolution();
  if(result.solution){remember();values=result.solution.slice();givens=Array(FLOWER_CELL_COUNT).fill(false);editMode='solve';solution=null;centerNotes=EMPTY_NOTES();cornerNotes=EMPTY_NOTES();activeFeature=null;message='Random valid Flower Sudoku solution created.';}
  else message='No solution found within the search limit.';
 }
 function generatePuzzle() {
  const result=generateFlowerPuzzle({clues:Math.max(20,Math.min(89,Number(generationClues)||36))});
  if(result.puzzle){remember();values=result.puzzle.slice();givens=values.map(Boolean);editMode='solve';solution=result.solution;centerNotes=EMPTY_NOTES();cornerNotes=EMPTY_NOTES();activeFeature='generated';message=`Generated a uniquely solvable Flower Sudoku with ${result.clues} clues.`;}
  else message='Puzzle generation could not find a solution within the search limit.';
 }
</script>

<section class="flower-tool" aria-labelledby="flower-title">
 <header><p class="eyebrow">ROUND 9 · DRAUPADI’S SWAYAMVARA</p><h2 id="flower-title">Flower Sudoku editor &amp; solver</h2><p>Fill each column and region with 1–9. Select a cell to highlight its two columns and region.</p></header>
 <div class="flower-layout">
  <div class="editor">
   <svg bind:this={boardSvg} viewBox="0 0 800 800" role="group" aria-label="90-cell Flower Sudoku board">
    {#each geometryLayout.geometries as geometry,index}
     {@const displayed=values[index] || (activeFeature==='solution'?solution?.[index]:0)}
     <path id={`flower-cell-${index}`} d={geometry.path} class="cell" style:fill={showConflicts&&conflicts.has(index)?'#f5b8ad':selected===index?'#ffd477':showHighlights?highlightColors[flowerHighlightMask(selected,index)]:'#fff'} role="button" aria-label={`${labels[index]}${values[index]?`, digit ${values[index]}`:', empty'}`} aria-pressed={selected===index} tabindex={selected===index?0:-1} onclick={event=>select(index,event)} onfocus={()=>selected=index} onkeydown={event=>keydown(event,index)}/>
     <path d={geometry.outline} class="cell-outline"/>
     {#if displayed}<text x={geometry.center.x} y={geometry.center.y} class="digit" class:given-digit={givens[index]&&!!values[index]} class:solved-digit={!givens[index]}>{displayed}</text>
     {:else}
      {#if centerNotes[index].length}<text x={geometry.center.x} y={geometry.center.y} class="notes">{centerNotes[index].join('')}</text>{/if}
      {#if cornerNotes[index].length}<text x={geometry.center.x} y={geometry.center.y-13} class="notes corner">{cornerNotes[index].join('')}</text>{/if}
     {/if}
    {/each}
    {#each geometryLayout.borders as border}<path d={border} class="region-border"/>{/each}
    <circle cx={CENTER} cy={CENTER} r="100" class="hub"/><text x={CENTER} y={CENTER} class="hub-label">{labels[selected]}</text>
   </svg>
   {#if showHighlights}<div class="unit-legend" aria-label="Selected cell constraints"><span class="ccw">Counterclockwise column</span><span class="cw">Clockwise column</span><span class="region">Region</span></div>{/if}
   <p class="status" aria-live="polite">{message}</p>
  </div>
  <SudokuAnswerControls {mode} canUndo={history.length>0} onDigit={enter} onMode={next=>mode=next} onDelete={()=>enter(0)} onUndo={undo}>
   <button aria-pressed={showHighlights} onclick={()=>showHighlights=!showHighlights}>Highlights: {showHighlights?'On':'Off'}</button>
   <button aria-pressed={showConflicts} onclick={()=>showConflicts=!showConflicts}>Show conflict: {showConflicts?'On':'Off'}</button>
   <SudokuSetSolveControls mode={editMode} onChange={next=>editMode=next}/>
   <button class="primary" onclick={solve}>Solve</button>
   <button onclick={clearBoard}>Clear board</button>
   <button onclick={makeRandomSolution}>Random solution</button>
   <label>Clues<input type="number" min="20" max="89" bind:value={generationClues}/></label>
   <button onclick={generatePuzzle}>Generate unique puzzle</button>
   <a href="/wsc2026/WSC2026IB.pdf#page=30" target="_blank" rel="noreferrer">Booklet rules &amp; example · page 30 ↗</a>
   <button onclick={()=>downloadEmptySvg(boardSvg,'flower-sudoku-puzzle.svg')}>Download puzzle</button>
   <button onclick={()=>downloadEmptySvg(boardSvg,'flower-sudoku-solution.svg',true)}>Download solution</button>
  </SudokuAnswerControls>
 </div>
</section>

<style>

 .cell-outline{fill:none;stroke:#737b74;stroke-width:1;pointer-events:none}
 .flower-tool{margin:24px 0;padding:24px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}h2{margin:0 0 8px;font-size:22px}header>p:not(.eyebrow){color:#697467;line-height:1.5}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869;margin:0 0 6px}.flower-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:32px;align-items:start;margin-top:20px}.editor{min-width:0;width:100%;max-width:760px;margin:auto}svg{display:block;width:100%;height:auto;touch-action:none}.cell{stroke:none;cursor:pointer}.cell:focus{outline:none}.digit{font:500 24px Inter,Arial,sans-serif;text-anchor:middle;dominant-baseline:central;fill:#1f3027;pointer-events:none}.notes{font:500 12px Inter,Arial,sans-serif;text-anchor:middle;dominant-baseline:central;fill:#3a5947;pointer-events:none}.corner{font-size:10px}.solved-digit{fill:#2469bf}.region-border{fill:none;stroke:#252b27;stroke-width:3.5;stroke-linejoin:round;pointer-events:none}.hub{fill:#676767;stroke:#171723;stroke-width:3.5}.hub-label{font:700 18px Inter,Arial,sans-serif;fill:#fff;text-anchor:middle;dominant-baseline:central;pointer-events:none}.unit-legend{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:12px;color:#5e695f}.unit-legend span::before{content:'';display:inline-block;width:11px;height:11px;margin-right:5px;border-radius:3px}.ccw::before{background:#9fd9d9}.cw::before{background:#9cbceb}.region::before{background:#edc184}.status{min-height:24px;text-align:center;font-size:13px;color:#59675d;line-height:1.5}@media(max-width:760px){.flower-tool{padding:16px}.flower-layout{grid-template-columns:1fr;gap:20px}}
 .given-digit{fill:#000}.solved-digit{fill:#2469bf}
</style>
