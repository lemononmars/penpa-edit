<script lang="ts">
 import SudokuAnswerControls from './SudokuAnswerControls.svelte';
 import SudokuSetSolveControls from './SudokuSetSolveControls.svelte';
 import SudokuArrowControls from './SudokuArrowControls.svelte';
 import { downloadEmptySvg } from './wsc2026/downloadEmptySvg.mjs';
 export let mode: 'normal'|'center'|'corner' = 'normal';
 export let editMode: 'set'|'solve' = 'set';
 export let canUndo = false;
 export let onDigit: (digit:number)=>void;
 export let onMode: (mode:'normal'|'center'|'corner')=>void;
 export let onEditMode: (mode:'set'|'solve')=>void;
 export let onDelete: ()=>void;
 export let onUndo: ()=>void;
 export let onSolve: ()=>void;
 export let onClearBoard: ()=>void;
 export let onClearSolution: ()=>void;
 export let onRandom: (()=>void)|undefined = undefined;
 export let onExample: (()=>void)|undefined = undefined;
 export let onGenerate: ()=>void;
 export let generationClues = 32;
 export let maxClues = 80;
 export let cluesLabel = 'Clues';
 export let showHighlights = true;
 export let showConflicts = true;
 export let onHighlights: (()=>void)|undefined = undefined;
 export let onConflicts: (()=>void)|undefined = undefined;
 export let boardSvg: SVGSVGElement;
 export let filename: string;
 export let bookletPage: number;
 export let diagonalArrowsOnly=false;
 export let multipleDiagonalArrows=false;
 export let onArrow: ((dx:number,dy:number)=>void)|undefined = undefined;
 export let onClearArrow: (()=>void)|undefined = undefined;
</script>

<SudokuAnswerControls {mode} {canUndo} {onDigit} {onMode} {onDelete} {onUndo}>
 <SudokuSetSolveControls mode={editMode} onChange={onEditMode}/>
 <slot name="decorations"/>
 {#if onArrow&&onClearArrow}<SudokuArrowControls {onArrow} onClear={onClearArrow} diagonalOnly={diagonalArrowsOnly} multipleDiagonal={multipleDiagonalArrows} disabled={editMode!=='set'}/>{/if}
 {#if onHighlights}<button aria-pressed={showHighlights} onclick={onHighlights}>Highlights: {showHighlights?'On':'Off'}</button>{/if}
 {#if onConflicts}<button aria-pressed={showConflicts} onclick={onConflicts}>Show conflict: {showConflicts?'On':'Off'}</button>{/if}
 <button class="primary" onclick={onSolve}>Solve</button>
 <div class="clear-actions"><button onclick={onClearBoard}>Clear board</button><button onclick={onClearSolution}>Clear solution</button></div>
 {#if onRandom}<button onclick={onRandom}>Random solution</button>{/if}
 {#if onExample}<button onclick={onExample}>Add example</button>{/if}
 <label>{cluesLabel}<input type="number" min="20" max={maxClues} bind:value={generationClues}/></label>
 <button onclick={onGenerate}>Generate unique puzzle</button>
 <button onclick={()=>downloadEmptySvg(boardSvg,`${filename}-puzzle.svg`)}>Download puzzle</button>
 <button onclick={()=>downloadEmptySvg(boardSvg,`${filename}-solution.svg`,true)}>Download solution</button>
 <a href={`/wsc2026/WSC2026IB.pdf#page=${bookletPage}`} target="_blank" rel="noreferrer">Booklet rules &amp; example · page {bookletPage} ↗</a>
</SudokuAnswerControls>

<style>
 .clear-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.clear-actions button{font-size:12px;padding:12px 4px}
</style>
