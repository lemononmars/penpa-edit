<script lang="ts">
 import {onMount} from 'svelte';
 import SanjeevaniFace from './SanjeevaniFace.svelte';
 import {pyramid,frames,identity,orientCube,turnOrientation,checkAssembly} from './wpc2026/sanjeevani.mjs';
 import {createPyramidScene} from './wpc2026/sanjeevaniScene.mjs';
 let layers=2,puzzle:any=null,placements:any[]=[],orientations:number[]=[],selected=0,busy=true,message='Generating a unique pyramid…',conflicts:number[]=[],explode=0,layer='all',view='orbit',error='';
 let host:HTMLDivElement,dialog:HTMLDialogElement,scene:any,worker:Worker;
 $: board=pyramid(puzzle?.layers||layers);
 $: selectedFaces=puzzle?orientCube(puzzle.cubes[selected],orientations[selected]).faces:[];
 $: if(scene&&puzzle)scene.update({puzzle,placements,orientations,selected,conflicts,explode,layer});
 function generate(){if(!worker)return;busy=true;error='';message='Generating cubes and proving uniqueness…';worker.postMessage({layers,seed:Math.floor(Math.random()*0xffffffff)});}
 onMount(()=>{
  try{scene=createPyramidScene(host,pickSlot);}catch(e){error='3D rendering is unavailable. You can still play using the layer grids and face nets.';}
  worker=new Worker(new URL('./wpc2026/sanjeevani.worker.mjs',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{busy=false;if(data.error){message=data.error;return;}puzzle=data.puzzle;reset();};worker.onerror=()=>{busy=false;message='Generation failed. Try a new puzzle.';};generate();
  return()=>{worker.terminate();scene?.dispose();};
 });
 function changed(){conflicts=[];placements=[...placements];orientations=[...orientations];message='Match touching faces and keep the outside letters and digits upright.';}
 function choose(cube:number){if(busy)return;selected=cube;}
 function pickSlot(slot:number){if(!puzzle||busy)return;if(placements[slot]){selected=placements[slot].cube;return;}const old=placements.findIndex(p=>p?.cube===selected);if(old>=0)placements[old]=null;placements[slot]={cube:selected,orientation:orientations[selected]};changed();}
 function rotate(axis:string,reverse=false){if(!puzzle||busy)return;orientations[selected]=turnOrientation(orientations[selected],axis,reverse);const slot=placements.findIndex(p=>p?.cube===selected);if(slot>=0)placements[slot]={cube:selected,orientation:orientations[selected]};changed();}
 function remove(){const slot=placements.findIndex(p=>p?.cube===selected);if(slot>=0){placements[slot]=null;changed();}}
 function reset(){placements=Array(puzzle.cubes.length).fill(null);orientations=puzzle.cubes.map(()=>identity);selected=0;conflicts=[];explode=0;layer='all';message='Choose a cube, then click an empty slot to place it.';}
 function check(){const result=checkAssembly(puzzle,placements);conflicts=result.conflicts;message=result.message;if(result.ok)dialog.showModal();}
 function hint(){const slot=puzzle.solution.findIndex((p:any,i:number)=>placements[i]?.cube!==p.cube||placements[i]?.orientation!==p.orientation);if(slot<0){check();return;}const answer=puzzle.solution[slot],old=placements.findIndex(p=>p?.cube===answer.cube);if(old>=0)placements[old]=null;placements[slot]={...answer};orientations[answer.cube]=answer.orientation;selected=answer.cube;changed();message=`Hint: cube ${puzzle.cubes[answer.cube].id} placed in layer ${board.slots[slot].level+1}, row ${board.slots[slot].row+1}, column ${board.slots[slot].col+1}.`;}
 function reveal(){placements=puzzle.solution.map((p:any)=>({...p}));for(const p of placements)orientations[p.cube]=p.orientation;changed();message=`Solution revealed. All ${puzzle.cubes.length} cubes are correctly assembled.`;}
 function setView(name:string){view=name;scene?.view(name);}
 const net=[{face:2,col:2,row:1},{face:1,col:1,row:2},{face:4,col:2,row:2},{face:0,col:3,row:2},{face:5,col:4,row:2},{face:3,col:2,row:3}];
</script>

<section class="sanjeevani">
 <div class="heading"><div><p class="eyebrow">ROUND 21 · CUBE ASSEMBLY</p><h2>Sanjeevani</h2></div><a href="/wpc2026/?page=97">Booklet rules & cube nets ↗</a></div>
 <div class="toolbar">
  <label>Size<select aria-label="Pyramid size" bind:value={layers} onchange={event=>{layers=Number(event.currentTarget.value);generate();}} disabled={busy}><option value={2}>2 layers · 5 cubes</option><option value={3}>3 layers · 14 cubes</option></select></label>
  <button onclick={generate} disabled={busy}>New puzzle</button><button onclick={reset} disabled={busy||!puzzle}>Clear assembly</button><button onclick={hint} disabled={busy||!puzzle}>Hint</button><button onclick={reveal} disabled={busy||!puzzle}>Reveal solution</button><button class="primary" onclick={check} disabled={busy||!puzzle}>Check pyramid</button>
  <span class="progress">{placements.filter(Boolean).length}/{puzzle?.cubes.length||board.slots.length} placed</span>
 </div>
 <p role="status" class="status">{message}</p>
 <div class="workspace">
  <div class="stage-panel">
   <div class="views" role="group" aria-label="Pyramid view">{#each ['orbit','top','bottom','front','right','back','left'] as name}<button class:active={view===name} aria-pressed={view===name} onclick={()=>setView(name)}>{name==='orbit'?'3D':name[0].toUpperCase()+name.slice(1)}</button>{/each}</div>
   <div class="stage" bind:this={host} aria-label="Interactive 3D cube pyramid" role="img"></div>
   {#if error}<p class="error">{error}</p>{/if}
   <div class="inspection"><label>Separate layers<input type="range" min="0" max="1.2" step=".05" bind:value={explode}/></label><label>Show<select aria-label="Visible layers" bind:value={layer}><option value="all">All layers</option>{#each Array(board.layers) as _,i}<option value={String(i)}>Layer {i+1}{i===0?' · base':''}</option>{/each}</select></label></div>
   <p class="hint">Choose a cube and click an empty slot. Click a placed cube to select it. Drag to orbit, scroll to zoom. The unplaced selected cube appears beside the pyramid.</p>
   <details class="rules"><summary>Assembly rules & marks</summary><p>Each upper cube is centered over four lower cubes. All touching surfaces must match exactly, including mirrored letters, digits, shading, and semicircle colours. The six-spoked blank symbol matches in any rotation. Small cube IDs are labels only.</p><p>Outside letters and numbers must be upright. This practice fixes the six views: top letters / blank symbols, bottom numbers, front letters, right numbers, back shading, left black/white semicircles. The booklet’s twelve base puzzles are separate from this cube-assembly practice.</p></details>
  </div>
  <aside class="player">
   <h3>Cube bank</h3><div class="bank">{#each puzzle?.cubes||[] as cube,i}<button class:selected={selected===i} class:placed={placements.some(p=>p?.cube===i)} aria-pressed={selected===i} aria-label={`Select cube ${cube.id}`} onclick={()=>choose(i)} disabled={busy}><span class="cube-id">{cube.id}</span><span>{placements.some(p=>p?.cube===i)?'Placed':'Bank'}</span></button>{/each}</div>
   {#if puzzle}<div class="selection"><h3>Cube {puzzle.cubes[selected].id} · face net</h3><div class="net">{#each net as panel}<div style={`grid-column:${panel.col};grid-row:${panel.row}`}><small>{frames[panel.face].name}</small><SanjeevaniFace marks={selectedFaces[panel.face]}/></div>{/each}</div>
    <div class="rotations" role="group" aria-label="Rotate selected cube">{#each ['x','y','z'] as axis}<div><span>{axis.toUpperCase()}</span><button aria-label={`Rotate ${axis.toUpperCase()} backwards`} onclick={()=>rotate(axis,true)} disabled={busy}>↶ 90°</button><button aria-label={`Rotate ${axis.toUpperCase()} forwards`} onclick={()=>rotate(axis)} disabled={busy}>↷ 90°</button></div>{/each}</div><button onclick={remove} disabled={busy||!placements.some(p=>p?.cube===selected)}>Return selected cube to bank</button></div>{/if}
   <div class="layer-picker"><h3>Pyramid slots</h3>{#each Array(board.layers) as _,level}<div class="layer"><small>Layer {level+1}{level===0?' · base':''}</small><div class="slots" style={`grid-template-columns:repeat(${board.layers-level},1fr)`}>{#each board.slots.filter(s=>s.level===level) as slot}<button data-slot={slot.id} class:selected={placements[slot.id]?.cube===selected} class:conflict={conflicts.includes(slot.id)} aria-label={`Layer ${level+1}, row ${slot.row+1}, column ${slot.col+1}`} onclick={()=>pickSlot(slot.id)} disabled={busy}>{placements[slot.id]?puzzle.cubes[placements[slot.id].cube].id:'+'}</button>{/each}</div></div>{/each}</div>
   {#if puzzle}<p class="seed">Unique assembly · seed {puzzle.seed}</p>{/if}
  </aside>
 </div>
 <dialog bind:this={dialog}><h2>Pyramid complete!</h2><p>Every contact matches, and all six outside views are correctly oriented.</p><form method="dialog"><button class="primary">Continue</button></form></dialog>
</section>

<style>
 .sanjeevani{color:#20382e}.heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.heading h2{margin:0;font-size:26px}.heading a{font-size:12px;color:#315e43}.eyebrow{font-size:10px;font-weight:700;letter-spacing:.12em;margin:0 0 5px;color:#69826a}.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px;border:1px solid #dce1d6;border-radius:10px;background:white}button,select{font:inherit;font-size:12px;color:#20382e;background:white;border:1px solid #c5cec4;border-radius:6px;padding:8px 10px;cursor:pointer}button:disabled{opacity:.45;cursor:wait}.primary{background:#285741;color:white;border-color:#285741}.toolbar label,.inspection label{display:flex;gap:8px;align-items:center;font-size:12px}.progress{margin-left:auto;font-size:12px;color:#607866}.status{font-size:13px;min-height:20px;margin:12px 0}.workspace{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:16px;align-items:start}.stage-panel,.player{background:white;border:1px solid #dce1d6;border-radius:12px;padding:14px;min-width:0}.stage{height:clamp(380px,60vh,700px);border-radius:10px;overflow:hidden;touch-action:none}.stage :global(canvas){display:block;width:100%;height:100%;outline:none}.views{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}.active,.selected{background:#fff0be;border-color:#c4972a}.inspection{display:flex;flex-wrap:wrap;align-items:center;gap:20px;margin:12px 0}.inspection input{width:140px;accent-color:#285741}.hint,.rules p{font-size:12px;line-height:1.65;color:#697467}.rules summary{font-size:12px;font-weight:700;cursor:pointer}.player h3{font-size:14px;margin:0 0 10px}.bank{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}.bank button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 0}.cube-id{font-weight:700;font-size:17px}.bank button span:last-child{font-size:9px;color:#697467}.bank .placed{box-shadow:inset 0 -3px #8aa58b}.selection,.layer-picker{border-top:1px solid #e5e9e1;margin-top:16px;padding-top:14px}.net{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.net small{font-size:9px;color:#69826a;display:block;text-align:center;margin-bottom:3px}.rotations{display:flex;flex-direction:column;gap:6px;margin:12px 0}.rotations>div{display:flex;gap:6px;align-items:center}.rotations span{width:20px;font-weight:700;font-size:12px}.rotations button{flex:1}.layer-picker{display:flex;flex-wrap:wrap;gap:10px}.layer-picker h3{width:100%;margin:0}.layer{flex:1;min-width:64px}.layer small{font-size:10px;display:block;margin-bottom:5px}.slots{display:grid;gap:4px}.slots button{padding:8px 3px;min-width:24px}.conflict{background:#ffe0d5;border-color:#c94a36}.seed{font-size:10px;color:#697467;margin-bottom:0}.error{font-size:12px;color:#a14e3c}dialog{border:1px solid #c5cec4;border-radius:14px;padding:28px;color:#20382e;max-width:calc(100vw - 32px)}dialog::backdrop{background:#10251c88}dialog h2{font-size:24px}
 @media(max-width:850px){.workspace{grid-template-columns:minmax(0,1fr)}.player{display:grid;grid-template-columns:1fr 1fr;gap:12px}.player>h3{grid-column:1/-1;margin:0}.bank{grid-column:1}.selection{grid-column:2;grid-row:2/5;margin:0;border:0;padding:0}.layer-picker{grid-column:1}.seed{grid-column:1/-1}.stage{height:430px}.progress{margin-left:0}}
 @media(max-width:500px){.player{display:block}.selection{margin-top:15px;padding-top:14px;border-top:1px solid #e5e9e1}.stage{height:360px}.net{max-width:320px}.heading{align-items:start}.heading a{max-width:130px;text-align:right}.toolbar{padding:9px}.toolbar button{padding:8px}.inspection{gap:8px}}
</style>
