<script lang="ts">
 import { FLOWER_CELL_COUNT, FLOWER_LAYERS, FLOWER_CELL_UNITS, FLOWER_UNITS, flowerLabel, flowerConflicts, solveFlower, randomFlowerSolution, generateFlowerPuzzle } from './wsc2026/flowerSudoku.mjs';

 const CENTER = 400;
 const EMPTY = () => Array(FLOWER_CELL_COUNT).fill(0);
 let values = EMPTY();
 let selected = 0;
 let solution: number[] | null = null;
 let generationClues = '36';
 let activeFeature: 'solution' | 'generated' | null = null;
 let message = 'Select a cell and enter a digit. Each cell belongs to two columns and one region.';
 $: conflicts = flowerConflicts(values);
 $: selectedUnits = FLOWER_CELL_UNITS[selected] || [];
 $: highlightedCells = new Set(selectedUnits.flatMap((unitId) => FLOWER_UNITS[unitId]));
 $: labels = Array.from({ length: FLOWER_CELL_COUNT }, (_, i) => flowerLabel(i));

 function polar(radius: number, angle: number) { const rad = angle * Math.PI / 180; return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }; }
 function cellGeometry(index: number) {
  const label = labels[index] || 'A1';
  const layer = FLOWER_LAYERS.indexOf(label[0]);
  const petal = Number(label.slice(1));
  const angle = -90 + (petal - 1) * 18;
  const inner = 100 + layer * 52, outer = inner + 52;
  const halfAngle = layer === 4 ? 18 : 9;
  const center = polar((inner + outer) / 2, angle);
  const a = polar(outer, angle - halfAngle), b = polar(outer, angle + halfAngle);
  const c = polar(inner, angle + halfAngle), d = polar(inner, angle - halfAngle);
  const path = `M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y} Z`;
  return { path, center };
 }
 function select(index: number, event?: Event) {
  selected = index;
  (event?.currentTarget as SVGPathElement | undefined)?.focus();
 }
 function enter(digit: number) {
  values[selected] = digit;
  values = values.slice();
  solution = null;
  activeFeature = null;
 }
 function keydown(event: KeyboardEvent, index: number) {
  if (/^[1-9]$/.test(event.key)) { event.preventDefault(); select(index); enter(Number(event.key)); }
  else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') { event.preventDefault(); select(index); enter(0); }
  else if (event.key.startsWith('Arrow')) {
   event.preventDefault();
   const next = (index + (event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' ? -5 : 5) + FLOWER_CELL_COUNT) % FLOWER_CELL_COUNT;
   selected = next;
   document.getElementById(`flower-cell-${next}`)?.focus();
  }
 }
 function clearBoard() {
  values = EMPTY();
  selected = 0;
  solution = null;
  activeFeature = null;
  message = 'Board cleared. Select a cell and enter a digit.';
 }
 function solve() {
  const result = solveFlower(values);
  solution = result.solution;
  activeFeature = 'solution';
  if (result.status === 'solved') message = `A completion was found after ${result.nodes.toLocaleString()} search steps. Blue digits show the completion.`;
  else if (result.status === 'invalid') message = 'There are repeated digits in a row, column, or region. Fix the highlighted cells first.';
  else if (result.status === 'limit') message = 'Search limit reached. Add more digits and try again.';
  else message = 'No solution fits these entries. Check the highlighted cells.';
 }
 function makeRandomSolution() {
  const result = randomFlowerSolution();
  solution = result.solution;
  activeFeature = 'solution';
  if (solution) { values = solution.slice(); message = 'Random valid Flower Sudoku solution created.'; }
  else message = 'No solution found within the search limit.';
 }
 function generatePuzzle() {
  const result = generateFlowerPuzzle({ clues: Math.max(20, Math.min(89, Number(generationClues) || 36)) });
  if (result.puzzle) { values = result.puzzle.slice(); solution = result.solution; activeFeature = 'generated'; message = `Generated a uniquely solvable Flower Sudoku with ${result.clues} clues.`; }
  else message = 'Puzzle generation could not find a solution within the search limit.';
 }
</script>

<section class="flower-tool" aria-labelledby="flower-title">
 <header class="flower-header">
  <div><p class="eyebrow">ROUND 9 · DRAUPADI’S SWAYAMVARA</p><h2 id="flower-title">Flower Sudoku editor &amp; solver</h2><p>Fill the 90-cell flower with 1–9 once in each of its ten rows, columns, and outlined regions. Rows and columns curve around the flower in opposite directions.</p></div>
  <button onclick={clearBoard}>Clear board</button>
 </header>
 <div class="flower-layout">
  <div class="editor">
   <svg viewBox="0 0 800 800" role="group" aria-label="90-cell Flower Sudoku board">
    {#each Array.from({length:FLOWER_CELL_COUNT},(_,index)=>index) as index}
     {@const geometry=cellGeometry(index)}
     {@const label=labels[index]}
     <path id={`flower-cell-${index}`} d={geometry.path} class="cell" class:related={highlightedCells.has(index)} class:selected={selected===index} class:conflict={conflicts.has(index)} role="button" aria-label={`${label}${values[index]?`, digit ${values[index]}`:', empty'}`} aria-pressed={selected===index} tabindex={selected===index?0:-1} onclick={(event)=>select(index,event)} onfocus={()=>selected=index} onkeydown={(event)=>keydown(event,index)} />
     {#if values[index]}<text x={geometry.center.x} y={geometry.center.y+5} class:solved-digit={!!solution&&values[index]!==solution[index]} class="digit">{values[index]}</text>{:else if solution}<text x={geometry.center.x} y={geometry.center.y+5} class="digit solved-digit">{solution[index]}</text>{/if}
    {/each}
    <circle cx={CENTER} cy={CENTER} r="100" class="hub" />
    <text x={CENTER} y={CENTER+5} text-anchor="middle" class="hub-label">{labels[selected]}</text>
   </svg>
   <div class="number-pad" aria-label="Digit entry">
    {#each Array.from({length:9},(_,i)=>i+1) as digit}<button class:active={values[selected]===digit} onclick={()=>enter(digit)} aria-label={`Enter ${digit}`}>{digit}</button>{/each}
    <button onclick={()=>enter(0)} aria-label="Clear selected cell">⌫</button>
    <button class="solve" onclick={solve}>Solve</button>
   </div>
   <div class="generator-controls"><button onclick={makeRandomSolution}>Random solution</button><label>Clues<input type="number" min="20" max="89" bind:value={generationClues}/></label><button onclick={generatePuzzle}>Generate unique puzzle</button></div>
   <div class="unit-legend" aria-label="Selected cell constraints"><span class="ccw">Counterclockwise column</span><span class="cw">Clockwise column</span><span class="inner">Inner region</span><span class="outer">Outer region</span></div>
   <p class="status" aria-live="polite">{message}</p>
  </div>
  <aside class="reference"><h3>Official Round 9 example</h3><p>Use the booklet diagram as a reference while entering clues.</p><img src="/wsc2026/r09-01.png" alt="Official Flower Sudoku puzzle and completed example"/><a href="/wsc2026/WSC2026IB.pdf#page=30" target="_blank" rel="noreferrer">Open booklet page 30 ↗</a></aside>
 </div>
</section>

<style>
 .flower-tool{margin:24px 0;padding:24px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}.flower-header{display:flex;justify-content:space-between;gap:20px;align-items:start}.flower-header h2{margin:0 0 8px;font-size:22px}.flower-header p:not(.eyebrow){max-width:680px;color:#697467;line-height:1.5}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869;margin:0 0 6px}.flower-header button,.number-pad button,.generator-controls button{border:1px solid #c5cec4;background:#f8faf6;color:#244d3b;padding:8px 11px;border-radius:6px;cursor:pointer}.flower-layout{display:grid;grid-template-columns:minmax(400px,1fr) minmax(240px,310px);gap:22px;align-items:start;margin-top:14px}.editor{max-width:680px;margin:auto;width:100%}.editor svg{display:block;width:min(100%,650px);height:auto;margin:auto;touch-action:none}.cell{fill:#fff;stroke:#303833;stroke-width:1;cursor:pointer}.cell.related{fill:#e7f1ed}.cell.selected{fill:#ffe29a}.cell.conflict{fill:#f5b8ad}.cell:focus{outline:none}.digit{font:500 12px Inter,Arial,sans-serif;text-anchor:middle;dominant-baseline:middle;fill:#1f3027;pointer-events:none}.solved-digit{fill:#2469bf}.unit-outline{fill:none;stroke-width:3.5;stroke-linejoin:round;opacity:.65;pointer-events:none}.unit-outline.column{stroke-width:3}.unit-outline.inner-region{stroke-width:4}.unit-outline.outer-region{stroke-width:4}.hub{fill:#676767;stroke:#171723;stroke-width:2}.hub-label{font:700 13px Inter,Arial,sans-serif;fill:#f8f8f8;letter-spacing:.4px;pointer-events:none}.number-pad{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px}.number-pad button{width:40px;height:40px;padding:0;font-size:17px}.number-pad button.active,.number-pad .solve{background:#244d3b;color:white}.number-pad .solve{width:auto;padding:0 16px}.generator-controls{display:flex;justify-content:center;align-items:end;gap:8px;flex-wrap:wrap;margin:12px 0}.generator-controls label{display:flex;flex-direction:column;gap:4px;font-size:11px}.generator-controls input{width:72px;padding:7px}.unit-legend{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;font-size:11px;color:#5e695f}.unit-legend span::before{content:'';display:inline-block;width:9px;height:9px;margin-right:5px;border-radius:50%}.unit-legend .ccw::before{background:#14acb0}.unit-legend .cw::before{background:#318ee8}.unit-legend .inner::before{background:#ff7700}.unit-legend .outer::before{background:#c61a15}.status{min-height:24px;text-align:center;font-size:13px;color:#59675d}.reference{border-left:1px solid #dce1d6;padding-left:18px}.reference h3{margin:0 0 8px;font-size:17px}.reference p{font-size:13px;line-height:1.55;color:#697467}.reference img{display:block;width:100%;height:auto;border:1px solid #e1e5dc;border-radius:4px}.reference a{display:inline-block;margin:10px 0;color:#315e43;font-size:13px}@media(max-width:760px){.flower-tool{padding:16px}.flower-header{display:block}.flower-header button{margin-top:4px}.flower-layout{grid-template-columns:1fr}.reference{border-left:0;border-top:1px solid #dce1d6;padding:16px 0 0}.reference img{max-width:420px;margin:auto}}
</style>
