<script lang="ts">
 import SamuraiRules from './SamuraiRules.svelte';
 export let example:string;
 export let solution:string;
 let enlarged=false;
</script>

<section class="samurai-example">
 <div class="board-toolbar"><div><h3>Five grids. One shared board.</h3><p>The overlapping 3×3 boxes belong to both grids.</p></div><div class="board-actions"><button type="button" aria-pressed={enlarged} onclick={()=>enlarged=!enlarged}>{enlarged?'Fit board':'Enlarge board'}</button><a href={example} target="_blank" rel="noopener noreferrer">Open image ↗</a></div></div>
 <div class="board-layout">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable board needs keyboard focus for arrow-key scrolling.) -->
  <div class="board-scroll" class:enlarged tabindex="0" role="region" aria-label="Samurai puzzle board; scroll to explore when enlarged"><img src={example} alt="Samurai Sudoku example: five overlapping 9 by 9 grids"/></div>
  <aside><SamuraiRules/><a class="pdf-download" href="/wsc2026/samurai-practice.pdf" download="wsc2026-round-2.pdf">Download Round 2 PDF ↓</a><p class="print-note">Print: one complete board per portrait A4 page, including when Landscape is selected.</p></aside>
 </div>
 <details class="solution"><summary>Reveal solution</summary><img src={solution} alt="Samurai Sudoku solution" loading="lazy"/></details>
</section>

<style>
 .samurai-example{cursor:default}.board-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:8px 0 20px}.board-toolbar h3{margin:0 0 6px;font-size:18px}.board-toolbar p,.print-note{font-size:12px;line-height:1.6;color:#697467;margin:0}.board-actions{display:flex;gap:12px;align-items:center;flex-shrink:0}.board-actions button{background:#edf2e8;color:#244d3b;border:1px solid #c5cec4;border-radius:6px;padding:8px 12px;font:inherit;font-size:12px;cursor:pointer}.board-actions a{font-size:12px;color:#315e43}.board-layout{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:24px;align-items:start}.board-scroll{overflow:auto;background:white;border:1px solid #e0e4db;border-radius:6px;padding:10px}.board-scroll:focus-visible{outline:2px solid #315e43;outline-offset:3px}.board-scroll img{display:block;width:100%;height:auto;max-width:none}.board-scroll.enlarged{max-height:85vh}.board-scroll.enlarged img{width:1100px;max-width:none}.pdf-download{display:block;margin-top:18px;padding:10px 12px;border:1px solid #c5cec4;border-radius:6px;color:#244d3b;text-align:center;text-decoration:none;font-size:12px;font-weight:600;background:#edf2e8}.print-note{border-top:1px solid #dce1d6;padding-top:12px;margin-top:16px}.solution{border-top:1px solid #dce1d6;margin-top:20px;padding-top:8px}.solution summary{font-size:13px;color:#456638;cursor:pointer;padding:8px 0}.solution img{display:block;width:100%;max-width:900px;margin:12px auto;height:auto}
 @media(max-width:850px){.board-layout{grid-template-columns:minmax(0,1fr)}.board-toolbar{flex-wrap:wrap}.board-scroll{padding:5px}}
</style>
