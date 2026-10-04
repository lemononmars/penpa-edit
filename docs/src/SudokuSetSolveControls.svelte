<script lang="ts">
 export let mode: 'set'|'solve' = 'set';
 export let onChange: (mode:'set'|'solve')=>void;
</script>
<div class="edit-mode" role="group" aria-label="Set or solve puzzle">
 <button aria-label="Set mode" aria-pressed={mode==='set'} class:active={mode==='set'} onclick={()=>onChange('set')}>Set</button>
 <button aria-label="Solve mode" aria-pressed={mode==='solve'} class:active={mode==='solve'} onclick={()=>onChange('solve')}>Solve</button>
</div>
<style>
 .edit-mode{display:flex;gap:6px}.edit-mode button.active{background:#244d3b;color:#fff;border-color:#244d3b}
</style>
