<script lang="ts">
 export let onArrow: (dx:number,dy:number)=>void;
 export let onClear: ()=>void;
 export let disabled=false;
 export let diagonalOnly=false;
 export let multipleDiagonal=false;
</script>
<fieldset class="arrow-tools"><legend>Arrow marks</legend>
 {#if !diagonalOnly}<div class="directions" role="group" aria-label="Black orthogonal arrows">
  {#each [[0,-1,'↑'],[1,0,'→'],[0,1,'↓'],[-1,0,'←']] as direction}
   <button class="black-arrow" {disabled} aria-label={`Add ${direction[2]} arrow`} onclick={()=>onArrow(Number(direction[0]),Number(direction[1]))}>{direction[2]}</button>
  {/each}
 </div>{/if}
 <div class="directions" role="group" aria-label="Gray diagonal arrows">
  {#each [[-1,-1,'↖'],[1,-1,'↗'],[1,1,'↘'],[-1,1,'↙']] as direction}
   <button class="gray-arrow" {disabled} aria-label={`Add ${direction[2]} arrow`} onclick={()=>onArrow(Number(direction[0]),Number(direction[1]))}>{direction[2]}</button>
  {/each}
 </div><button {disabled} onclick={onClear}>Remove arrow</button>
 <p>{multipleDiagonal?'Multiple arrows per cell.':'Multiple black arrows; one gray arrow per cell.'} Click a direction again to remove it.</p>
</fieldset>
<style>
 .arrow-tools{margin:0;padding:8px;border:1px solid #c5cec4;border-radius:8px}.arrow-tools legend{font-size:12px;color:#697467}.directions{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px}.directions button{padding:7px;font-size:20px}.arrow-tools p{font-size:11px;line-height:1.4;color:#697467;margin:8px 0 0}.arrow-tools button:disabled{opacity:.4;cursor:default}
 .directions button.black-arrow{color:#000}.directions button.gray-arrow{color:#999}
</style>
