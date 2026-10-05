<script lang="ts">
 export let onExport:()=>void;
 export let onImport:(file:File)=>void;
 export let saveAvailable=true;
 let input:HTMLInputElement,importError='';
 async function importFile(){const file=input.files?.[0];input.value='';importError='';if(file)try{await onImport(file);}catch(error){importError=error instanceof Error?error.message:'Could not import backup.';}}
</script>
<div class="backups">
 <p>{saveAvailable?'Board saved automatically on this browser.':'Autosave unavailable. Download a backup to keep your board.'}</p>
 <div><button onclick={onExport}>Export backup</button><button onclick={()=>input.click()}>Import backup</button></div>
 <input bind:this={input} type="file" accept="application/json,.json" aria-label="Import puzzle backup" onchange={importFile}/>
 {#if importError}<p role="alert">{importError}</p>{/if}
</div>
<style>
 .backups{margin-top:8px}.backups p{font-size:11px;color:#697467;line-height:1.5;margin:0 0 8px}.backups>div{display:flex;gap:6px}.backups button{font:inherit;font-size:12px;cursor:pointer;border:1px solid #c5cec4;border-radius:6px;background:#f8faf6;color:#244d3b;padding:8px}.backups input{display:none}
</style>
