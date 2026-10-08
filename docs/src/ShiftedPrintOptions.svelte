<script lang="ts">
 import {shiftedPrintPages,fitShiftedPrintPages} from './wsc2026/downloadShiftedPdf.mjs';
 export let boardSvg:SVGSVGElement;
 export let outerAngle=0;
 export let phase=-17;
 export let includeOuter=true;
 export let printMode='actual';
 let dialog:HTMLDialogElement,pages:any[]=[];
 function preview(){pages=fitShiftedPrintPages(shiftedPrintPages(boardSvg,outerAngle,phase,includeOuter),printMode);dialog.showModal();}
</script>
<label class="print-mode">PDF scale<select aria-label="PDF scale" bind:value={printMode}><option value="actual">Actual size · 100%</option><option value="fit">Fit · 10 mm margins</option></select></label>
<button onclick={preview}>Preview print pages</button>
<p class="print-help">Actual size leaves 3 mm margins around ring 3. Choose Fit for printers needing wider margins; all pieces use the same scale.</p>
<dialog bind:this={dialog} aria-label="Shifted Sudoku print preview" onclose={()=>pages=[]}>
 <header><h2>A4 print preview</h2><button onclick={()=>dialog.close()}>Close preview</button></header>
 <p>{pages.length} pages · Puzzle scale {pages[0]?(pages[0].scale*100).toFixed(1):100}% · Print the PDF at 100% / Actual size.</p>
 <div class="preview-pages">{#each pages as page,index}<section><h3>{index+1}. {page.title}</h3><div class="paper">{#each page.pieces as piece}<img alt={page.title+' printable shape'} src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(piece.svg)} style={`left:${piece.x/210*100}%;top:${piece.y/297*100}%;width:${piece.width/210*100}%;height:${piece.height/297*100}%`}/>{/each}</div></section>{/each}</div>
</dialog>
<style>
 .print-mode{display:flex;flex-direction:column;align-items:stretch!important}.print-mode select{width:100%;font:inherit;padding:8px;border:1px solid #c5cec4;border-radius:6px;background:#fff}.print-help{font-size:11px;line-height:1.5;color:#697467;margin:0}dialog{width:min(1100px,92vw);max-height:90vh;overflow:auto;border:1px solid #c5cec4;border-radius:10px;padding:22px;color:#20382e;background:#f5f4ef}dialog::backdrop{background:#0006}header{display:flex;justify-content:space-between;align-items:center;gap:16px}header h2{font-size:20px;margin:0}header button{width:auto!important}.preview-pages{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}h3{font-size:13px}.paper{position:relative;width:100%;aspect-ratio:210/297;background:white;box-shadow:0 2px 8px #0002}.paper img{position:absolute;object-fit:contain}
</style>
