<script lang="ts">
 export let mode: 'set'|'solve' = 'set';
 export let onChange: (mode:'set'|'solve')=>void;
</script>
<fieldset class="edit-mode">
 <legend>Entry mode</legend>
 <div class="mode-options">
  <button class="mode-button" aria-label="Set mode" aria-pressed={mode==='set'} class:active={mode==='set'} onclick={()=>onChange('set')}><span>Set <kbd>F2</kbd></span></button>
  <button class="mode-button" aria-label="Solve mode" aria-pressed={mode==='solve'} class:active={mode==='solve'} onclick={()=>onChange('solve')}><span>Solve <kbd>F3</kbd></span></button>
 </div>
</fieldset>
<style>
 .edit-mode{margin:0 0 8px;padding:10px;border:1px solid #b9c6cf;border-radius:10px;background:#eef3f6}.edit-mode legend{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:0 5px;color:#526776}.mode-options{display:flex;gap:4px}.edit-mode .mode-button{padding:9px 4px;border:1px solid transparent;background:transparent;border-radius:7px;color:#526776}.edit-mode .mode-button.active{background:white;color:#20382e;border-color:#9eafbc;box-shadow:0 1px 3px #20382e20}.mode-button span{display:block;font-size:13px;font-weight:700}.mode-button kbd{font-size:10px;border:1px solid #b9c6cf;border-radius:3px;padding:1px 3px;margin-left:4px}
</style>
