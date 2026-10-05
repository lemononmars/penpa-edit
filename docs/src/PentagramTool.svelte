<script lang="ts">
 import {onMount,onDestroy} from 'svelte';
 import {loadToolState,saveToolState,downloadToolBackup,readToolBackup} from './wsc2026/toolState.mjs';
 import {createToolSearch} from './wsc2026/toolSearch.mjs';
 let ready=false,saveAvailable=true,searchBusy=false;
 const search=createToolSearch(busy=>searchBusy=busy);
 function cancelSearch(){search.cancel();message='Search cancelled; board kept.';}
 async function runSearch(action:string,payload:any={}){message=action==='generate'?'Generating unique puzzle…':action==='random'?'Finding a random solution…':'Solving…';try{return await search.run('pentagram',action,payload);}catch(error){message=error instanceof Error?error.message:'Search failed.';return null;}}
 onDestroy(()=>search.cancel());

 let editMode: 'set'|'solve' = 'set';
 let showConflicts=true;
 let boardSvg: SVGSVGElement;
 import PentagramDecorationControls from './PentagramDecorationControls.svelte';
 import { PENTAGRAM_DECORATION_EDGES, pentagramCageGeometry } from './wsc2026/pentagramDecorations.mjs';
 let decorationMode='digits',dotClue='',cageClue='',cageDraft:number[]=[];
 let edgeDots:Record<string,{kind:string;clue:string}>={},cages:{cells:number[];clue:string}[]=[];
 $: renderedCages=cages.map(cage=>({...cage,geometry:pentagramCageGeometry(cage.cells)}));
 import SudokuPuzzleControls from './SudokuPuzzleControls.svelte';
 import { PENTAGRAM_CELL_COUNT, pentagramGeometry, pentagramPosition, pentagramConflicts } from './wsc2026/pentagram.mjs';
 let values = Array(PENTAGRAM_CELL_COUNT).fill(0), selected = 0, generationClues=32;
 let givens=Array(PENTAGRAM_CELL_COUNT).fill(false);
 const EMPTY_NOTES=()=>Array.from({length:80},()=>[] as number[]);
 let centerNotes=EMPTY_NOTES(),cornerNotes=EMPTY_NOTES(),history:any[]=[];
 let mode:'normal'|'center'|'corner'='normal';
 let message='Select a cell and enter a digit.';
 $: conflicts = pentagramConflicts(values);
 $: usedDigits = new Set(values.filter(Boolean));
 $: complete = values.every(Boolean) && conflicts.size === 0 && usedDigits.size===8;
 const geometries = Array.from({length:80}, (_, i) => pentagramGeometry(i));
 const line = (point:number, u1:number, v1:number, u2:number, v2:number) => {
  const a = pentagramPosition(point,u1,v1), b = pentagramPosition(point,u2,v2);
  return `M${a.x},${a.y} L${b.x},${b.y}`;
 };
 function remember(){if(searchBusy)cancelSearch();history=[...history,{edgeDots:structuredClone(edgeDots),cages:structuredClone(cages),cageDraft:cageDraft.slice(),givens:givens.slice(),values:values.slice(),centerNotes:centerNotes.map(n=>n.slice()),cornerNotes:cornerNotes.map(n=>n.slice()),selected,message}];}
 function undo(){if(searchBusy)cancelSearch();if(!history.length)return;const previous=history[history.length-1];history=history.slice(0,-1);({edgeDots,cages,cageDraft,givens,values,centerNotes,cornerNotes,selected,message}=previous);}
 function enter(value:number) {
  if(editMode==='set'&&decorationMode!=='digits')return;
  if(editMode==='solve'&&givens[selected])return;
  remember();
  if(value&&mode!=='normal'){
   const notes=mode==='center'?centerNotes:cornerNotes;
   notes[selected]=notes[selected].includes(value)?notes[selected].filter(n=>n!==value):[...notes[selected],value].sort();
   if(mode==='center')centerNotes=notes.slice();else cornerNotes=notes.slice();
  }else{givens[selected]=!!value&&editMode==='set';givens=givens.slice();values[selected]=value;values=values.slice();centerNotes[selected]=[];cornerNotes[selected]=[];centerNotes=centerNotes.slice();cornerNotes=cornerNotes.slice();}
 }
 function chooseCell(index:number,event?:Event){selected=index;(event?.currentTarget as SVGPathElement)?.focus();if(editMode==='set'&&decorationMode==='cage')cageDraft=cageDraft.includes(index)?cageDraft.filter(cell=>cell!==index):[...cageDraft,index];}
 function markEdge(key:string){if(editMode!=='set'||!['black','white'].includes(decorationMode))return;if(decorationMode==='white'&&!/^\d{1,2}$/.test(dotClue)){message='Enter one or two digits for the white dot.';return;}remember();const previous=edgeDots[key],next={...edgeDots};if(previous?.kind===decorationMode&&(decorationMode==='black'||previous.clue===dotClue))delete next[key];else next[key]={kind:decorationMode,clue:decorationMode==='white'?dotClue:''};edgeDots=next;}
 function saveCage(){if(editMode!=='set')return;if(!/^\d+$/.test(cageClue)||!pentagramCageGeometry(cageDraft)){message='Enter a cage number and select connected cells.';return;}if(cages.some(cage=>cage.cells.some(cell=>cageDraft.includes(cell)))){message='Remove the existing cage before reusing its cells.';return;}remember();cages=[...cages,{cells:cageDraft.slice(),clue:cageClue}];cageDraft=[];message='Cage saved.';}
 function removeCage(){if(editMode!=='set')return;remember();cages=cages.filter(cage=>!cage.cells.includes(selected));cageDraft=[];}
 function clearSolution(){remember();values=values.map((value,index)=>givens[index]?value:0);message='Solution cleared; givens kept.';}
 function clear(){remember();values=Array(80).fill(0);givens=Array(80).fill(false);centerNotes=EMPTY_NOTES();cornerNotes=EMPTY_NOTES();selected=0;edgeDots={};cages=[];cageDraft=[];message='Board cleared.';}
 function applyBoard(board:number[],notice:string,asGivens=false){remember();values=board.slice();givens=board.map(value=>asGivens&&!!value);editMode='solve';centerNotes=EMPTY_NOTES();cornerNotes=EMPTY_NOTES();message=notice;}
 async function solve(){const result=await runSearch('solve',{values});if(!result)return;if(result.solution){remember();values=result.solution.slice();centerNotes=EMPTY_NOTES();cornerNotes=EMPTY_NOTES();editMode='solve';message='Solved; answers filled in blue.';}else message=result.status==='invalid'?'Check repeated digits and use only eight different digits.':result.status==='limit'?'Search limit reached. Add more digits and try again.':'No solution fits these entries.';}
 async function random(){const result=await runSearch('random');if(!result)return;if(result.solution)applyBoard(result.solution,'Random valid Pentagram solution created.');else message='Search limit reached. Try again.';}
 async function generate(){const result=await runSearch('generate',{clues:Math.max(20,Math.min(79,Number(generationClues)||32))});if(!result)return;if(result.puzzle)applyBoard(result.puzzle,`Generated a uniquely solvable Pentagram with ${result.clues} clues.`,true);else message='Search limit reached. Try again.';}
 function keydown(event:KeyboardEvent,index:number) {
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo();return;}
  if (/^[1-9]$/.test(event.key)) { event.preventDefault(); selected=index; enter(Number(event.key)); }
  else if (['Backspace','Delete','0'].includes(event.key)) { event.preventDefault(); selected=index; enter(0); }
  else if(['z','x','c'].includes(event.key.toLowerCase())){event.preventDefault();mode=event.key.toLowerCase()==='z'?'normal':event.key.toLowerCase()==='x'?'center':'corner';}
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

 $: savedState={values,givens,centerNotes,cornerNotes,selected,mode,editMode,generationClues,showConflicts,edgeDots,cages,cageDraft,decorationMode,dotClue,cageClue};
 $: if(ready)saveAvailable=saveToolState('pentagram',savedState);
 function restoreState(state:any){({values,givens,centerNotes,cornerNotes,selected,mode,editMode,generationClues,showConflicts,edgeDots,cages,cageDraft,decorationMode,dotClue,cageClue}=state);}
 onMount(()=>{const saved=loadToolState('pentagram');if(saved){restoreState(saved);message='Saved board restored.';}ready=true;});
 function exportBackup(){downloadToolBackup('pentagram',savedState);}
 async function importBackup(file:File){try{const state=await readToolBackup(file,'pentagram');remember();restoreState(state);message='Backup restored.';}catch(error){message=error instanceof Error?error.message:'Could not import backup.';throw error;}}
