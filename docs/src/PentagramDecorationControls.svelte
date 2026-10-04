<script lang="ts">
 export let mode='digits',dotClue='',cageClue='',disabled=false;
 export let onMode:(mode:string)=>void;
 export let onSaveCage:()=>void;
 export let onRemoveCage:()=>void;
</script>
<fieldset class="decorations"><legend>Decorations</legend>
 <div class="tools">{#each [['digits','Digits'],['black','● Black dot'],['white','○ Number dot'],['cage','Cage']] as tool}<button {disabled} class:active={mode===tool[0]} aria-pressed={mode===tool[0]} onclick={()=>onMode(tool[0])}>{tool[1]}</button>{/each}</div>
 {#if mode==='white'}<label>Dot number<input {disabled} inputmode="numeric" maxlength="2" bind:value={dotClue}/></label><p>Enter 1–2 digits, then click a shared edge.</p>{/if}
 {#if mode==='black'}<p>Click a shared edge to toggle its black dot.</p>{/if}
 {#if mode==='cage'}<label>Cage number<input {disabled} inputmode="numeric" bind:value={cageClue}/></label><p>Select connected cells, then save the cage.</p><button {disabled} onclick={onSaveCage}>Save cage</button><button {disabled} onclick={onRemoveCage}>Remove cage</button>{/if}
</fieldset>
<style>
 .decorations{margin:0;padding:8px;border:1px solid #c5cec4;border-radius:8px}.decorations legend{font-size:12px;color:#697467}.tools{display:grid;grid-template-columns:1fr 1fr;gap:4px}.tools button{font-size:12px;padding:8px}.tools button.active{background:#244d3b;color:white}.decorations p{font-size:11px;line-height:1.4;color:#697467}.decorations label{margin-top:10px}.decorations button:disabled{opacity:.4}
</style>
