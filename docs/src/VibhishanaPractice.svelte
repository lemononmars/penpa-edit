<script lang="ts">
 import {onMount} from 'svelte';
 import VibhishanaRuleImage from './VibhishanaRuleImage.svelte';
 import ShipGlyph from './ShipGlyph.svelte';
 import {sets,loopEdges,checkPractice} from './wpc2026/vibhishana.mjs';
 let size=6;let numberMode='answer';
 let type='loops',pack:any=null,index=0,busy=false,message='',reveal=false,selected=0;
 let drafts:any[]=[];let worker:Worker;let board:SVGSVGElement;let dialog:HTMLDialogElement;
 let drag:number|null=null,ghost:{x:number,y:number}|null=null,erase:boolean|null=null,visited=new Set<string>();
 const unit=58,pad=40;
 $: puzzle=pack?.puzzles[index];
 $: definition=sets.find(s=>s.id===(puzzle?.type||type));
 $: draft=drafts[index];
 function fresh(p:any){const values=Array(p.n*p.n).fill(0);if(p.type!=='loops')for(const g of p.givens)values[g.cell]=p.type==='numbers'?g.value:g.value?1:2;return {values,marks:Array.from({length:p.n*p.n},()=>[] as number[]),crosses:[] as string[],edges:p.type==='loops'?p.givens.filter(g=>g.value).map(g=>g.edge):[],traitor:'',done:false};}
 function generate(){if(!worker)return;busy=true;reveal=false;drag=null;ghost=null;message='Generating four puzzles and proving uniqueness…';worker.postMessage({type,size,seed:Math.floor(Math.random()*0xffffffff)});}
 onMount(()=>{worker=new Worker(new URL('./wpc2026/vibhishana.worker.mjs',import.meta.url),{type:'module'});worker.onmessage=({data})=>{busy=false;if(data.error){message=data.error;return;}pack=data.set;drafts=pack.puzzles.map(fresh);index=0;selected=0;message='Four unique puzzles ready. Each rule is the traitor once.';};worker.onerror=()=>{busy=false;message='Generation failed. Try again.';};generate();return()=>worker.terminate();});

 function save(){drafts[index].done=false;drafts=[...drafts];}
 function enter(value:number){const puzzle=pack?.puzzles[index],draft=drafts[index];if(!puzzle||busy||reveal||puzzle.givens.some((g:any)=>g.cell===selected))return;if(numberMode==='center'&&puzzle.type==='numbers'){const marks=new Set<number>(draft.marks[selected]);if(value===0)marks.clear();else if(marks.has(value))marks.delete(value);else marks.add(value);draft.marks[selected]=[...marks].sort((a,b)=>a-b);}else{draft.values[selected]=value;if(value)draft.marks[selected]=[];}save();}
 function clickCell(cell:number,boardIndex=index){index=boardIndex;const puzzle=pack?.puzzles[index],draft=drafts[index];if(!puzzle||busy||reveal)return;selected=cell;if(puzzle.type==='loops')return;if(puzzle.type==='numbers')return;if(puzzle.clues.some((c:any)=>c.cell===cell)||(puzzle.type==='shading'&&puzzle.circles[cell])||puzzle.givens.some((g:any)=>g.cell===cell))return;draft.values[cell]=puzzle.type==='shading'?(draft.values[cell]===1?0:1):(draft.values[cell]+1)%3;save();}
 function keyboard(event:KeyboardEvent,cell:number,boardIndex:number){index=boardIndex;const puzzle=pack?.puzzles[index];if(puzzle?.type!=='numbers')return;selected=cell;if(event.key.toLowerCase()==='m'){numberMode=numberMode==='answer'?'center':'answer';event.preventDefault();return;}if(/^[1-8]$/.test(event.key)&&Number(event.key)<=puzzle.n)enter(Number(event.key));else if(event.key==='Backspace'||event.key==='Delete')enter(0);else return;event.preventDefault();}
 function centre(i:number){return {x:pad+(i%puzzle.n+.5)*unit,y:pad+(Math.floor(i/puzzle.n)+.5)*unit};}
 function start(event:PointerEvent,cell:number,boardIndex:number){index=boardIndex;const puzzle=pack?.puzzles[index];board=(event.currentTarget as SVGElement).ownerSVGElement!;if(busy||reveal||puzzle.type!=='loops'||puzzle.blocked[cell]||event.button!==0)return;event.preventDefault();board.setPointerCapture(event.pointerId);drag=cell;ghost=centre(cell);erase=null;visited=new Set();}
 function move(event:PointerEvent){const puzzle=pack?.puzzles[index],draft=drafts[index];if(drag===null)return;const p=board.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const xy=p.matrixTransform(board.getScreenCTM()!.inverse());ghost={x:xy.x,y:xy.y};const r=Math.round((xy.y-pad)/unit-.5),c=Math.round((xy.x-pad)/unit-.5);if(r<0||c<0||r>=puzzle.n||c>=puzzle.n)return;const target=r*puzzle.n+c,point=centre(target);if(Math.hypot(xy.x-point.x,xy.y-point.y)>unit*.3)return;const rr=Math.floor(drag/puzzle.n),cc=drag%puzzle.n;if(r!==rr&&c!==cc)return;const dr=Math.sign(r-rr),dc=Math.sign(c-cc),next=new Set<string>(draft.edges);while(drag!==target){const other=drag+dr*puzzle.n+dc;if(puzzle.blocked[other])break;const edge=[drag,other].sort((a,b)=>a-b).join(',');if(erase===null)erase=next.has(edge);if(!visited.has(edge)&&!puzzle.givens.some((g:any)=>g.edge===edge)){if(erase)next.delete(edge);else {next.add(edge);draft.crosses=draft.crosses.filter((mark:string)=>mark!==edge);}visited.add(edge);}drag=other;}draft.edges=[...next];save();}
 function mark(event:MouseEvent,boardIndex:number){
  event.preventDefault();index=boardIndex;const puzzle=pack?.puzzles[index],draft=drafts[index];if(!puzzle||busy||reveal)return;
  const svg=event.currentTarget as SVGSVGElement,point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;const xy=point.matrixTransform(svg.getScreenCTM()!.inverse());
  if(puzzle.type==='loops'){
   const rr=(xy.y-pad)/unit-.5,cc=(xy.x-pad)/unit-.5,horizontal=Math.abs(rr-Math.round(rr))<Math.abs(cc-Math.round(cc));
   const r=horizontal?Math.round(rr):Math.floor(rr),c=horizontal?Math.floor(cc):Math.round(cc),a=r*puzzle.n+c,b=a+(horizontal?1:puzzle.n);
   if(r<0||c<0||r>=(horizontal?puzzle.n:puzzle.n-1)||c>=(horizontal?puzzle.n-1:puzzle.n)||puzzle.blocked[a]||puzzle.blocked[b])return;
   const edge=[a,b].sort((x,y)=>x-y).join(',');if(puzzle.givens.some((g:any)=>g.edge===edge))return;
   const crosses=new Set<string>(draft.crosses);if(crosses.has(edge))crosses.delete(edge);else crosses.add(edge);draft.crosses=[...crosses];draft.edges=draft.edges.filter((e:string)=>e!==edge);save();
  }else if(puzzle.type==='shading'){
   const r=Math.floor((xy.y-pad)/unit),c=Math.floor((xy.x-pad)/unit),cell=r*puzzle.n+c;if(r<0||c<0||r>=puzzle.n||c>=puzzle.n||puzzle.circles[cell]||puzzle.clues.some((clue:any)=>clue.cell===cell)||puzzle.givens.some((g:any)=>g.cell===cell))return;
   draft.values[cell]=draft.values[cell]===2?0:2;save();
  }
 }
 function end(){drag=null;ghost=null;}
 function check(boardIndex=index){index=boardIndex;const puzzle=pack?.puzzles[index],draft=drafts[index];if(!puzzle)return;const input=puzzle.type==='loops'?draft.edges:puzzle.type==='numbers'?draft.values:draft.values.map((v:number)=>v===1?1:0);const result=checkPractice(puzzle,input,draft.traitor);message=result.message;if(result.ok){draft.done=true;drafts=[...drafts];dialog.showModal();}}
 function markTraitor(value:string,boardIndex:number){index=boardIndex;drafts[index].traitor=drafts[index].traitor===value?'':value;save();}
 function reset(){drafts[index]=fresh(pack.puzzles[index]);drafts=[...drafts];reveal=false;message='';}