</script>

<section class="pentagram-tool" aria-labelledby="pentagram-title">
 <header><div><p class="eyebrow">ROUND 9 · PAGE 29</p><h2 id="pentagram-title">Pentagram Sudoku editor &amp; solver</h2><p>Use the same eight of the digits 1–9 in every row, column, and bold region. Each row or column runs across two adjacent star points.</p></div></header>
 <div class="pentagram-layout"><div class="editor">
 <svg bind:this={boardSvg} viewBox="0 0 600 570" role="group" aria-label="80-cell Pentagram Sudoku board">
  {#each geometries as geometry,index}
   <path id={`pentagram-${index}`} d={geometry.path} class="cell" class:conflict={showConflicts&&conflicts.has(index)} class:draft-cell={editMode==='set'&&decorationMode==='cage'&&cageDraft.includes(index)} role="button" tabindex={selected===index?0:-1} aria-pressed={selected===index} aria-label={`Star point ${geometry.point+1}, cell ${geometry.u+1}, ${geometry.v+1}${values[index]?`, digit ${values[index]}`:', empty'}`} onclick={(event)=>chooseCell(index,event)} onfocus={()=>selected=index} onkeydown={(event)=>keydown(event,index)}/>
   {#if values[index]}<text x={geometry.center.x} y={geometry.center.y} class="digit" class:given-digit={givens[index]&&!!values[index]} class:solved-digit={!givens[index]}>{values[index]}</text>
   {:else}{#if centerNotes[index].length}<text x={geometry.center.x} y={geometry.center.y} class="notes">{centerNotes[index].join('')}</text>{/if}{#if cornerNotes[index].length}<text x={geometry.center.x} y={geometry.center.y-12} class="notes corner">{cornerNotes[index].join('')}</text>{/if}{/if}
  {/each}
  {#each Array.from({length:5},(_,i)=>i) as point}
   <path d={`${line(point,0,0,1,0)} ${line(point,1,0,1,1)} ${line(point,1,1,0,1)} ${line(point,0,1,0,0)} ${line(point,.5,0,.5,1)}`} class="bold"/>
  {/each}

  {#each renderedCages as cage}
   {#if cage.geometry}<path d={cage.geometry.path} class="killer-cage"/><text x={cage.geometry.clue.x} y={cage.geometry.clue.y} class="decoration-clue cage-number">{cage.clue}</text>{/if}
  {/each}
  {#each PENTAGRAM_DECORATION_EDGES as edge}
   {@const dot=edgeDots[edge.key]}
   {#if dot}<circle cx={edge.center.x} cy={edge.center.y} r={dot.kind==='black'?4:9} class="edge-dot" class:black-dot={dot.kind==='black'}/>{#if dot.kind==='white'}<text x={edge.center.x} y={edge.center.y} class="decoration-clue dot-number">{dot.clue}</text>{/if}{/if}
   {#if editMode==='set'&&(decorationMode==='black'||decorationMode==='white')}<circle cx={edge.center.x} cy={edge.center.y} r="11" class="decoration-hit" role="button" aria-label={`Edge between cells ${edge.cells[0]+1} and ${edge.cells[1]+1}`} tabindex="0" onclick={()=>markEdge(edge.key)} onkeydown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();markEdge(edge.key);}}}/>{/if}
  {/each}
 <path d={geometries[selected].path} class="selection-outline"/>
 </svg>
 <p class="status" aria-live="polite">{complete?'Complete':usedDigits.size>8?'Use eight of the digits 1–9 across the whole puzzle.':showConflicts&&conflicts.size?'Check the highlighted conflicts.':message}</p>
 </div><SudokuPuzzleControls busy={searchBusy} onCancel={cancelSearch} onExportBackup={exportBackup} onImportBackup={importBackup} {saveAvailable} {mode} {editMode} {showConflicts} onConflicts={()=>showConflicts=!showConflicts} canUndo={history.length>0} onDigit={enter} onMode={next=>mode=next} onEditMode={next=>editMode=next} onDelete={()=>enter(0)} onUndo={undo} onSolve={solve} onClearBoard={clear} onClearSolution={clearSolution} onRandom={random} onGenerate={generate} bind:generationClues maxClues={79} {boardSvg} filename="pentagram-sudoku" bookletPage={29}>
  <PentagramDecorationControls slot="decorations" mode={decorationMode} bind:dotClue bind:cageClue disabled={editMode!=='set'} onMode={next=>{decorationMode=next;cageDraft=[];}} onSaveCage={saveCage} onRemoveCage={removeCage}/>
 </SudokuPuzzleControls></div>
</section>

<style>
 .selection-outline{fill:none;stroke:#2469bf;stroke-width:2;stroke-linejoin:round;pointer-events:none}


 .pentagram-tool{margin:24px 0;padding:24px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}h2{margin:0 0 8px;font-size:22px}header p:not(.eyebrow){max-width:680px;color:#697467;line-height:1.5}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869;margin:0 0 6px}.pentagram-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:32px;margin-top:20px;align-items:start}.editor{min-width:0}svg{display:block;width:100%;max-width:650px;height:auto;margin:auto}.cell{fill:#fff;stroke:#333;stroke-width:.8;cursor:pointer}.cell.conflict{fill:#f5b8ad}.cell:focus{outline:none}.digit{text-anchor:middle;dominant-baseline:central;font:500 22px Arial,sans-serif;fill:#1f3027;pointer-events:none}.solved-digit{fill:#2469bf}.notes{font:500 11px Arial,sans-serif;text-anchor:middle;dominant-baseline:central;fill:#3a5947;pointer-events:none}.corner{font-size:9px}.bold{fill:none;stroke:#202020;stroke-width:4;stroke-linejoin:round;pointer-events:none}.status{text-align:center;font-size:13px;color:#697467;line-height:1.5}@media(max-width:760px){.pentagram-tool{padding:16px}.pentagram-layout{grid-template-columns:1fr;gap:20px}}
 .given-digit{fill:#000}.solved-digit{fill:#2469bf}
 .cell.draft-cell{fill:#d6e8fa}.killer-cage{fill:none;stroke:#666;stroke-width:1;stroke-dasharray:4 4;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.cage-number{font:500 9px Arial,sans-serif;fill:#000;stroke:white;stroke-width:3;paint-order:stroke;pointer-events:none}.edge-dot{fill:white;stroke:#000;stroke-width:1;pointer-events:none}.black-dot{fill:#000}.dot-number{font:500 9px Arial,sans-serif;fill:#000;text-anchor:middle;dominant-baseline:central;pointer-events:none}.decoration-hit{fill:transparent;stroke:none;cursor:pointer}.decoration-hit:focus{outline:none;stroke:#2469bf;stroke-width:1}
</style>
