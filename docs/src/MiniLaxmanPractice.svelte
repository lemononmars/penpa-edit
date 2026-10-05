<script lang="ts">
  import { onMount } from 'svelte';
  import { clueHolds, validateDrawnLoop } from './wpc2026/miniLaxman.mjs';

  let size = 5;
  let puzzle: any = null;
  let drawn = new Set<string>();
  let busy = false;
  let message = '';
  let wrong: any = null;
  let reveal = false;
  let worker: Worker | null = null;
  const unit = 54, pad = 35;
  $: displayed = reveal && puzzle ? new Set<string>(puzzle.solution) : drawn;
  $: cellClues = puzzle ? puzzle.clues.filter((clue: any) => ['sheep','polygraph','myopia','sight'].includes(clue.type)) : [];
  $: pointClues = puzzle ? puzzle.clues.filter((clue: any) => clue.type === 'kurarin') : [];
  $: edgeClues = puzzle ? puzzle.clues.filter((clue: any) => clue.type === 'parallel') : [];

  function generate() {
    if (!worker) return;
    busy = true; puzzle = null; drawn = new Set(); wrong = null; reveal = false;
    message = `Constructing and checking a ${size}×${size} puzzle…`;
    worker.postMessage({ size, seed: Math.floor(Math.random() * 0xffffffff) });
  }
  onMount(() => {
    worker = new Worker(new URL('./wpc2026/miniLaxman.worker.mjs', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      busy = false;
      if (data.error) { message = data.error; return; }
      puzzle = data.puzzle;
      message = `Unique puzzle ready · ${puzzle.clues.length} clues · seed ${puzzle.seed}`;
    };
    worker.onerror = () => { busy = false; message = 'Generation failed. Try another puzzle.'; };
    generate();
    return () => worker?.terminate();
  });
  function toggle(edge: string) {
    if (!puzzle || reveal) return;
    const next = new Set(drawn);
    if (next.has(edge)) next.delete(edge); else next.add(edge);
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
  }
  function label(clue: any) { return ({ sheep: 'Sheep / Wolf', polygraph: 'Polygraph', myopia: 'Myopia', sight: 'Line of Sight', kurarin: 'Kurarin', parallel: 'Parallel Counts' } as any)[clue.type]; }
  function clueText(clue: any) {
    if (clue.type === 'sight') return `${clue.value}${['↑','←','→','↓'][clue.dir]}`;
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
  <div class="intro">
    <div><p class="eyebrow">ROUND 10 · MINI PRACTICE</p><h2>Laxman Rekha</h2><p>Draw one closed loop along the grid lines. Click an edge to add or erase it.</p></div>
    <a href="/wpc2026/?page=45">Full rules and example ↗</a>
  </div>
  <div class="controls">
    <label>Grid size <select bind:value={size} onchange={generate} disabled={busy}><option value={5}>5×5</option><option value={8}>8×8</option><option value={10}>10×10</option></select></label>
    <button onclick={generate} disabled={busy}>New puzzle</button>
    <button onclick={check} disabled={busy || !puzzle}>Check</button>
    <button onclick={() => { drawn = new Set(); wrong = null; message = ''; reveal = false; }} disabled={busy || !puzzle}>Clear loop</button>
    <label class="reveal"><input type="checkbox" bind:checked={reveal} disabled={busy || !puzzle} /> Reveal solution</label>
  </div>
  <p class="status" role="status">{message}</p>
  {#if puzzle}
    <div class="board-scroll">
      <svg class="board" viewBox={`0 0 ${2 * pad + size * unit} ${2 * pad + size * unit}`} role="group" aria-label={`${size} by ${size} Laxman Rekha practice grid`}>
        <rect x={pad} y={pad} width={size * unit} height={size * unit} fill="white" />
        {#each Array(size + 1) as _, r}
          <line x1={pad} y1={pad + r * unit} x2={pad + size * unit} y2={pad + r * unit} class="gridline" />
          <line x1={pad + r * unit} y1={pad} x2={pad + r * unit} y2={pad + size * unit} class="gridline" />
        {/each}
        {#each [...displayed] as edge}
          {@const coords = edgeCoords(edge)}
          <line {...coords} class="answer" />
        {/each}
        {#if wrong}
          <rect x={pad + (wrong.type === 'kurarin' ? wrong.c - .5 : wrong.c) * unit + 3} y={pad + (wrong.type === 'kurarin' ? wrong.r - .5 : wrong.r) * unit + 3} width={wrong.type === 'kurarin' ? unit : unit - 6} height={wrong.type === 'kurarin' ? unit : unit - 6} class="wrong" />
        {/if}
        {#each cellClues as clue}
          <text x={pad + (clue.c + .5) * unit} y={pad + (clue.r + .5) * unit} class:polygraph={clue.type === 'polygraph'} class:arrows={clue.type === 'myopia'} class="cell-clue">{clueText(clue)}</text>
        {/each}
        {#each edgeClues as clue}
          <rect x={pad + (clue.axis === 'H' ? clue.c + .5 : clue.c) * unit - 8} y={pad + (clue.axis === 'H' ? clue.r : clue.r + .5) * unit - 8} width="16" height="16" class="square" />
          <text x={pad + (clue.axis === 'H' ? clue.c + .5 : clue.c) * unit} y={pad + (clue.axis === 'H' ? clue.r : clue.r + .5) * unit} class="square-number">{clue.value}</text>
        {/each}
        {#each pointClues as clue}
          <circle cx={pad + clue.c * unit} cy={pad + clue.r * unit} r="9" class={`dot ${clue.value}`} />
        {/each}
        {#each Array(size + 1) as _, r}
          {#each Array(size) as _, c}
            {@const edge = `H:${r},${c}`}
            <rect x={pad + c * unit + 5} y={pad + r * unit - 8} width={unit - 10} height="16" class="hit" role="button" tabindex="0" aria-label={`Horizontal edge at row ${r + 1}, column ${c + 1}`} onclick={() => toggle(edge)} onkeydown={(event) => toggleKey(event, edge)} />
          {/each}
        {/each}
        {#each Array(size) as _, r}
          {#each Array(size + 1) as _, c}
            {@const edge = `V:${r},${c}`}
            <rect x={pad + c * unit - 8} y={pad + r * unit + 5} width="16" height={unit - 10} class="hit" role="button" tabindex="0" aria-label={`Vertical edge at row ${r + 1}, column ${c + 1}`} onclick={() => toggle(edge)} onkeydown={(event) => toggleKey(event, edge)} />
          {/each}
        {/each}
      </svg>
    </div>
    <p class="board-note">Myopia arrows: nearest segment inside, farthest outside. Line of Sight: exact length inside, off by one outside. Polygraph: used edges inside, unused outside. A square counts parallel unused edges; its number is their sum. S is inside, W outside. Kurarin dots compare touching inside and outside cells.</p>
    <p class="board-note">Each puzzle starts from a generated loop. Clues are removed only when a complete search confirms the remaining clues still determine that loop uniquely.</p>
  {/if}
</section>

<style>
  .practice{color:#20382e}.intro{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:20px}.intro h2{font-size:32px;font-weight:500;letter-spacing:-.03em;margin:0 0 7px}.intro p:not(.eyebrow){color:#74806d;margin:0;line-height:1.5}.intro a{font-size:13px;white-space:nowrap;color:#315e43}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:700;color:#6a7869;margin:0 0 8px}.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.controls>label:first-child{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700}.controls select,.controls button{border:1px solid #c5cec4;border-radius:7px;background:#fff;color:#20382e;padding:9px 12px;font:inherit}.controls button{cursor:pointer}.controls button:hover:not(:disabled){background:#e8ede4}.controls button:disabled{opacity:.5;cursor:wait}.reveal{display:flex;align-items:center;gap:7px;font-size:13px;margin-left:auto}.reveal input{accent-color:#244d3b}.status{min-height:22px;color:#315e43;font-size:13px;font-weight:600;margin:13px 0}.board-scroll{overflow:auto;background:#fff;border:1px solid #dce1d6;border-radius:10px;padding:12px}.board{display:block;width:min(100%,680px);min-width:360px;margin:auto;touch-action:manipulation}.gridline{stroke:#b8c8b8;stroke-width:1}.hit{fill:rgba(0,0,0,.001);cursor:pointer}.hit:hover,.hit:focus-visible{fill:#9cc6a6;fill-opacity:.45}.answer{stroke:#244d3b;stroke-width:5;stroke-linecap:round;pointer-events:none}.cell-clue,.square-number{font-family:Inter,Arial,sans-serif;font-size:23px;font-weight:700;fill:#20382e;text-anchor:middle;dominant-baseline:middle;pointer-events:none}.cell-clue.polygraph{fill:#747d78}.cell-clue.arrows{font-size:18px}.square{fill:#fff;stroke:#20382e;stroke-width:2;pointer-events:none}.square-number{font-size:12px}.dot{stroke:#20382e;stroke-width:2;pointer-events:none}.dot.white{fill:#fff}.dot.grey{fill:#a6aaa7}.dot.black{fill:#20382e}.wrong{fill:#f5b9a6;fill-opacity:.5;stroke:#ba492b;stroke-width:2;pointer-events:none}.board-note{color:#697467;font-size:12px;line-height:1.7;max-width:760px;margin:12px 0}.board-note+.board-note{margin-top:4px}@media(max-width:700px){.intro{display:block}.intro a{display:inline-block;margin-top:10px}.reveal{margin-left:0;width:100%}}
</style>
