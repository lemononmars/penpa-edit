<script lang="ts">
  import { onMount } from 'svelte';
  import { clueHolds, validateDrawnLoop } from './wpc2026/miniLaxman.mjs';

  let size = 5;
  let puzzle: any = null;
  let drawn = new Set<string>();
  let crosses = new Set<string>();
  let cellMarks: Record<string, number> = {};
  let complete = false;
  let completionDialog: HTMLDialogElement;
  let busy = false;
  let message = '';
  let wrong: any = null;
  let reveal = false;
  let worker: Worker | null = null;
  let board: SVGSVGElement;
  let dragPoint: {r:number,c:number} | null = null;
  let ghost: {x:number,y:number} | null = null;
  let erase: boolean | null = null;
  let visited = new Set<string>();
  const unit = 54, pad = 35;
  function blocked(edge:string){return puzzle?.clues.some((clue:any)=>clue.type==='parallel'&&`${clue.axis}:${clue.r},${clue.c}`===edge);}
  function beginDrag(event: PointerEvent,r:number,c:number){
    if(!puzzle||busy||reveal||event.button!==0)return;
    event.preventDefault();board.setPointerCapture(event.pointerId);
    dragPoint={r,c};ghost={x:pad+c*unit,y:pad+r*unit};erase=null;visited=new Set();
  }
  function moveDrag(event: PointerEvent){
    if(!dragPoint)return;
    const p=board.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
    const xy=p.matrixTransform(board.getScreenCTM()!.inverse());ghost={x:xy.x,y:xy.y};
    const r=Math.round((xy.y-pad)/unit),c=Math.round((xy.x-pad)/unit);
    if(r<0||c<0||r>size||c>size||Math.hypot(xy.x-pad-c*unit,xy.y-pad-r*unit)>unit*.3)return;
    if(r!==dragPoint.r&&c!==dragPoint.c)return;
    const dr=Math.sign(r-dragPoint.r),dc=Math.sign(c-dragPoint.c),next=new Set(drawn);
    while(dragPoint.r!==r||dragPoint.c!==c){
      const rr=dragPoint.r+dr,cc=dragPoint.c+dc;
      const edge=dr?`V:${Math.min(rr,dragPoint.r)},${c}`:`H:${r},${Math.min(cc,dragPoint.c)}`;
      if(blocked(edge)){ghost=null;dragPoint={r:rr,c:cc};continue;}
      if(erase===null)erase=next.has(edge);
      if(!visited.has(edge)){if(erase)next.delete(edge);else {next.add(edge);crosses.delete(edge);}visited.add(edge);}
      dragPoint={r:rr,c:cc};
    }
    drawn=next;crosses=new Set(crosses);wrong=null;message='';
  }
  function endDrag(){
    const wasDrawing=!!dragPoint;dragPoint=null;ghost=null;
    if(wasDrawing && !busy && puzzle && !reveal){
      const result:any=validateDrawnLoop(drawn,puzzle.size);
      if(result.ok && puzzle.clues.every((clue:any)=>clueHolds(clue,result.cells,puzzle.size,result.edges)))check();
    }
  }
  function markCross(event: MouseEvent){
    event.preventDefault();if(!puzzle||busy||reveal)return;
    const p=board.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
    const xy=p.matrixTransform(board.getScreenCTM()!.inverse());
    const rr=(xy.y-pad)/unit,cc=(xy.x-pad)/unit;
    const horizontal=Math.abs(rr-Math.round(rr))<Math.abs(cc-Math.round(cc));
    const r=horizontal?Math.round(rr):Math.floor(rr),c=horizontal?Math.floor(cc):Math.round(cc);
    if(r<0||c<0||r>(horizontal?size:size-1)||c>(horizontal?size-1:size))return;
    const edge=`${horizontal?'H':'V'}:${r},${c}`;
    if(blocked(edge))return;
    const next=new Set(crosses);if(next.has(edge))next.delete(edge);else next.add(edge);
    crosses=next;const lines=new Set(drawn);lines.delete(edge);drawn=lines;
  }

  $: displayed = reveal && puzzle ? new Set<string>(puzzle.solution) : drawn;
  $: cellClues = puzzle ? puzzle.clues.filter((clue: any) => ['sheep','polygraph','myopia','sight'].includes(clue.type)) : [];
  $: pointClues = puzzle ? puzzle.clues.filter((clue: any) => clue.type === 'kurarin') : [];
  $: edgeClues = puzzle ? puzzle.clues.filter((clue: any) => clue.type === 'parallel') : [];

  function generate() {
    if (!worker) return;
    busy = true; endDrag(); complete=false; wrong = null; reveal = false;
    message = `Constructing and checking a ${size}×${size} puzzle…`;
    worker.postMessage({ size, seed: Math.floor(Math.random() * 0xffffffff) });
  }
  onMount(() => {
    worker = new Worker(new URL('./wpc2026/miniLaxman.worker.mjs', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      busy = false;
      if (data.error) { message = data.error; return; }
      drawn = new Set(); crosses = new Set(); cellMarks = {}; complete = false; puzzle = data.puzzle;
      message = `Unique puzzle ready · ${puzzle.clues.length} clues · seed ${puzzle.seed}`;
    };
    worker.onerror = () => { busy = false; message = 'Generation failed. Try another puzzle.'; };
    generate();
    return () => worker?.terminate();
  });
  function toggle(edge: string) {
    if (!puzzle || busy || reveal) return;
    if(blocked(edge))return;
    const next = new Set(drawn);
    if (next.has(edge)) next.delete(edge); else {next.add(edge); const marks=new Set(crosses);marks.delete(edge);crosses=marks;}
    drawn = next; wrong = null; message = '';
  }
  function toggleKey(event: KeyboardEvent, edge: string) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(edge); }
  }
  function check() {
    if (!puzzle) return;
    wrong = null;
    const result: any = validateDrawnLoop(drawn, puzzle.size);
    if (!result.ok) { message = result.message; return; }
    for (const clue of puzzle.clues) {
      if (!clueHolds(clue, result.cells, puzzle.size, result.edges)) {
        wrong = clue;
        message = `Incorrect ${label(clue)} clue near row ${clue.r + 1}, column ${clue.c + 1}.`;
        return;
      }
    }
    message = 'Correct! The loop satisfies every clue.';
    complete = true; completionDialog.showModal();
  }
  function markCell(r:number,c:number){
    if(busy||reveal)return;
    const key=`${r},${c}`;cellMarks={...cellMarks,[key]:((cellMarks[key]||0)+1)%3};
  }
  function label(clue: any) { return ({ sheep: 'Sheep / Wolf', polygraph: 'Polygraph', myopia: 'Myopia', sight: 'Line of Sight', kurarin: 'Kurarin', parallel: 'Parallel Counts' } as any)[clue.type]; }
  function clueText(clue: any) {
    if (clue.type === 'myopia') return clue.value;
    return clue.value;
  }
  function edgeCoords(edge: string) {
    const [axis, coordinates] = edge.split(':'), [r, c] = coordinates.split(',').map(Number);
    return axis === 'H'
      ? { x1: pad + c * unit, y1: pad + r * unit, x2: pad + (c + 1) * unit, y2: pad + r * unit }
      : { x1: pad + c * unit, y1: pad + r * unit, x2: pad + c * unit, y2: pad + (r + 1) * unit };
  }
