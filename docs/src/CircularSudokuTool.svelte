<script lang="ts">
 export let mode: 'circular' | 'shifted' = 'shifted';
 export let initialView: 'classic' | 'outer' = 'classic';
 import {
  CIRCULAR_OUTER_GRID_COUNT,
  CIRCULAR_OUTER_ORIENTATION_COUNT,
  CIRCULAR_OUTER_SECTOR_COUNT,
  CIRCULAR_OUTER_STEP,
  CIRCULAR_SUDOKU_SIZE,
  CIRCULAR_SUDOKU_STEP,
  normalizeCircularSector,
  outerRotationFromDrag,
  rotateCircularRing,
  rotateCircularOuterRing,
  rotationFromDrag
 } from './wsc2026/circularSudoku.mjs';

 type Surface = 'core' | 'outer';
 type Cell = { surface: Surface; row: number; col: number };
 type Drag = { pointerId: number; ring: number; startAngle: number; startRotation: number; step: number; count: number };
 const CENTER = 600;
 const CORE_INNER = 52;
 const CORE_ROW = 28;
 const CORE_OUTER = CORE_INNER + CORE_ROW * CIRCULAR_SUDOKU_SIZE;
 const OUTER_INNER = CORE_OUTER + 17;
 const OUTER_ROW = 24;
 const OUTER_RADIUS = OUTER_INNER + OUTER_ROW * CIRCULAR_SUDOKU_SIZE;
 const OUTER_LABEL_RADIUS = OUTER_RADIUS + 19;
 const CORE_VIEWBOX = `${CENTER - CORE_OUTER - 8} ${CENTER - CORE_OUTER - 8} ${2 * (CORE_OUTER + 8)} ${2 * (CORE_OUTER + 8)}`;
 const FULL_VIEWBOX = `0 0 1200 1200`;
 const GRID_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
 const cellIds = (surface: Surface, row: number, col: number) => `circular-cell-${surface}-${row}-${col}`;
 const makeDigits = (rows: number, cols: number) => Array.from({ length: rows }, () => Array(cols).fill(''));

  let view: 'classic' | 'outer' = initialView;
 let coreDigits: string[][] = makeDigits(9, 9);
 let outerDigits: string[][] = makeDigits(9, CIRCULAR_OUTER_SECTOR_COUNT);
 let coreRotations = [0, 0, 0];
 let outerRotation = 0;
 let selectedRing = 0;
 let selectedCell: Cell | null = null;
 let boardSvg: SVGSVGElement;
 let drag: Drag | null = null;
 let dragCapture: SVGPathElement | null = null;
 $: activeDigit = selectedCell ? digitAt(selectedCell) : '';
 $: selectedLabel = selectedCell ? cellLabel(selectedCell) : 'Select a cell';

 function polar(radius: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  return { x: CENTER + radius * Math.cos(radians), y: CENTER + radius * Math.sin(radians) };
 }
 function sectorsFor(surface: Surface) {
  return surface === 'core' ? CIRCULAR_SUDOKU_SIZE : CIRCULAR_OUTER_SECTOR_COUNT;
 }
 function stepFor(surface: Surface) {
  return surface === 'core' ? CIRCULAR_SUDOKU_STEP : CIRCULAR_OUTER_STEP;
 }
 function innerRadiusFor(surface: Surface, row: number) {
  return surface === 'core' ? CORE_INNER + row * CORE_ROW : OUTER_INNER + row * OUTER_ROW;
 }
 function rowWidthFor(surface: Surface) {
  return surface === 'core' ? CORE_ROW : OUTER_ROW;
 }
 function cellPath(surface: Surface, row: number, col: number, rotation: number) {
  const inner = innerRadiusFor(surface, row);
  const outer = inner + rowWidthFor(surface);
  const step = stepFor(surface);
  const start = -90 + (col + rotation) * step;
  const end = start + step;
  const a = polar(outer, start), b = polar(outer, end);
  const c = polar(inner, end), d = polar(inner, start);
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 0 0 ${d.x} ${d.y} Z`;
 }
 function cellCenter(surface: Surface, row: number, col: number, rotation: number) {
  const radius = innerRadiusFor(surface, row) + rowWidthFor(surface) / 2;
  const degrees = -90 + (col + rotation + .5) * stepFor(surface);
  return polar(radius, degrees);
 }
 function digitAt(cell: Cell) {
  return cell.surface === 'core' ? coreDigits[cell.row][cell.col] : outerDigits[cell.row][cell.col];
 }
 function cellLabel(cell: Cell) {
  if (cell.surface === 'core') {
   return `Ring ${Math.floor(cell.row / 3) + 1} · row ${cell.row % 3 + 1} · cell ${cell.col + 1}`;
  }
  const grid = Math.floor(cell.col / CIRCULAR_SUDOKU_SIZE);
  return `Grid ${GRID_LETTERS[grid]} · row ${cell.row + 1} · cell ${cell.col % CIRCULAR_SUDOKU_SIZE + 1}`;
 }
 function selectCell(surface: Surface, row: number, col: number, event?: MouseEvent | KeyboardEvent | FocusEvent) {
  selectedRing = surface === 'core' ? Math.floor(row / 3) : 3;
  selectedCell = { surface, row, col };
  if (event instanceof KeyboardEvent) (event.currentTarget as SVGPathElement | null)?.focus();
 }
 function focusCell(surface: Surface, row: number, col: number) {
  const rows = CIRCULAR_SUDOKU_SIZE;
  const cols = sectorsFor(surface);
  row = normalizeCircularSector(row, rows);
  col = normalizeCircularSector(col, cols);
  selectedCell = { surface, row, col };
  selectedRing = surface === 'core' ? Math.floor(row / 3) : 3;
  document.getElementById(cellIds(surface, row, col))?.focus();
 }
 function rotateSelected(direction: number) {
  if (selectedRing < 3) {
   coreRotations[selectedRing] = rotateCircularRing(coreRotations[selectedRing], direction, CIRCULAR_SUDOKU_SIZE);
   coreRotations = [...coreRotations];
  } else {
   outerRotation = rotateCircularOuterRing(outerRotation, direction);
  }
 }
 function setDigit(digit: string) {
  if (!selectedCell) return;
  const { surface, row, col } = selectedCell;
  if (surface === 'core') {
   coreDigits[row][col] = digit;
   coreDigits = coreDigits.map((line) => [...line]);
  } else {
   outerDigits[row][col] = digit;
   outerDigits = outerDigits.map((line) => [...line]);
  }
 }
 function clearBoard() {
  coreDigits = makeDigits(9, 9);
  outerDigits = makeDigits(9, CIRCULAR_OUTER_SECTOR_COUNT);
  coreRotations = [0, 0, 0];
  outerRotation = 0;
  selectedCell = null;
  selectedRing = 0;
 }
 function addExample() {
  clearBoard();
  view = 'classic';
  coreDigits = [
   ['', '4', '', '', '', '', '3', '8', '2'],
   ['', '', '', '', '', '', '', '9', '5'],
   ['', '', '5', '', '2', '', '', '6', ''],
   ...makeDigits(6, 9)
  ];
 }
 function handleKeydown(event: KeyboardEvent, surface: Surface, row: number, col: number) {
  if (/^[1-9]$/.test(event.key)) { event.preventDefault(); setDigit(event.key); }
  else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') { event.preventDefault(); setDigit(''); }
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
   event.preventDefault();
   if (event.shiftKey) rotateSelected(event.key === 'ArrowLeft' ? -1 : 1);
   else focusCell(surface, row, col + (event.key === 'ArrowLeft' ? -1 : 1));
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
   event.preventDefault();
   focusCell(surface, row + (event.key === 'ArrowUp' ? -1 : 1), col);
  }
 }
 function chooseRing(ring: number) {
  selectedRing = ring;
  selectedCell = null;
 }
 function pointerAngle(event: PointerEvent) {
  const point = boardSvg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(boardSvg.getScreenCTM()?.inverse());
  return Math.atan2(local.y - CENTER, local.x - CENTER) * 180 / Math.PI;
 }
 function beginSpin(event: PointerEvent, surface: Surface, row: number) {
  if (event.button !== 2 || !boardSvg) return;
  event.preventDefault();
  const ring = surface === 'core' ? Math.floor(row / 3) : 3;
  const path = event.currentTarget as SVGPathElement;
  path.setPointerCapture(event.pointerId);
  dragCapture = path;
  selectedRing = ring;
  drag = {
   pointerId: event.pointerId,
   ring,
   startAngle: pointerAngle(event),
   startRotation: ring < 3 ? coreRotations[ring] : outerRotation,
   step: stepFor(surface),
   count: sectorsFor(surface)
  };
 }
 function moveSpin(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  event.preventDefault();
  const next = drag.ring === 3
   ? outerRotationFromDrag(drag.startRotation, drag.startAngle, pointerAngle(event))
   : rotationFromDrag(drag.startRotation, drag.startAngle, pointerAngle(event), drag.step, drag.count);
  if (drag.ring < 3) {
   if (coreRotations[drag.ring] === next) return;
   coreRotations[drag.ring] = next;
   coreRotations = [...coreRotations];
  } else outerRotation = next;
 }
 function endSpin(event: PointerEvent) {
  if (drag?.pointerId !== event.pointerId) return;
  drag = null;
  if (dragCapture?.hasPointerCapture(event.pointerId)) dragCapture.releasePointerCapture(event.pointerId);
  dragCapture = null;
 }
 function preventContextMenu(event: MouseEvent) { event.preventDefault(); }
 $: spinStatusText = selectedRing < 3
  ? `${coreRotations[selectedRing]} / 9 steps · 40° each`
  : `${outerRotation / 9} / ${CIRCULAR_OUTER_ORIENTATION_COUNT} orientations · 60° each`;
</script>

<section class="circular-tool" aria-labelledby="circular-title">
 <header class="tool-heading">
  <div>
   <p class="eyebrow">ROUND 15 · CHAKRAVYUHA</p>
   <h2 id="circular-title">{mode==='shifted'?'Shifted Sudoku tool':'Circular Sudoku practice'}</h2>
   <p>Spin the three inner rings with their digits. Add the outer ring to practise the six-grid competition layout, with six spoke-aligned orientations.</p>
  </div>
  <div class="view-switch" role="group" aria-label="Shifted Sudoku layout">
   <button class:active={view==='classic'} aria-pressed={view==='classic'} onclick={()=>{view='classic';selectedCell=null;selectedRing=0;}}>Classic · 3 rings</button>
   <button class:active={view==='outer'} aria-pressed={view==='outer'} onclick={()=>{view='outer';selectedCell=null;selectedRing=0;}}>Add outer ring · 6 grids</button>
  </div>
 </header>

  <div class="practice-layout" class:classic-board={view==='classic'}>
  <div class="board-column">
   <div class="board-tools">
   <div><strong>{view==='classic'?'Shifted Sudoku · three rings':'Shifted Sudoku + six outer grids'}</strong><span>{selectedLabel} · type 1–9; Backspace clears. Right-click and drag a ring to spin it.</span></div>
    <div class="board-actions"><button class="example-button" onclick={addExample}>Add example</button><button class="clear-board" onclick={clearBoard}>Clear board</button></div>
   </div>
   <div class="board-scroll">
    <svg bind:this={boardSvg} viewBox={view==='classic'?CORE_VIEWBOX:FULL_VIEWBOX} role="group" aria-label={mode==='shifted'?'Shifted Sudoku board':'Circular Sudoku board'} onpointermove={moveSpin} onpointerup={endSpin} onpointercancel={endSpin} oncontextmenu={preventContextMenu}>
     {#each Array.from({length:9},(_,row)=>row) as row}
      {#each Array.from({length:9},(_,col)=>col) as col}
       {@const rotation=coreRotations[Math.floor(row/3)]}
       <path id={cellIds('core',row,col)} d={cellPath('core',row,col,rotation)} class="sudoku-cell" class:chosen={selectedCell?.surface==='core'&&selectedCell?.row===row&&selectedCell?.col===col} role="button" aria-label={`Core ${cellLabel({surface:'core',row,col})}${coreDigits[row][col]?`, digit ${coreDigits[row][col]}`:', empty'}`} aria-pressed={selectedCell?.surface==='core'&&selectedCell?.row===row&&selectedCell?.col===col} tabindex={(!selectedCell&&row===0&&col===0)||(selectedCell?.surface==='core'&&selectedCell.row===row&&selectedCell.col===col)?0:-1} onclick={(event)=>selectCell('core',row,col,event)} onfocus={(event)=>selectCell('core',row,col,event)} onkeydown={(event)=>handleKeydown(event,'core',row,col)} onpointerdown={(event)=>beginSpin(event,'core',row)} />
      {/each}
     {/each}
     {#each Array.from({length:3},(_,ring)=>ring) as ring}
      <g class="ring-digits" transform={`rotate(${coreRotations[ring]*CIRCULAR_SUDOKU_STEP} ${CENTER} ${CENTER})`}>
       {#each Array.from({length:3},(_,localRow)=>ring*3+localRow) as row}
        {#each Array.from({length:9},(_,col)=>col) as col}
         {@const center=cellCenter('core',row,col,0)}
         {#if coreDigits[row][col]}<text x={center.x} y={center.y+6} class="digit">{coreDigits[row][col]}</text>{/if}
        {/each}
       {/each}
      </g>
     {/each}
     {#if view==='outer'}
      {#each Array.from({length:9},(_,row)=>row) as row}
       {#each Array.from({length:CIRCULAR_OUTER_SECTOR_COUNT},(_,col)=>col) as col}
        {@const grid=Math.floor(col/9)}
        <path id={cellIds('outer',row,col)} d={cellPath('outer',row,col,outerRotation)} class="sudoku-cell outer-cell" class:separator-column={col%9===0} class:chosen={selectedCell?.surface==='outer'&&selectedCell?.row===row&&selectedCell?.col===col} role="button" aria-label={`Grid ${GRID_LETTERS[grid]}, row ${row+1}, cell ${col%9+1}${outerDigits[row][col]?`, digit ${outerDigits[row][col]}`:', empty'}`} aria-pressed={selectedCell?.surface==='outer'&&selectedCell?.row===row&&selectedCell?.col===col} tabindex={(!selectedCell&&row===0&&col===0)||(selectedCell?.surface==='outer'&&selectedCell.row===row&&selectedCell.col===col)?0:-1} onclick={(event)=>selectCell('outer',row,col,event)} onfocus={(event)=>selectCell('outer',row,col,event)} onkeydown={(event)=>handleKeydown(event,'outer',row,col)} onpointerdown={(event)=>beginSpin(event,'outer',row)} />
       {/each}
      {/each}
      <g class="ring-digits" transform={`rotate(${outerRotation*CIRCULAR_OUTER_STEP} ${CENTER} ${CENTER})`}>
       {#each Array.from({length:9},(_,row)=>row) as row}
        {#each Array.from({length:CIRCULAR_OUTER_SECTOR_COUNT},(_,col)=>col) as col}
         {@const center=cellCenter('outer',row,col,0)}
         {#if outerDigits[row][col]}<text x={center.x} y={center.y+6} class="digit">{outerDigits[row][col]}</text>{/if}
        {/each}
       {/each}
      </g>
     {/if}

     {#each Array.from({length:10},(_,boundary)=>boundary) as boundary}
      {@const coreRadius=CORE_INNER+boundary*CORE_ROW}
      <circle cx={CENTER} cy={CENTER} r={coreRadius} class="grid-circle" class:box-circle={boundary%3===0} />
      {#if view==='outer'}
       {@const outerRadius=OUTER_INNER+boundary*OUTER_ROW}
       <circle cx={CENTER} cy={CENTER} r={outerRadius} class="grid-circle outer-circle" class:box-circle={boundary%3===0} />
      {/if}
     {/each}

     {#each Array.from({length:3},(_,ring)=>ring) as ring}
      {#each Array.from({length:3},(_,localRow)=>localRow) as localRow}
       {@const row=ring*3+localRow}
       {#each Array.from({length:10},(_,line)=>line) as line}
        {@const angle=-90+(line+coreRotations[ring])*CIRCULAR_SUDOKU_STEP}
        {@const start=polar(CORE_INNER+row*CORE_ROW,angle)}
        {@const end=polar(CORE_INNER+(row+1)*CORE_ROW,angle)}
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line core-spoke" class:box-line={line%3===0} />
       {/each}
      {/each}
     {/each}
     {#each Array.from({length:3},(_,ring)=>ring) as ring}
      {#each Array.from({length:10},(_,boundary)=>boundary) as boundary}
       {@const angle=-90+(boundary+coreRotations[ring])*CIRCULAR_SUDOKU_STEP}
       {@const start=polar(CORE_INNER+ring*3*CORE_ROW,angle)}
       {@const end=polar(CORE_INNER+(ring+1)*3*CORE_ROW,angle)}
       <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line core-column" class:box-line={boundary%3===0} />
      {/each}
     {/each}

     {#if view==='outer'}
      {#each Array.from({length:9},(_,row)=>row) as row}
       {#each Array.from({length:CIRCULAR_OUTER_SECTOR_COUNT+1},(_,line)=>line) as line}
        {@const angle=-90+(line+outerRotation)*CIRCULAR_OUTER_STEP}
        {@const start=polar(OUTER_INNER+row*OUTER_ROW,angle)}
        {@const end=polar(OUTER_INNER+(row+1)*OUTER_ROW,angle)}
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="grid-line outer-spoke" class:box-line={line%3===0} class:grid-line-major={line%9===0} />
       {/each}
      {/each}
      {#each Array.from({length:6},(_,grid)=>grid) as grid}
       {#each [grid*9,grid*9+8] as col}
       {@const angle=-90+(col+outerRotation)*CIRCULAR_OUTER_STEP}
       {@const start=polar(OUTER_INNER,angle)}
       {@const end=polar(OUTER_RADIUS,angle)}
       <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} class="connector-spoke" />
       {/each}
       {@const label=polar(OUTER_LABEL_RADIUS,-90+(grid*9+outerRotation+4.5)*CIRCULAR_OUTER_STEP)}
       <text x={label.x} y={label.y+4} class="grid-letter" text-anchor="middle">{GRID_LETTERS[grid]}</text>
      {/each}
     {/if}

     {#if mode==='circular'}<circle cx={CENTER} cy={CENTER} r="48" class="hub" />
     <text x={CENTER} y={CENTER-2} text-anchor="middle" class="hub-label">{selectedRing<3?`INNER RING ${selectedRing+1}`:'OUTER RING'}</text>
     <text x={CENTER} y={CENTER+14} text-anchor="middle" class="hub-detail">{activeDigit||'SELECT CELL'}</text>{/if}
    </svg>
   </div>

   <div class="ring-picker" role="group" aria-label="Choose a ring to spin">
    {#each Array.from({length:3},(_,ring)=>ring) as ring}<button class:active={selectedRing===ring} aria-pressed={selectedRing===ring} onclick={()=>chooseRing(ring)}>Ring {ring+1} <small>rows {ring*3+1}–{ring*3+3}</small></button>{/each}
    {#if view==='outer'}<button class:active={selectedRing===3} aria-pressed={selectedRing===3} onclick={()=>chooseRing(3)}>Outer ring <small>grids A–F</small></button>{/if}
   </div>
   <div class="rotation-controls"><strong>{selectedRing<3?`Ring ${selectedRing+1} · 3 rows`:'Outer ring · 6 grids'}</strong><button aria-label={selectedRing===3?'Rotate selected ring counterclockwise one orientation':'Rotate selected ring counterclockwise one cell'} onclick={()=>rotateSelected(-1)}>↶ {selectedRing===3?'60°':'One cell'}</button><button aria-label={selectedRing===3?'Rotate selected ring clockwise one orientation':'Rotate selected ring clockwise one cell'} onclick={()=>rotateSelected(1)}>{selectedRing===3?'60°':'One cell'} ↷</button><span>{spinStatusText}</span></div>
   <div class="digit-pad" aria-label="Digit entry">{#each Array.from({length:9},(_,i)=>String(i+1)) as digit}<button class:active={activeDigit===digit} aria-label={'Enter '+digit} onclick={()=>setDigit(digit)}>{digit}</button>{/each}<button class="erase" aria-label="Clear selected digit" onclick={()=>setDigit('')}>⌫</button></div>
  </div>
  <aside class="example-reference">
   <h3>{view==='classic'?'Classic example':'Competition layout · page 64'}</h3>
   <p>{view==='classic'?'Use the official Shifted Sudoku example as the reference for the central three-ring grid.':'The fourth layer contains six 9×9 Sudoku grids. Gray connector spokes are drawn only over this outer layer.'}</p>
   <img src={view==='classic'?'/wsc2026/r15-01.png':'/wsc2026/round15-layout.png'} alt={view==='classic'?'Official Round 15 Shifted Sudoku example':'Official Round 15 competition layout showing the six outer Sudoku grids and gray spokes'} loading="lazy" />
   <a href={`/wsc2026/WSC2026IB.pdf#page=${view==='classic'?60:64}`} target="_blank" rel="noreferrer">Open booklet page {view==='classic'?60:64} ↗</a>
   <p class="hint">Select a cell and type a digit. Use the ring buttons and one-cell controls, or right-click and drag around the center. Every turn snaps to a cell line and carries the digits with that ring.</p>
  </aside>
 </div>
</section>

<style>
 .circular-tool{margin:24px 0;padding:24px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}.tool-heading{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.5px;color:#6a7869;margin:0 0 6px}.tool-heading h2{font-size:22px;margin:0 0 8px}.tool-heading p:not(.eyebrow){margin:0;color:#697467;line-height:1.55;max-width:670px}.view-switch{display:flex;gap:6px;flex-wrap:wrap}.view-switch button,.board-tools button,.ring-picker button,.rotation-controls button,.digit-pad button{border:1px solid #c5cec4;background:#f8faf6;color:#244d3b;padding:8px 11px;border-radius:6px;cursor:pointer}.view-switch button.active,.ring-picker button.active,.digit-pad button.active{background:#244d3b;color:#fff;border-color:#244d3b}.practice-layout{display:grid;grid-template-columns:minmax(360px,1fr) minmax(230px,310px);gap:24px;margin-top:20px;align-items:start}.board-column{min-width:0;max-width:680px;margin:auto;width:100%}.board-tools{display:flex;justify-content:space-between;align-items:center;gap:12px}.board-tools strong,.board-tools span{display:block}.board-tools span{font-size:12px;color:#697467;margin-top:4px;line-height:1.5}.board-actions{display:flex;gap:6px;flex-shrink:0}.board-scroll{width:100%;margin:8px auto;overflow:hidden;touch-action:none}.board-scroll svg{display:block;width:100%;height:auto}.classic-board .board-column{max-width:440px}.sudoku-cell{fill:#fff;stroke:none;cursor:crosshair;touch-action:none}.sudoku-cell.outer-cell{fill:#fbfcfa}.outer-cell.separator-column{fill:#c8cbc9}.sudoku-cell.chosen{fill:#d8e9c9}.sudoku-cell:focus{outline:none}.grid-circle{fill:none;stroke:#252b27;stroke-width:1.2;pointer-events:none}.box-circle{stroke-width:3}.outer-circle{stroke:#333b36}.grid-line{stroke:#57605a;stroke-width:.85;pointer-events:none}.core-spoke.box-line{stroke-width:2}.core-column{stroke-width:1.1}.core-column.box-line{stroke-width:2.6}.outer-spoke.box-line{stroke-width:1.6}.outer-spoke.grid-line-major{stroke-width:2.4}.connector-spoke{stroke:#969d99;stroke-width:4;stroke-linecap:round;pointer-events:none}.outer-divider{stroke:#b3b8b5;stroke-width:2.4;pointer-events:none}.grid-letter{font:600 13px Inter,Arial,sans-serif;fill:#39453d;pointer-events:none}.digit{font:500 12px Inter,Arial,sans-serif;text-anchor:middle;fill:#142519;pointer-events:none}.hub{fill:#bdbfbd;stroke:#303833;stroke-width:1.5}.hub-label,.hub-detail{font:700 9px Inter,Arial,sans-serif;fill:#36443a;letter-spacing:.35px}.hub-detail{font-size:8px}.ring-picker{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:8px 0}.ring-picker button{padding:7px 10px;font-size:12px}.ring-picker small{display:block;font-size:10px;opacity:.75;margin-top:2px}.rotation-controls{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}.rotation-controls strong{margin-right:3px}.rotation-controls span{font-size:11px;color:#697467}.digit-pad{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin:10px auto 0}.digit-pad button{width:38px;height:38px;padding:0;font-size:16px}.digit-pad .erase{font-size:19px}.example-reference{border-left:1px solid #dce1d6;padding-left:18px}.example-reference h3{margin:0 0 8px;font-size:17px}.example-reference p{font-size:13px;line-height:1.6;color:#697467}.example-reference img{display:block;width:100%;height:auto;border:1px solid #e1e5dc;border-radius:4px}.example-reference a{display:inline-block;margin-top:10px;color:#315e43;font-size:13px}.example-reference .hint{padding:10px;background:#f4f7f0;border-radius:6px}@media(max-width:760px){.circular-tool{padding:16px}.tool-heading{display:block}.view-switch{margin-top:14px}.practice-layout{grid-template-columns:1fr}.board-column{max-width:600px}.classic-board .board-column{max-width:440px}.example-reference{border-left:0;border-top:1px solid #dce1d6;padding:16px 0 0}.example-reference img{max-width:420px;margin:auto}}
</style>
