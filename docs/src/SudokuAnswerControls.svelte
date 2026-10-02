<script lang="ts">
 import SudokuKeypad from './SudokuKeypad.svelte';
 export let mode: 'normal' | 'center' | 'corner' = 'normal';
 export let canUndo = false;
 export let onDigit: (digit:number)=>void;
 export let onMode: (mode:'normal'|'center'|'corner')=>void;
 export let onDelete: ()=>void;
 export let onUndo: ()=>void;
</script>

<aside class="answer-controls" aria-label="Puzzle controls">
 <SudokuKeypad {mode} {onDigit} {onMode}/>
 <div class="edit-actions"><button onclick={onDelete} aria-label="Delete selected cell">⌫ Delete</button><button onclick={onUndo} disabled={!canUndo} aria-label="Undo">↶ Undo</button></div>
 <div class="tool-actions"><slot/></div>
</aside>

<style>
 .answer-controls{width:100%;max-width:260px;justify-self:end;align-self:start;position:sticky;top:18px}.edit-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.edit-actions button{border:1px solid #b9c6cf;border-radius:8px;background:#f8fafb;color:#243642;padding:12px 6px;font:inherit;cursor:pointer}.edit-actions button:disabled{opacity:.4;cursor:default}.tool-actions{display:grid;gap:8px;margin-top:22px;padding-top:18px;border-top:1px solid #dce1d6}.tool-actions :global(button){width:100%;padding:12px;border:1px solid #c5cec4;background:#f8faf6;color:#244d3b;border-radius:8px;font:inherit;cursor:pointer}.tool-actions :global(button.primary){background:#244d3b;color:white}.tool-actions :global(label){display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px;color:#697467}.tool-actions :global(input){width:70px;padding:8px;border:1px solid #c5cec4;border-radius:6px}.tool-actions :global(a){font-size:13px;color:#315e43;line-height:1.6;margin-top:8px}
 @media(max-width:760px){.answer-controls{position:static;max-width:300px;justify-self:center}.answer-controls :global(.sudoku-keypad){grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,52px);width:100%}.answer-controls :global(.sudoku-keypad button){width:auto;height:auto;min-height:48px}.answer-controls :global(.mode-normal){grid-column:1;grid-row:4}.answer-controls :global(.mode-center){grid-column:2;grid-row:4}.answer-controls :global(.mode-corner){grid-column:3;grid-row:4}}
</style>
