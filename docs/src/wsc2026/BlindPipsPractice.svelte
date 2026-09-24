<script lang="ts">
 import { onMount } from 'svelte';
 import { isComplete, mostRecentCells } from './blindPractice.mjs';

 type Grid = number[][];
 let board:Grid = [];
 let solution:Grid = [];
 let entries:Grid = [];
 let revealed:number[] = [];
 let loading = true;
 let error = '';
 let worker:Worker|undefined;
 const pipPositions:Record<number,number[]> = {
  1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9],
  5:[1,3,5,7,9], 6:[1,3,4,6,7,9]
 };
 $: selected = revealed.at(-1);
 $: selectedGiven = selected === undefined || !board.length || board[Math.floor(selected/6)][selected%6] !== 0;
 $: complete = !!board.length && isComplete(board, entries, solution);

 function newPuzzle(event?:MouseEvent) {
  event?.stopPropagation();
  worker?.terminate();
  board = [];
  solution = [];
  entries = [];
  revealed = [];
  error = '';
  loading = true;
  const activeWorker = new Worker('/js/sudoku_generator_worker_bundle.js');
  worker = activeWorker;
  activeWorker.onmessage = ({data}) => {
   if (worker !== activeWorker) return;
   if (data.type === 'result') {
    const result = data.result;
    if (result.size !== 6 || result.unique !== true || !Array.isArray(result.board) || !Array.isArray(result.solution)) {
     error = 'The generator did not return a unique 6×6 puzzle. Try again.';
    } else {
     board = result.board;
     solution = result.solution;
     entries = Array.from({length:6},()=>Array(6).fill(0));
    }
    loading = false;
    activeWorker.terminate();
    worker = undefined;
   } else if (data.type === 'error') {
    error = data.message || 'Puzzle generation failed. Try again.';
    loading = false;
    activeWorker.terminate();
    worker = undefined;
   }
  };
  activeWorker.onerror = () => {
   if (worker !== activeWorker) return;
   error = 'Puzzle generation failed. Try again.';
   loading = false;
   activeWorker.terminate();
   worker = undefined;
  };
  activeWorker.postMessage({type:'generate',size:6,variants:['classic'],seed:crypto.getRandomValues(new Uint32Array(1))[0]});
 }
 function selectCell(event:MouseEvent, index:number) {
  event.stopPropagation();
  revealed = mostRecentCells(revealed, index);
 }
 function enterDigit(event:MouseEvent, digit:number) {
  event.stopPropagation();
  if (selected === undefined || selectedGiven || !board.length) return;
  const r = Math.floor(selected/6), c = selected%6;
  entries = entries.map((row, index) => index === r ? row.map((value, col) => col === c ? digit : value) : row);
 }
 onMount(() => { newPuzzle(); return () => worker?.terminate(); });
</script>