</script>

<section class="practice">
  <div class="intro"><h2>Laxman Rekha</h2><a href="/wpc2026/?page=45">Rules ↗</a></div>
  <div class="player-layout">
    <aside class="rule-reminder">
      <details><summary>Rule reminder</summary>
        <p>Draw one closed loop on grid edges. Drag between dots; right-click an edge for ×. Click cells to cycle green, yellow, and clear.</p>
        <p><strong>Myopia:</strong> arrows point to the nearest visible loop segments inside; farthest outside.</p>
        <p><strong>Line of Sight:</strong> the indicated segment’s length is exact inside, off by one outside.</p>
        <p><strong>Polygraph:</strong> counts used cell edges inside; unused edges outside.</p>
        <p><strong>Parallel Counts:</strong> count parallel unused edges on both sides, including unused grid boundaries. Equal inside, unequal outside; the square gives their sum.</p>
        <p><strong>Sheep / Wolf:</strong> S inside, W outside.</p>
        <p><strong>Kurarin:</strong> white touches more inside cells; black more outside; grey equal.</p>
      </details>
    </aside>
    <div class="grid-panel">
  {#if puzzle}
    <div class="board-scroll">
      <svg bind:this={board} oncontextmenu={markCross} onpointermove={moveDrag} onpointerup={endDrag} onpointercancel={endDrag} onlostpointercapture={endDrag} class="board" viewBox={`0 0 ${2 * pad + size * unit} ${2 * pad + size * unit}`} role="group" aria-label={`${size} by ${size} Laxman Rekha practice grid`}>
        <rect x={pad} y={pad} width={size * unit} height={size * unit} fill="white" />
        {#each Array(size) as _, r}{#each Array(size) as _, c}
          <rect x={pad+c*unit+1} y={pad+r*unit+1} width={unit-2} height={unit-2} class="cell-mark" class:inside-mark={cellMarks[`${r},${c}`]===1} class:outside-mark={cellMarks[`${r},${c}`]===2} role="button" tabindex="0" aria-label={`Mark cell row ${r+1}, column ${c+1}`} title="Cycle light green, light yellow, and no shading" onclick={()=>markCell(r,c)} onkeydown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();markCell(r,c);}}}/>
        {/each}{/each}
        {#each Array(size + 1) as _, r}
          <line x1={pad} y1={pad + r * unit} x2={pad + size * unit} y2={pad + r * unit} class="gridline" />
          <line x1={pad + r * unit} y1={pad} x2={pad + r * unit} y2={pad + size * unit} class="gridline" />
        {/each}
        {#each [...displayed] as edge}
          {@const coords = edgeCoords(edge)}
          <line {...coords} class="answer" />
        {/each}
        {#if !reveal}{#each [...crosses] as edge}
          {@const coords=edgeCoords(edge)}
          {@const cx=(coords.x1+coords.x2)/2}
          {@const cy=(coords.y1+coords.y2)/2}
          <path d={`M ${cx-5} ${cy-5} L ${cx+5} ${cy+5} M ${cx+5} ${cy-5} L ${cx-5} ${cy+5}`} class="cross" />
        {/each}{/if}
        {#if wrong}
          <rect x={pad + (wrong.type === 'kurarin' ? wrong.c - .5 : wrong.c) * unit + 3} y={pad + (wrong.type === 'kurarin' ? wrong.r - .5 : wrong.r) * unit + 3} width={wrong.type === 'kurarin' ? unit : unit - 6} height={wrong.type === 'kurarin' ? unit : unit - 6} class="wrong" />
        {/if}
        {#each cellClues as clue}
          {#if clue.type === 'sight'}
            {@const horizontal = clue.dir === 1 || clue.dir === 2}
            {@const cx = pad + (clue.c + .5) * unit}
            {@const cy = pad + (clue.r + .5) * unit}
            <text x={cx + (horizontal ? 0 : -7)} y={cy + (horizontal ? 7 : 0)} class="cell-clue">{clue.value}</text>
            <path d={horizontal
              ? `M ${cx-16} ${cy-14} H ${cx+16} M ${cx+(clue.dir===1?-10:10)} ${cy-20} L ${cx+(clue.dir===1?-16:16)} ${cy-14} L ${cx+(clue.dir===1?-10:10)} ${cy-8}`
              : `M ${cx+13} ${cy-16} V ${cy+16} M ${cx+7} ${cy+(clue.dir===0?-10:10)} L ${cx+13} ${cy+(clue.dir===0?-16:16)} L ${cx+19} ${cy+(clue.dir===0?-10:10)}`} class="sight-arrow" />
          {:else if clue.type === 'myopia'}
            {#each [['↑',0,-.32],['←',-.32,0],['→',.32,0],['↓',0,.32]] as arrow}
              {#if clue.value.includes(arrow[0])}<text x={pad+(clue.c+.5+Number(arrow[1]))*unit} y={pad+(clue.r+.5+Number(arrow[2]))*unit} class="cell-clue arrows">{arrow[0]}</text>{/if}
            {/each}
          {:else}
          <text x={pad + (clue.c + .5) * unit} y={pad + (clue.r + .5) * unit} class:polygraph={clue.type === 'polygraph'} class:arrows={clue.type === 'myopia'} class="cell-clue">{clueText(clue)}</text>
          {/if}
        {/each}
        {#each edgeClues as clue}
          <rect x={pad + (clue.axis === 'H' ? clue.c + .5 : clue.c) * unit - 8} y={pad + (clue.axis === 'H' ? clue.r : clue.r + .5) * unit - 8} width="16" height="16" class="square" />
          <text x={pad + (clue.axis === 'H' ? clue.c + .5 : clue.c) * unit} y={pad + (clue.axis === 'H' ? clue.r : clue.r + .5) * unit} class="square-number">{clue.value}</text>
        {/each}
        {#each pointClues as clue}
          <circle cx={pad + clue.c * unit} cy={pad + clue.r * unit} r="9" class={`dot ${clue.value}`} />
        {/each}
        {#if dragPoint && ghost}<line x1={pad+dragPoint.c*unit} y1={pad+dragPoint.r*unit} x2={ghost.x} y2={ghost.y} class="ghost" />{/if}
        {#each Array(size + 1) as _, r}{#each Array(size + 1) as _, c}
          <circle cx={pad+c*unit} cy={pad+r*unit} r="3" class="gridpoint" />
          <circle cx={pad+c*unit} cy={pad+r*unit} r="12" class="hit" role="button" tabindex="0" aria-label={`Grid point row ${r+1}, column ${c+1}`} onpointerdown={event=>beginDrag(event,r,c)} onkeydown={event=>{if(c<size)toggleKey(event,`H:${r},${c}`);}} />
        {/each}{/each}
      </svg>
    </div>
  {/if}
    </div>
    <aside class="control-panel">
  <div class="controls">
    <label>Grid size <select bind:value={size} onchange={generate} disabled={busy}><option value={5}>5×5</option><option value={8}>8×8</option><option value={10}>10×10</option></select></label>
    <button onclick={generate} disabled={busy}>New puzzle</button>
    <button onclick={check} disabled={busy || !puzzle}>Check</button>
    <button onclick={() => { drawn = new Set(); crosses = new Set(); wrong = null; message = ''; reveal = false; }} disabled={busy || !puzzle}>Clear loop</button>
    <label class="reveal"><input type="checkbox" bind:checked={reveal} disabled={busy || !puzzle} /> Reveal solution</label>
  </div>
  <p class="status" role="status">{message}</p>
      <p class="generation-note">Generated puzzles have a proven unique loop.</p>
    </aside>
  </div>
  <dialog bind:this={completionDialog} class="completion-dialog" onclose={()=>complete=false}>
    {#if complete}<h2>Puzzle complete!</h2><p>Your loop satisfies every clue.</p>{/if}
    <form method="dialog"><button>Continue</button></form>
  </dialog>
</section>

<style>
  .board{user-select:none;-webkit-user-select:none}.gridline{pointer-events:none}.cell-mark{fill:transparent;cursor:pointer}.cell-mark.inside-mark{fill:#dcefd7}.cell-mark.outside-mark{fill:#fff2bf}.cell-mark:focus-visible{stroke:#315e43;stroke-width:2}.completion-dialog{border:1px solid #c5cec4;border-radius:14px;padding:28px;color:#20382e;max-width:calc(100vw - 32px)}.completion-dialog::backdrop{background:#10251c88}.completion-dialog h2{margin-top:0}.completion-dialog button{border:0;border-radius:7px;background:#244d3b;color:white;padding:10px 20px;cursor:pointer}.cross{fill:none;stroke:#8b5148;stroke-width:2;pointer-events:none}.practice{color:#20382e}.intro{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:6px}.intro h2{font-size:20px;font-weight:600;letter-spacing:-.03em;margin:0 0 7px}.intro a{font-size:13px;white-space:nowrap;color:#315e43}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:700;color:#6a7869;margin:0 0 8px}.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.controls>label:first-child{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700}.controls select,.controls button{border:1px solid #c5cec4;border-radius:7px;background:#fff;color:#20382e;padding:9px 12px;font:inherit}.controls button{cursor:pointer}.controls button:hover:not(:disabled){background:#e8ede4}.controls button:disabled{opacity:.5;cursor:wait}.reveal{display:flex;align-items:center;gap:7px;font-size:13px;margin-left:auto}.reveal input{accent-color:#244d3b}.status{min-height:22px;color:#315e43;font-size:13px;font-weight:600;margin:13px 0}.board-scroll{overflow:auto;background:#fff;border:1px solid #dce1d6;border-radius:10px;padding:12px}.board{display:block;width:min(100%,680px);min-width:360px;margin:auto;touch-action:none}.sight-arrow{fill:none;stroke:#20382e;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.ghost{stroke:#244d3b;stroke-width:4;stroke-dasharray:7 5;opacity:.5;pointer-events:none}.gridpoint{fill:#879587;pointer-events:none}.gridline{stroke:#b8c8b8;stroke-width:1}.hit{fill:rgba(0,0,0,.001);cursor:pointer}.hit:hover,.hit:focus-visible{fill:#9cc6a6;fill-opacity:.45}.answer{stroke:#244d3b;stroke-width:5;stroke-linecap:round;pointer-events:none}.cell-clue,.square-number{font-family:Inter,Arial,sans-serif;font-size:23px;font-weight:700;fill:#20382e;text-anchor:middle;dominant-baseline:middle;pointer-events:none}.cell-clue.polygraph{fill:#747d78}.cell-clue.arrows{font-size:18px;stroke:#20382e;stroke-width:.9;paint-order:stroke fill}.square{fill:#fff;stroke:#20382e;stroke-width:2;pointer-events:none}.square-number{font-size:12px}.dot{stroke:#20382e;stroke-width:2;pointer-events:none}.dot.white{fill:#fff}.dot.grey{fill:#a6aaa7}.dot.black{fill:#20382e}.wrong{fill:#f5b9a6;fill-opacity:.5;stroke:#ba492b;stroke-width:2;pointer-events:none}@media(max-width:700px){.intro{display:block}.intro a{display:inline-block;margin-top:10px}.reveal{margin-left:0;width:100%}}

  .player-layout{display:grid;grid-template-columns:minmax(130px,170px) minmax(0,1fr) 160px;gap:14px;align-items:start}
  .grid-panel{min-width:0}.rule-reminder,.control-panel{background:#fff;border:1px solid #dce1d6;border-radius:9px;padding:12px}
  .rule-reminder summary{cursor:pointer;font-size:13px;font-weight:700}.rule-reminder p,.generation-note{font-size:12px;line-height:1.6;color:#697467}
  .control-panel .controls{display:flex;flex-direction:column;align-items:stretch;gap:10px}.control-panel .controls>label:first-child{flex-direction:column;align-items:stretch}.control-panel .reveal{margin-left:0}.control-panel .status{overflow-wrap:anywhere;font-size:12px}.grid-panel .board{min-width:280px}
  @media(max-width:1100px){.player-layout{grid-template-columns:minmax(0,1fr) 160px}.rule-reminder{grid-column:1 / -1}.control-panel{grid-column:2;grid-row:2}.grid-panel{grid-column:1;grid-row:2}}
  @media(max-width:650px){.player-layout{grid-template-columns:minmax(0,1fr)}.rule-reminder,.grid-panel,.control-panel{grid-column:1;grid-row:auto}.control-panel .controls{display:grid;grid-template-columns:1fr 1fr}.control-panel .controls>label:first-child,.control-panel .reveal{grid-column:1 / -1}}
</style>
