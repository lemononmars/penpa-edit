<script lang="ts">
 import {onMount,tick} from 'svelte';
 import FlowerSudokuTool from './FlowerSudokuTool.svelte';
 import PentagramTool from './PentagramTool.svelte';
 import {ROUND_GENRES,flowerRoundSvg} from './wsc2026/flowerRound.mjs';
 import {downloadSudokuPdfPages} from './wsc2026/downloadSudokuPdf.mjs';
 let editors:HTMLDivElement,preview:HTMLDivElement,active=-1,busy=false,message='';
 let order=[0,1,2,3,4];
 function swap(position:number,variant:number){const other=order.indexOf(variant);const next=order.slice();[next[position],next[other]]=[next[other],next[position]];order=next;localStorage.setItem('wsc2026-round9-order',JSON.stringify(order));refresh();}
 const names=['Flower Sudoku',...ROUND_GENRES.map(g=>g[1])];
 function boards(){return [...editors.querySelectorAll<SVGSVGElement>('.editor > svg')];}
 function refresh(){if(preview&&editors)preview.replaceChildren(flowerRoundSvg(boards(),true,order));}
 onMount(()=>{try{const saved=JSON.parse(localStorage.getItem('wsc2026-round9-order')||'null');if(Array.isArray(saved)&&saved.length===5&&saved[0]===0&&new Set(saved).size===5&&saved.every(n=>Number.isInteger(n)&&n>=0&&n<5))order=saved;}catch{}preview.addEventListener('click',selectCell);refresh();let frame=0;const observer=new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(refresh);});observer.observe(editors,{subtree:true,childList:true,attributes:true,characterData:true});return()=>{observer.disconnect();preview.removeEventListener('click',selectCell);cancelAnimationFrame(frame);};});
 async function selectCell(event:MouseEvent){const cell=(event.target as Element).closest('[data-board]');if(!cell)return;active=Number(cell.getAttribute('data-board'));await tick();const target=boards()[active].querySelectorAll<SVGElement>('.cell')[Number(cell.getAttribute('data-cell'))];target.dispatchEvent(new MouseEvent('click',{bubbles:true}));target.focus();}
 async function download(){busy=true;const pages=[];try{
  for(const solution of [false,true]){const svg=flowerRoundSvg(boards(),solution,order);preview.append(svg);svg.querySelector('rect')?.remove();const bounds=svg.getBBox();svg.setAttribute('viewBox',`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);pages.push({board:svg,includeSolution:solution,title:solution?'Solution':undefined});}
  await downloadSudokuPdfPages(pages,'round-9-flower-puzzles-and-solution.pdf');message='Downloaded puzzles and solution in one two-page A4 PDF.';
 }catch(error){console.error(error);message='Could not export the round. Please try again.';}finally{pages.forEach(page=>page.board.remove());busy=false;}}

</script>
<section class="flower-round">
 <div class="board-tabs" role="tablist" aria-label="Round 9 boards"><button role="tab" aria-selected={active===-1} class:active={active===-1} onclick={()=>active=-1}>Whole puzzle</button>{#each names as name,i}<button role="tab" aria-selected={active===i} class:active={active===i} onclick={()=>active=i}>{name}</button>{/each}</div>
 <div hidden={active!==-1}>
 <div class="round-actions"><button disabled={busy} onclick={download}>Download puzzles &amp; solution · A4 PDF</button><span aria-live="polite">{message}</span></div>
 <div class="swap-controls" aria-label="Swap surrounding variants">{#each [1,2,3,4] as position}<label>Clockwise position {position+1}<select aria-label={'Variant at position '+(position+1)} value={order[position]} onchange={event=>swap(position,Number(event.currentTarget.value))}>{#each ROUND_GENRES.slice(1) as genre,index}<option value={index+1}>{genre[1]}</option>{/each}</select></label>{/each}</div>
 <div class="overview" bind:this={preview} role="group" aria-label="Flower and five upright Pentagrams"></div>
 </div>
 <div bind:this={editors}>
  <div hidden={active!==0}><FlowerSudokuTool/></div>
  {#each ROUND_GENRES as genre,i}<div hidden={active!==i+1}><PentagramTool fixedGenre initialGenre={genre[0]} storageKey={'round9-'+genre[0]}/></div>{/each}
 </div>
</section>
<style>
 .swap-controls{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0}.swap-controls label{display:grid;gap:4px;font-size:12px}.swap-controls select{font:inherit;padding:8px;border:1px solid #bccabc;border-radius:6px;background:white;color:#20382e}
 .overview{max-width:1200px;margin:auto;background:white}.overview :global(> svg){display:block;width:100%;height:auto}.overview :global(.cell){cursor:pointer}.round-actions,.board-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}button{padding:9px 12px;border:1px solid #bccabc;border-radius:6px;background:white;color:#20382e;cursor:pointer}.active{background:#244d3b;color:white}.round-actions span{align-self:center;font-size:13px}.board-tabs{position:sticky;top:0;background:#f5f7f1;padding:8px;z-index:2}
</style>
