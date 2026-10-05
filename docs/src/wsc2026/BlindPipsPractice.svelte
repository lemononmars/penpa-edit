<script lang="ts">
 import {onMount,onDestroy} from 'svelte';
 import ToolBackupControls from '../ToolBackupControls.svelte';
 import SudokuSetSolveControls from '../SudokuSetSolveControls.svelte';
 import {loadToolState,saveToolState,downloadToolBackup,readToolBackup} from './toolState.mjs';
 import {createToolSearch} from './toolSearch.mjs';
 import {isComplete,mostRecentCells,PIP_POSITIONS,PIP_MASKS,pipBit,pipCount} from './blindPractice.mjs';
 const emptyEntries=()=>Array.from({length:6},()=>Array(6).fill(0));
 const positions=['top left','top middle','top right','middle left','center','middle right','bottom left','bottom middle','bottom right'];
 const usable=new Set(Object.values(PIP_POSITIONS).flat());
 let clues:number[]=Array(36).fill(0),entries=emptyEntries(),revealed:number[]=[];
 let editMode:'set'|'solve'='solve',targetPips=40,highlightFilled=true;
 let ready=false,saveAvailable=true,busy=false,error='',message='Select a cell and complete its pips.',history:any[]=[];
 const search=createToolSearch(value=>busy=value);
 $: selected=revealed.at(-1);
 $: selectedClue=selected===undefined?0:clues[selected];
 $: complete=isComplete(clues,entries);
 $: filledCount=entries.flat().filter(Boolean).length;
 $: savedState={clues,entries,revealed,highlightFilled,editMode,targetPips};
 $: if(ready)saveAvailable=saveToolState('blind',savedState);
 function cancel(){search.cancel();message='Search cancelled; board kept.';}
 function remember(){if(busy)cancel();history=[...history,{clues:clues.slice(),entries:entries.map(row=>row.slice()),revealed:revealed.slice(),editMode,message}];}
 function undo(){if(busy)cancel();const previous=history.at(-1);if(!previous)return;history=history.slice(0,-1);({clues,entries,revealed,editMode,message}=previous);error='';}
 async function run(action:string,payload:any){error='';message=action==='generate'?'Generating unique partial-pip puzzle…':'Solving pip clues…';try{return await search.run('blind',action,payload);}catch(e){error=e instanceof Error?e.message:'Search failed.';return null;}}
 async function generate(){const result=await run('generate',{targetPips:Math.max(0,Math.min(126,Number(targetPips)||0))});if(!result)return;if(result.clues){remember();clues=result.clues;entries=emptyEntries();revealed=[];editMode='solve';message=`Generated a unique puzzle with ${result.pipCount} clue pips. Fill every cell, including clues.`;}else error='Generation reached its search limit. Try again.';}
 async function solve(){const result=await run('solve',{clues,entries});if(!result)return;if(result.solution){remember();entries=result.solution;editMode='solve';message='A valid completion was filled in blue.';}else error=result.status==='invalid'?'The clue pips or entered patterns conflict.':result.status==='limit'?'Search limit reached. Add more clue pips and try again.':'No solution fits these clue pips and entries.';}
 function selectCell(index:number){revealed=mostRecentCells(revealed,index);}
 function enterDigit(digit:number){if(selected===undefined)return;if(editMode==='solve'&&digit&&(PIP_MASKS[digit]&clues[selected])!==clues[selected]){error='This pattern misses a clue pip. Choose one containing all black pips.';return;}remember();error='';if(editMode==='set'){clues=clues.map((mask,cell)=>cell===selected?(PIP_MASKS[digit]||0):mask);entries=entries.map((row,r)=>row.map((v,c)=>r*6+c===selected?0:v));}else{const r=Math.floor(selected/6),c=selected%6;entries=entries.map((row,index)=>index===r?row.map((v,col)=>col===c?digit:v):row);}message='Fill every cell, including clue cells.';}
 function togglePip(position:number){if(selected===undefined||editMode!=='set'||!usable.has(position))return;remember();error='';clues=clues.map((mask,cell)=>cell===selected?mask^pipBit(position):mask);entries=entries.map((row,r)=>row.map((v,c)=>r*6+c===selected?0:v));message='Shown clue pips are required; missing pips are unknown.';}
 function clearSolution(){remember();entries=emptyEntries();error='';message='Answers cleared; clue pips kept.';}
 function clearBoard(){remember();clues=Array(36).fill(0);entries=emptyEntries();revealed=[];editMode='set';error='';message='Board cleared. Add full or partial clue pips.';}
 function keydown(event:KeyboardEvent,index:number){if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo();return;}if(/^[1-6]$/.test(event.key)||['0','Delete','Backspace'].includes(event.key)){event.preventDefault();selectCell(index);enterDigit(/^[1-6]$/.test(event.key)?Number(event.key):0);}else if(event.key.startsWith('Arrow')){event.preventDefault();const r=Math.floor(index/6),c=index%6,dr=event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0,dc=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0,next=((r+dr+6)%6)*6+(c+dc+6)%6;selectCell(next);document.getElementById(`blind-cell-${next}`)?.focus();}}
 function restoreState(state:any){search.cancel();clues=state.clues?state.clues.slice():state.board.flat().map((digit:number)=>PIP_MASKS[digit]||0);entries=state.entries;revealed=state.revealed;highlightFilled=state.highlightFilled!==false;editMode=state.editMode==='set'?'set':'solve';targetPips=Number.isFinite(state.targetPips)?Math.max(0,Math.min(126,state.targetPips)):40;error='';message='Saved pip puzzle restored.';}
 function exportBackup(){downloadToolBackup('blind',savedState);}
 async function importBackup(file:File){const state=await readToolBackup(file,'blind');remember();restoreState(state);}
 onMount(()=>{const saved=loadToolState('blind');if(saved)restoreState(saved);else generate();ready=true;});
 onDestroy(()=>search.cancel());