</script>

<section class="practice">
 <div class="heading"><h2>Vibhishana · Round 19</h2><a href="/wpc2026/?page=85">Booklet rules ↗</a></div>
 <div class="player-layout">
  <aside class="reminder"><details><summary>Base rules & controls</summary><p>{definition?.base}</p><p>Exactly three rules apply; mark the traitor below each puzzle. Every rule is the traitor once in the set.</p><p>Loops: drag between cell centres; right-click between centres for ×. Shading: click to shade; right-click for a light-green unshaded note. Ships: click to cycle ship, ×, blank. Numbers: select a cell and use the keypad or keyboard; switch to Center marks (M) for pencilmarks.</p><p>Clues are black. Shading regions have bold rectangular borders. Ships are straight. A circle is a one-cell ship; rounded ends and square middles show longer ships.</p></details>
   {#each definition?.rules||[] as rule,i}<section class="rule-card"><h3>Rule {i+1}</h3><VibhishanaRuleImage type={puzzle?.type||type} rule={i+1}/><p>{rule}</p></section>{/each}
  </aside>
  <div class="grid-panel">
   {#if puzzle}
    <div class="puzzle-grid">
    {#each pack.puzzles as puzzle,boardIndex}
     {@const draft=drafts[boardIndex]}
     {@const values=reveal?puzzle.answer:draft.values}
     {@const edges=puzzle.type==='loops'?(reveal?loopEdges(puzzle.answer):draft.edges):[]}
     <article class="puzzle-card" class:active-board={index===boardIndex}>
      <h3>Puzzle {boardIndex+1}{draft.done?' ✓':''}</h3>
    <div class="board-scroll"><svg viewBox={`0 0 ${2*pad+puzzle.n*unit} ${2*pad+puzzle.n*unit}`} role="group" aria-label={`Puzzle ${boardIndex+1}: ${definition.name} traitor puzzle`} oncontextmenu={event=>mark(event,boardIndex)} onpointermove={move} onpointerup={end} onpointercancel={end} onlostpointercapture={end}>
     {#each Array(puzzle.n*puzzle.n) as _,cell}
      {@const pt=centre(cell)}
      {@const clue=puzzle.clues.find((c:any)=>c.cell===cell)}
      {@const given=puzzle.givens.some((g:any)=>g.cell===cell)}
      <rect x={pt.x-unit/2} y={pt.y-unit/2} width={unit} height={unit} class="cell" class:fixed-cell={given} class:blocked={puzzle.type==='loops'&&puzzle.blocked[cell]} class:unshaded-note={puzzle.type==='shading'&&!reveal&&values[cell]===2} class:filled={puzzle.type==='shading'&&values[cell]===1} class:selected={puzzle.type==='numbers'&&index===boardIndex&&selected===cell} role="button" tabindex="0" aria-label={`Cell row ${Math.floor(cell/puzzle.n)+1}, column ${cell%puzzle.n+1}`} onclick={()=>clickCell(cell,boardIndex)} onkeydown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();clickCell(cell,boardIndex);}else keyboard(event,cell,boardIndex);}} onpointerdown={event=>start(event,cell,boardIndex)}/>
      {#if puzzle.type==='objects'&&values[cell]===1}
       {@const connections=(cell>=puzzle.n&&values[cell-puzzle.n]===1?1:0)|(cell%puzzle.n<puzzle.n-1&&values[cell+1]===1?2:0)|(cell<puzzle.n*(puzzle.n-1)&&values[cell+puzzle.n]===1?4:0)|(cell%puzzle.n>0&&values[cell-1]===1?8:0)}
       <ShipGlyph x={pt.x} y={pt.y} size={unit} {connections}/>
      {/if}
      {#if puzzle.type==='numbers'&&values[cell]}<text x={pt.x} y={pt.y} class:given class="digit">{values[cell]}</text>{/if}
      {#if puzzle.type==='numbers'&&!reveal&&!values[cell]&&draft.marks[cell].length}<text x={pt.x} y={pt.y} class="center-marks">{draft.marks[cell].join('')}</text>{/if}
      {#if puzzle.type==='objects'&&!reveal&&values[cell]===2}<text x={pt.x} y={pt.y} class:given class="cross">×</text>{/if}
      {#if clue}
       {#if puzzle.type==='shading'}<circle cx={pt.x} cy={pt.y} r="18" class="circle white"/>{/if}
       <text x={pt.x} y={pt.y} class="clue">{clue.value}</text>
      {/if}
      {#if puzzle.type==='loops'&&!puzzle.blocked[cell]}<circle cx={pt.x} cy={pt.y} r="3" class="point"/>{/if}
     {/each}
     {#if puzzle.type==='shading'}
      {#each puzzle.regions as region}
       <rect x={pad+region.c*unit} y={pad+region.r*unit} width={region.width*unit} height={region.height*unit} class="region-border"/>
       <text x={pad+region.c*unit+6} y={pad+region.r*unit+12} class="region-clue">{region.value}</text>
      {/each}
     {/if}
     {#each puzzle.outside as clue}
      {@const x=clue.side==='left'?pad/2:clue.side==='right'?pad+puzzle.n*unit+pad/2:pad+(clue.index+.5)*unit}
      {@const y=clue.side==='top'?pad/2:clue.side==='bottom'?pad+puzzle.n*unit+pad/2:pad+(clue.index+.5)*unit}
      <text {x} {y} class="clue">{clue.value}</text>
     {/each}
     {#each puzzle.cages as [a,b]}
      {@const pa=centre(a)}{@const pb=centre(b)}
      <rect x={Math.min(pa.x,pb.x)-unit/2+5} y={Math.min(pa.y,pb.y)-unit/2+5} width={Math.abs(pa.x-pb.x)+unit-10} height={Math.abs(pa.y-pb.y)+unit-10} class="cage"/>
     {/each}
     {#each puzzle.inequalities as [a,b]}{@const pa=centre(a)}{@const pb=centre(b)}<text x={(pa.x+pb.x)/2} y={(pa.y+pb.y)/2} class="inequality">{pa.y===pb.y?(pa.x<pb.x?'‹':'›'):(pa.y<pb.y?'∧':'∨')}</text>{/each}
     {#if puzzle.type==='loops'&&!reveal}{#each draft.crosses as edge}{@const [a,b]=edge.split(',').map(Number)}{@const pa=centre(a)}{@const pb=centre(b)}{@const x=(pa.x+pb.x)/2}{@const y=(pa.y+pb.y)/2}<path d={`M${x-5} ${y-5}L${x+5} ${y+5}M${x+5} ${y-5}L${x-5} ${y+5}`} class="edge-cross"/>{/each}{/if}
     {#each edges as edge}{@const [a,b]=edge.split(',').map(Number)}{@const pa=centre(a)}{@const pb=centre(b)}<line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} class="answer" class:fixed={puzzle.givens.some((g:any)=>g.edge===edge)}/>{/each}
     {#each Object.entries(puzzle.circles) as [cell,color]}{@const pt=centre(Number(cell))}{#if puzzle.type==='loops'||!puzzle.clues.some((c:any)=>c.cell===Number(cell))}<circle cx={pt.x} cy={pt.y} r={puzzle.type==='shading'?18:9} class={`circle ${color}`}/>{/if}{/each}
     {#if index===boardIndex&&drag!==null&&ghost}{@const pt=centre(drag)}<line x1={pt.x} y1={pt.y} x2={ghost.x} y2={ghost.y} class="ghost"/>{/if}
    </svg></div>
      <div class="traitor-toggles" role="group" aria-label={`Puzzle ${boardIndex+1} traitor rule`}>
       {#each [1,2,3,4] as rule}<button aria-pressed={draft.traitor===String(rule)} class:marked={draft.traitor===String(rule)} onclick={()=>markTraitor(String(rule),boardIndex)} disabled={busy||reveal}>Rule {rule}</button>{/each}
      </div>
      <div class="puzzle-actions"><span>{reveal?`Traitor: Rule ${puzzle.traitor}`:'Mark the traitor rule'}</span><button onclick={()=>check(boardIndex)} disabled={busy||reveal}>Check puzzle</button></div>
     </article>
    {/each}
    </div>
   {:else}<p role="status">{message}</p>{/if}
  </div>
  <aside class="controls">
   <label>Practice set<select bind:value={type} onchange={event=>{type=event.currentTarget.value;generate();}} disabled={busy}>{#each sets as s}<option value={s.id}>{s.name}</option>{/each}</select></label>
   <label>Grid size<select bind:value={size} onchange={event=>{size=Number(event.currentTarget.value);generate();}} disabled={busy}><option value={6}>6×6</option><option value={8}>8×8</option></select></label>
   <button onclick={generate} disabled={busy}>New set · 4 puzzles</button>
   {#if puzzle?.type==='objects'}<div class="fleet"><strong>Fleet</strong><svg viewBox={`0 0 120 ${puzzle.fleet.length*24+8}`} role="img" aria-label={puzzle.n===8?"Fleet: one length 4, one length 3, two length 2, three length 1 ships":"Fleet: one length 3, two length 2, three length 1 ships"}>{#each puzzle.fleet as length,i}{#each Array(length) as _,j}<ShipGlyph x={18+j*28} y={14+i*24} size={24} connections={length===1?0:j===0?2:j===length-1?8:10}/>{/each}{/each}</svg></div>{/if}
   {#if puzzle?.type==='numbers'}<div class="number-modes" role="group" aria-label="Number input mode"><button class:mode-active={numberMode==='answer'} aria-pressed={numberMode==='answer'} onclick={()=>numberMode='answer'}>Answer</button><button class:mode-active={numberMode==='center'} aria-pressed={numberMode==='center'} onclick={()=>numberMode='center'}>Center marks</button></div><div class="keypad">{#each Array.from({length:puzzle.n},(_,i)=>i+1) as digit}<button onclick={()=>enter(digit)} disabled={busy||reveal}>{digit}</button>{/each}<button onclick={()=>enter(0)} disabled={busy||reveal}>⌫</button></div>{/if}
   <p class="hint">Active board: Puzzle {index+1}</p>
   <button onclick={reset} disabled={busy||!puzzle}>Clear active answer</button>
   <label class="reveal"><input type="checkbox" bind:checked={reveal} disabled={busy||!puzzle}/> Reveal solution</label>
   <p role="status" class="status">{message}</p>
   {#if pack}<p class="hint">{drafts.filter(d=>d.done).length}/4 completed · seed {pack.seed}</p>{/if}
  </aside>
 </div>
 <dialog bind:this={dialog}><h2>{drafts.length&&drafts.every(d=>d.done)?'Set complete!':'Puzzle complete!'}</h2><p>{drafts.every(d=>d.done)?'All four puzzles and traitor rules are correct.':'Your answer and traitor rule are correct.'}</p><form method="dialog"><button>Continue</button></form></dialog>
</section>

<style>
 .practice{color:#20382e}.heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.heading h2{font-size:20px;margin:0}.heading a{font-size:12px;color:#315e43}.player-layout{display:grid;grid-template-columns:170px minmax(0,1fr) 170px;gap:14px;align-items:start}.grid-panel{min-width:0}.reminder,.controls{background:white;border:1px solid #dce1d6;border-radius:9px;padding:12px}.reminder summary{font-weight:700;cursor:pointer;font-size:13px}.reminder p,.hint{font-size:12px;line-height:1.6;color:#697467}.controls{display:flex;flex-direction:column;gap:10px}.controls label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:600}.controls .reveal{flex-direction:row;align-items:center}.controls input{accent-color:#244d3b}button,select{font:inherit;border:1px solid #c5cec4;border-radius:7px;background:white;color:#20382e;padding:8px;cursor:pointer}button:disabled{opacity:.5;cursor:wait}.board-scroll{overflow:auto;background:white;border:1px solid #dce1d6;border-radius:10px;padding:8px}svg{display:block;width:100%;min-width:280px;max-width:620px;margin:auto;touch-action:none;user-select:none;-webkit-user-select:none}.cell{fill:white;stroke:#acbcae;stroke-width:1;cursor:pointer}.cell.blocked{fill:#c7ccc8}.cell.filled{fill:#54775d}.cell.filled.fixed-cell{fill:#20382e}.cell.selected{stroke:#dcae45;stroke-width:3}.cell:focus-visible{outline:none;stroke:#315e43;stroke-width:3}.digit,.clue,.cross,.inequality{text-anchor:middle;dominant-baseline:middle;font:24px Arial;fill:#2875ae;pointer-events:none}.given,.clue{fill:#20382e}.cross{font-size:22px}.circle{stroke:#20382e;stroke-width:2;pointer-events:none}.circle.white{fill:white}.circle.black{fill:#20382e}.point{fill:#95a397;pointer-events:none}.answer{stroke:#2875ae;stroke-width:5;stroke-linecap:round;pointer-events:none}.answer.fixed{stroke:#20382e}.ghost{stroke:#2875ae;stroke-width:4;stroke-dasharray:7 5;opacity:.5;pointer-events:none}.region-border{fill:none;stroke:#20382e;stroke-width:2;pointer-events:none}.region-clue{font:12px Arial;fill:#20382e;pointer-events:none}.cage{fill:none;stroke:#20382e;stroke-width:1.5;stroke-dasharray:4 3;pointer-events:none}.inequality{fill:#20382e;stroke:white;stroke-width:3;paint-order:stroke fill}.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.status{font-size:12px;line-height:1.6;overflow-wrap:anywhere}.fleet{font-size:12px;margin:0}dialog{border:1px solid #c5cec4;border-radius:14px;padding:28px;color:#20382e;max-width:calc(100vw - 32px)}dialog::backdrop{background:#10251c88}dialog h2{font-size:22px}
 .puzzle-grid{display:grid;grid-template-columns:repeat(4,minmax(260px,1fr));gap:12px}.puzzle-card{min-width:0;border:1px solid #dce1d6;border-radius:10px;background:white;padding:9px}.puzzle-card h3{font-size:14px;margin:0 0 7px}.puzzle-card.active-board{border-color:#85a48a}.traitor-toggles{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px}.traitor-toggles button{font-size:11px;padding:6px 2px}.traitor-toggles .marked{background:#fff2bf;border-color:#c6a84f}.puzzle-actions{display:flex;align-items:center;justify-content:space-between;gap:5px;margin-top:7px}.puzzle-actions span{font-size:10px;color:#697467}.puzzle-actions button{font-size:11px}.rule-card{border-top:1px solid #dce1d6;margin-top:12px;padding-top:10px}.rule-card h3{font-size:13px;margin:0}.rule-card p{margin:4px 0;font-size:11px;line-height:1.5}.board-scroll{padding:0;border:0}.grid-panel svg{min-width:240px}.player-layout{grid-template-columns:170px minmax(0,1fr) 160px}
 .cell.unshaded-note{fill:#dcefd7}.edge-cross{fill:none;stroke:#8b5148;stroke-width:2;pointer-events:none}.center-marks{font:12px Arial;text-anchor:middle;dominant-baseline:middle;fill:#2875ae;pointer-events:none}.number-modes{display:flex;gap:5px}.number-modes button{flex:1;font-size:12px}.number-modes .mode-active{background:#dcefd7;border-color:#315e43}
 .fleet strong{display:block;font-size:12px}.fleet svg{min-width:0;width:100%;max-width:130px;touch-action:auto}
 .player-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
 .controls{grid-column:1;grid-row:1;display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:10px 12px}
 .controls label{flex-direction:row;align-items:center;gap:8px}.controls select{min-width:110px}.controls .hint,.controls .status{margin:0}.controls .status{flex:1;min-width:220px}.controls .keypad{display:flex;gap:4px}.controls .keypad button{min-width:32px;padding:8px}.controls .fleet{display:flex;align-items:center;gap:8px}.controls .fleet svg{width:70px;height:96px;max-width:none}.controls .number-modes{flex:none}
 .reminder{grid-column:1;grid-row:2;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:10px 12px}.reminder>details{grid-column:1/-1}.reminder details p{margin:6px 0}.rule-card{display:grid;grid-template-columns:74px minmax(0,1fr);gap:4px 8px;margin:0;padding:8px 0 0}.rule-card h3{grid-column:2;grid-row:1}.rule-card :global(svg){grid-column:1;grid-row:1/3;margin:0}.rule-card p{grid-column:2;grid-row:2;margin:0}
 .grid-panel{grid-column:1;grid-row:3;overflow-x:auto;padding-bottom:8px}.puzzle-grid{width:100%;min-width:1076px}.grid-panel svg{min-width:0}.puzzle-card{padding:8px}.heading{margin-bottom:10px}
 @media(max-width:800px){.reminder{grid-template-columns:repeat(2,minmax(0,1fr))}.controls label{flex-direction:column;align-items:start;gap:4px}.controls .keypad{flex-wrap:wrap}.controls .status{flex-basis:100%}.grid-panel{scroll-snap-type:x proximity}.puzzle-card{scroll-snap-align:start}}
</style>