<section class="blind-practice" aria-label="Blind Pips Sudoku practice">
 <div class="practice-heading"><div><h3>Blind 6×6 practice</h3><p>Solve a unique Classic Sudoku. Select cells to see their pips; only the two most recently selected cells stay visible. Enter digits with the pip buttons.</p></div><button type="button" onclick={newPuzzle}>New random puzzle</button></div>
 {#if loading}<p role="status">Generating puzzle…</p>{/if}
 {#if error}<p role="alert">{error}</p>{/if}
 {#if board.length}
  <div class="practice-layout">
   <div class="blind-grid" role="group" aria-label="6 by 6 Pips Sudoku">
    {#each board as row,r}
     {#each row as given,c}
      {@const index = r*6+c}
      {@const visible = revealed.includes(index)}
      {@const digit = given || entries[r][c]}
      <button type="button" class="blind-cell" class:revealed={visible} class:selected={selected===index} class:given={!!given} class:box-right={c===2} class:box-bottom={r===1||r===3} aria-label={`Row ${r+1}, column ${c+1}: ${visible ? digit ? `${digit} pips${given?' given':''}` : 'empty' : 'hidden'}`} aria-pressed={selected===index} onclick={event=>selectCell(event,index)}>
       {#if visible && digit}<span class="pips" aria-hidden="true">{#each Array.from({length:9},(_,i)=>i+1) as position}<span class:pip={pipPositions[digit].includes(position)}></span>{/each}</span>{:else}<span class="hidden-mark" aria-hidden="true">·</span>{/if}
      </button>
     {/each}
    {/each}
   </div>
   <div class="input-panel" role="group" aria-label="Pip input">
    <p>{selected === undefined ? 'Select a cell' : selectedGiven ? 'Given cell' : `Enter row ${Math.floor(selected/6)+1}, column ${selected%6+1}`}</p>
    <div class="pip-keys">
     {#each [1,2,3,4,5,6] as digit}
      <button type="button" class="pip-key" aria-label={`Enter ${digit}`} disabled={selectedGiven} onclick={event=>enterDigit(event,digit)}><span class="pips" aria-hidden="true">{#each Array.from({length:9},(_,i)=>i+1) as position}<span class:pip={pipPositions[digit].includes(position)}></span>{/each}</span></button>
     {/each}
    </div>
    <button type="button" class="clear-button" disabled={selectedGiven} onclick={event=>enterDigit(event,0)}>Clear cell</button>
   </div>
  </div>
  <p class="selection-count" aria-live="polite">{revealed.length} of 2 cells visible</p>
  <p class="completion" role="status">{complete ? 'Complete!' : 'Keep solving'}</p>
 {/if}
</section>

<style>
 .blind-practice{margin:18px 0;padding:18px;border:1px solid #dce1d6;border-radius:10px;background:#f7f8f4}
 .practice-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
 h3{margin:0 0 5px;font-size:17px;color:#244d3b}
 p{margin:0;line-height:1.45;color:#59685b}
 .practice-heading button{flex:none;border:0;border-radius:6px;background:#244d3b;color:white;padding:9px 12px;cursor:pointer}
 .practice-layout{display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap}
 .blind-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));width:min(100%,390px);border:3px solid #244d3b;background:#fff}
 .blind-cell{aspect-ratio:1;border:0;border-right:1px solid #aebcaf;border-bottom:1px solid #aebcaf;background:#fff;display:grid;place-items:center;cursor:pointer;min-width:0;padding:5px;color:#8b9c8d}
 .blind-cell:nth-child(6n){border-right:0}.blind-cell:nth-last-child(-n+6){border-bottom:0}
 .blind-cell.box-right{border-right:3px solid #244d3b}.blind-cell.box-bottom{border-bottom:3px solid #244d3b}
 .blind-cell.given{background:#f2f4ed}.blind-cell.revealed{background:#e8efdf;color:#244d3b}.blind-cell.selected{outline:3px solid #d08a3a;outline-offset:-4px;z-index:1}
 .blind-cell:focus-visible,.pip-key:focus-visible,.clear-button:focus-visible{outline:3px solid #d08a3a;outline-offset:-4px;z-index:1}
 .hidden-mark{font-size:25px;line-height:1}
 .pips{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:70%;height:70%;gap:1px}
 .pips span{display:block;align-self:center;justify-self:center;width:0;aspect-ratio:1;border-radius:50%;background:#244d3b}
 .pips span.pip{width:75%}
 .input-panel{max-width:210px}.input-panel p{margin-bottom:10px;font-size:14px}.pip-keys{display:grid;grid-template-columns:repeat(3,58px);gap:7px}.pip-key{width:58px;height:58px;border:1px solid #aebcaf;border-radius:6px;background:white;display:grid;place-items:center;cursor:pointer}.pip-key:disabled,.clear-button:disabled{opacity:.5;cursor:default}.clear-button{margin-top:8px;padding:7px 10px;border:1px solid #aebcaf;border-radius:6px;background:white;cursor:pointer}
 .selection-count{margin-top:10px;font-size:13px}.completion{margin-top:4px;font-weight:700;color:#244d3b}
 @media(max-width:520px){.practice-heading{flex-direction:column}.blind-cell{padding:2px}}
</style>
