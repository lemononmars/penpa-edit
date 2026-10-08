<script lang="ts">
 import SudokuAnswerControls from './SudokuAnswerControls.svelte';
 import SudokuSetSolveControls from './SudokuSetSolveControls.svelte';
 import SudokuArrowControls from './SudokuArrowControls.svelte';
 import ToolBackupControls from './ToolBackupControls.svelte';
 import { downloadSudokuSvg } from './wsc2026/downloadSudokuSvg.mjs';
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
 export let onDownloadPages: (()=>void)|undefined = undefined;
 export let onDownloadSolution: (()=>void)|undefined = undefined;
 export let onDownloadPuzzle: (()=>void)|undefined = undefined;
 export let solutionDownloadFormat='A4 PDF';
 export let downloadingPages=false;
 export let busy=false;
 export let searchLabel='Searching…';
 export let cancelLabel='Cancel search';
 export let onCancel:(()=>void)|undefined=undefined;
 export let onExportBackup:(()=>void)|undefined=undefined;
 export let onImportBackup:((file:File)=>void)|undefined=undefined;
 export let saveAvailable=true;
</script>

<SudokuAnswerControls {mode} {canUndo} {onDigit} {onMode} {onDelete} {onUndo}>
 <div slot="above-keypad"><slot name="above-keypad"/></div>
 <SudokuSetSolveControls mode={editMode} onChange={onEditMode}/>
 <slot name="decorations"/>
 {#if onArrow&&onClearArrow}<SudokuArrowControls {onArrow} onClear={onClearArrow} diagonalOnly={diagonalArrowsOnly} multipleDiagonal={multipleDiagonalArrows} disabled={editMode!=='set'}/>{/if}
 {#if onHighlights}<button aria-pressed={showHighlights} onclick={onHighlights}>Highlights: {showHighlights?'On':'Off'}</button>{/if}
 {#if onConflicts}<button aria-pressed={showConflicts} onclick={onConflicts}>Show conflict: {showConflicts?'On':'Off'}</button>{/if}
 {#if busy}<div class="search-status" role="status">{searchLabel} <button onclick={onCancel}>{cancelLabel}</button></div>{/if}
 <button class="primary" disabled={busy} onclick={onSolve}>Solve</button>
 <div class="clear-actions"><button onclick={onClearBoard}>Reset</button><button onclick={onClearSolution}>Clear solution</button></div>
 {#if onRandom}<button disabled={busy} onclick={onRandom}>Random solution</button>{/if}
 {#if onExample}<button onclick={onExample}>Add example</button>{/if}
 <label>{cluesLabel}<input type="number" min="20" max={maxClues} bind:value={generationClues}/></label>
 <button disabled={busy} onclick={onGenerate}>Generate unique puzzle</button>
 <button disabled={downloadingPages} onclick={()=>onDownloadPuzzle?onDownloadPuzzle():downloadSudokuSvg(boardSvg,`${filename}-puzzle.svg`)}>Download puzzle{onDownloadPuzzle?' · A4 PDF':''}</button>
 <button disabled={downloadingPages} onclick={()=>onDownloadSolution?onDownloadSolution():downloadSudokuSvg(boardSvg,`${filename}-solution.svg`,true)}>Download solution{onDownloadSolution?' · '+solutionDownloadFormat:''}</button>
 {#if onDownloadPages}<button disabled={downloadingPages} onclick={onDownloadPages}>{downloadingPages?'Preparing PDF…':'Download puzzles · A4 PDF'}</button>{/if}
 <slot name="print-options"/>
 {#if onExportBackup&&onImportBackup}<ToolBackupControls onExport={onExportBackup} onImport={onImportBackup} {saveAvailable}/>{/if}
 <a href={`/wsc2026/WSC2026IB.pdf#page=${bookletPage}`} target="_blank" rel="noreferrer">Booklet rules &amp; example · page {bookletPage} ↗</a>
</SudokuAnswerControls>

<style>
 .clear-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.clear-actions button{font-size:12px;padding:12px 4px}
 .search-status{font-size:13px;color:#697467}.search-status button{margin-top:6px}button:disabled{opacity:.5;cursor:wait}
</style>