</script>

<section class="blind-practice" aria-label="Blind Pips Sudoku practice">
 <header><p class="eyebrow">ROUND 8 · BLIND PRACTICE</p><h2>Blind Pips editor &amp; solver</h2><p>Fill a Classic 6×6 Sudoku using pips. Black clue pips are required; missing pips are unknown. Complete every cell yourself, including cells with clues. Only the two most recently selected cells are visible.</p></header>
 <div class="practice-layout">
  <div class="board-panel">
   <div class="blind-grid" role="group" aria-label="6 by 6 Pips Sudoku">
    {#each clues as clue,index}
     {@const r=Math.floor(index/6)}{@const c=index%6}{@const visible=revealed.includes(index)}{@const entered=entries[r][c]}{@const mask=clue|(PIP_MASKS[entered]||0)}
     <button id={`blind-cell-${index}`} type="button" class="blind-cell" class:revealed={visible} class:selected={selected===index} class:given={!!clue} class:filled={highlightFilled&&!!mask} class:box-right={c===2} class:box-bottom={r===1||r===3} aria-label={`Row ${r+1}, column ${c+1}: ${visible?`${pipCount(clue)} clue pips, ${entered?entered+' pips entered':'no answer'}`:'hidden'}`} aria-pressed={selected===index} onclick={()=>selectCell(index)} onkeydown={event=>keydown(event,index)}>
      {#if visible&&mask}<span class="pips" aria-hidden="true">{#each Array.from({length:9},(_,i)=>i+1) as position}<span class:pip={!!(mask&pipBit(position))} class:clue-pip={!!(clue&pipBit(position))}></span>{/each}</span>{:else}<span class="hidden-mark" aria-hidden="true">·</span>{/if}
     </button>
    {/each}
   </div>
   <p class="selection-count" aria-live="polite">{revealed.length} of 2 cells visible · {filledCount}/36 answers entered</p>
   <p class="completion" role="status">{complete?'Complete!':message}</p>
   {#if error}<p class="error" role="alert">{error}</p>{/if}
  </div>
  <aside class="input-panel" aria-label="Pip input">
   <SudokuSetSolveControls mode={editMode} onChange={mode=>{if(busy)cancel();editMode=mode;}}/>
   <p class="input-hint">{selected===undefined?'Select a cell':`${editMode==='set'?'Clue':'Answer'} · row ${Math.floor(selected/6)+1}, column ${selected%6+1}`}</p>
   <div class="pip-keys">{#each [1,2,3,4,5,6] as digit}<button type="button" class="pip-key" aria-label={`Enter ${digit}`} disabled={selected===undefined||busy} onclick={()=>enterDigit(digit)}><span class="pips" aria-hidden="true">{#each Array.from({length:9},(_,i)=>i+1) as position}<span class:pip={PIP_POSITIONS[digit].includes(position)}></span>{/each}</span></button>{/each}</div>
   {#if editMode==='set'}<div class="clue-editor"><p>Toggle individual clue pips</p><div class="clue-pips" role="group" aria-label="Partial clue pips">{#each positions as label,i}<button class:present={!!(selectedClue&pipBit(i+1))} aria-label={`Clue pip ${label}`} aria-pressed={!!(selectedClue&pipBit(i+1))} disabled={selected===undefined||busy||!usable.has(i+1)} onclick={()=>togglePip(i+1)}><span></span></button>{/each}</div></div>{/if}
   <div class="pair-actions"><button disabled={selected===undefined||busy} onclick={()=>enterDigit(0)}>{editMode==='set'?'Clear clue':'Clear cell'}</button><button disabled={!history.length} onclick={undo}>Undo</button></div>
   <label class="fill-toggle"><input type="checkbox" bind:checked={highlightFilled}/> Green background on filled cells</label>
   <div class="tool-actions">
    {#if busy}<p role="status">Searching…</p><button onclick={cancel}>Cancel search</button>{/if}
    <button class="primary" disabled={busy} onclick={solve}>Solve</button>
    <div class="pair-actions"><button onclick={clearBoard}>Clear board</button><button onclick={clearSolution}>Clear solution</button></div>
    <label>Target clue pips<input aria-label="Target clue pips" type="number" min="0" max="126" bind:value={targetPips}/></label>
    <button disabled={busy} onclick={generate}>Generate unique puzzle</button>
    <p class="small">The generator keeps one solution, so it may retain more pips than the target.</p>
    <ToolBackupControls onExport={exportBackup} onImport={importBackup} {saveAvailable}/>
   </div>
  </aside>
 </div>
</section>
<style>
 .blind-practice{margin:24px 0;padding:24px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}header{margin-bottom:24px}h2{margin:0 0 8px;font-size:22px}.eyebrow{font-size:11px;letter-spacing:1.4px;font-weight:700;color:#6a7869;margin:0 0 6px}p{line-height:1.5;color:#59685b;margin:0}header>p:last-child{max-width:700px}.practice-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:32px;align-items:start}.board-panel{min-width:0}.blind-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));width:100%;max-width:560px;margin:auto;border:3px solid #244d3b;background:#fff}.blind-cell{aspect-ratio:1;border:0;border-right:1px solid #aebcaf;border-bottom:1px solid #aebcaf;background:#fff;display:grid;place-items:center;cursor:pointer;min-width:0;padding:5px;color:#8b9c8d}.blind-cell:nth-child(6n){border-right:0}.blind-cell:nth-last-child(-n+6){border-bottom:0}.blind-cell.box-right{border-right:3px solid #244d3b}.blind-cell.box-bottom{border-bottom:3px solid #244d3b}.blind-cell.filled{background:#e8efdf}.blind-cell.selected{outline:3px solid #d08a3a;outline-offset:-4px;z-index:1}.blind-cell:focus-visible,.pip-key:focus-visible{outline:3px solid #d08a3a;outline-offset:-4px;z-index:1}.hidden-mark{font-size:25px;line-height:1}.pips{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:70%;height:70%;gap:1px}.pips span{display:block;align-self:center;justify-self:center;width:0;aspect-ratio:1;border-radius:50%;background:#2469bf}.pips span.pip{width:75%}.pips span.clue-pip{background:#000}.pip-key .pips span{background:#244d3b}.input-panel{min-width:0}.input-hint{font-size:13px;margin:12px 0}.pip-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.pip-key{height:60px;padding:4px;display:grid;place-items:center;border:1px solid #aebcaf;border-radius:6px;background:#fff;cursor:pointer}.pair-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.input-panel button:not(.pip-key){font:inherit;padding:10px 6px;border:1px solid #c5cec4;border-radius:6px;background:#f8faf6;color:#244d3b;cursor:pointer}.input-panel button:disabled{opacity:.4;cursor:default}.fill-toggle{display:flex;gap:8px;align-items:center;font-size:12px;margin:16px 0}.tool-actions{display:grid;gap:8px;border-top:1px solid #dce1d6;padding-top:16px}.tool-actions .pair-actions{margin:0}.tool-actions label{display:flex;justify-content:space-between;align-items:center;font-size:13px}.tool-actions input{width:70px;padding:8px;border:1px solid #c5cec4;border-radius:6px}.input-panel button.primary{background:#244d3b;color:#fff}.small{font-size:11px}.selection-count{font-size:13px;text-align:center;margin-top:12px}.completion{font-size:13px;text-align:center;margin-top:6px;font-weight:600}.error{color:#a2362d;font-size:13px;margin-top:12px;text-align:center}.clue-editor{margin:16px 0}.clue-editor p{font-size:12px;margin-bottom:8px}.clue-pips{display:grid;grid-template-columns:repeat(3,36px);gap:3px}.input-panel .clue-pips button{height:36px;padding:8px}.clue-pips span{display:block;width:12px;height:12px;background:#dce1d6;border-radius:50%;margin:auto}.clue-pips .present span{background:#000}@media(max-width:760px){.blind-practice{padding:16px}.practice-layout{grid-template-columns:1fr;gap:24px}.input-panel{max-width:300px;width:100%;justify-self:center}.blind-cell{padding:3px}}
</style>
