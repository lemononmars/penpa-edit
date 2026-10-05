<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { rounds } from './wpc2026/content';

  type Cell = { text?: string; shade?: boolean; dot?: boolean; circle?: 'white' | 'black'; cross?: boolean };
  type Board = { id: string; title: string; rows: number; cols: number; cells: Record<string, Cell>; edges: Record<string, number>; outside: Record<string, string> };
  type Draft = { version: 1; round: number; boards: Board[]; notes: string; values: Record<string, string> };
  type Tool = 'clue' | 'shade' | 'dot' | 'white' | 'black' | 'cross' | 'border' | 'erase';

  export let initialRound = 8;
  const teamRounds = rounds.filter((round) => round.team);
  const templates: Record<number, { description: string; boards: [string, number, number][]; tip: string }> = {
    8: { description: 'Dotted Wall, forest puzzles, and a transfer grid.', boards: [['Dotted Wall', 15, 15], ['Transfer grid', 4, 4], ['Forest puzzle', 7, 7]], tip: 'Use dots on every Nth shaded cell. Keep the transferred sections on their own board.' },
    16: { description: 'Deshon regions and coded outside clues.', boards: [['Team Deshon', 12, 12], ['Individual Deshon', 8, 8]], tip: 'Mark epicentres with white circles and region boundaries with Border.' },
    17: { description: 'Four coded team puzzles and individual table sets.', boards: [['North coded puzzle', 8, 8], ['East coded puzzle', 8, 8], ['West coded puzzle', 8, 8], ['South coded puzzle', 8, 8], ['Individual puzzle', 7, 7]], tip: 'Use the code key below to track each letter’s digit and table assignment.' },
    19: { description: 'Four sets of four puzzles, each with a different traitor rule.', boards: [['Loop 1', 7, 7], ['Shading 1', 7, 7], ['Number placement 1', 7, 7], ['Object placement 1', 7, 7]], tip: 'Record the omitted rule for every puzzle in the rule matrix below.' },
    20: { description: 'A giant Hashi and 22 small 7×7 island puzzles.', boards: [['Giant Hashi', 11, 11], ['Island puzzle 1', 7, 7]], tip: 'Border cycles through one and two lines, useful for single and double bridges. Duplicate the island board for the remaining puzzles.' },
    21: { description: 'Pyramid views and six transfer grids feeding twelve base puzzles.', boards: [['Top view', 8, 8], ['Bottom view', 4, 4], ['North side view', 2, 5], ['East side view', 2, 5], ['South side view', 2, 5], ['West side view', 2, 5]], tip: 'Mark a blank transfer cell with X. Add separate boards for the base puzzles as needed.' },
  };
  const tools: { id: Tool; label: string }[] = [
    { id: 'clue', label: 'Text / number' }, { id: 'shade', label: 'Shade' }, { id: 'dot', label: 'Dot' },
    { id: 'white', label: 'White circle' }, { id: 'black', label: 'Black circle' }, { id: 'cross', label: 'X' },
    { id: 'border', label: 'Border / bridge' }, { id: 'erase', label: 'Erase' },
  ];

  let roundNumber = templates[initialRound] ? initialRound : 8;
  let draft: Draft = fresh(roundNumber);
  let boardId = draft.boards[0].id;
  let tool: Tool = 'clue';
  let selected = '';
  let notice = '';
  let importInput: HTMLInputElement;
  let clueInput: HTMLInputElement;
  let newTitle = '';
  let newRows = 7;
  let newCols = 7;
  $: board = draft.boards.find((item) => item.id === boardId) || draft.boards[0];
  $: cell = selected ? board.cells[selected] || {} : {};
  $: traitorComplete = roundNumber === 19 && Array.from({ length: 4 }, (_, set) => {
    const picks = Array.from({ length: 4 }, (_, puzzle) => draft.values[`traitor-${set}-${puzzle}`]).filter(Boolean);
    return picks.length === 4 && new Set(picks).size === 4;
  });

  function makeBoard(title: string, rows: number, cols: number): Board {
    return { id: crypto.randomUUID(), title, rows, cols, cells: {}, edges: {}, outside: {} };
  }
  function fresh(number: number): Draft {
    return { version: 1, round: number, boards: templates[number].boards.map(([title, rows, cols]) => makeBoard(title, rows, cols)), notes: '', values: {} };
  }
  function key(number = roundNumber) { return `wpc2026-team-editor-v1-${number}`; }
  function valid(value: any, number: number): value is Draft {
    return value?.version === 1 && value.round === number && Array.isArray(value.boards) && value.boards.length > 0 &&
      value.boards.length <= 100 && value.boards.every((item: any) => typeof item.id === 'string' && typeof item.title === 'string' &&
        Number.isInteger(item.rows) && item.rows >= 1 && item.rows <= 30 && Number.isInteger(item.cols) && item.cols >= 1 && item.cols <= 30 &&
        item.cells && typeof item.cells === 'object' && item.edges && typeof item.edges === 'object' && item.outside && typeof item.outside === 'object') &&
      typeof value.notes === 'string' && value.values && typeof value.values === 'object';
  }
  function load(number: number) {
    roundNumber = number;
    try {
      const saved = JSON.parse(localStorage.getItem(key(number)) || 'null');
      draft = valid(saved, number) ? saved : fresh(number);
    } catch { draft = fresh(number); }
    boardId = draft.boards[0].id;
    selected = '';
    notice = '';
  }
  function save() {
    draft = { ...draft, boards: [...draft.boards], values: { ...draft.values } };
    try { localStorage.setItem(key(), JSON.stringify(draft)); }
    catch { notice = 'Local storage is full. Export your draft to keep a copy.'; }
  }
  function setValue(name: string, value: string) { draft.values[name] = value; save(); }
  function setCell(row: number, col: number, update: (old: Cell) => Cell) {
    const position = `${row},${col}`;
    const next = update(board.cells[position] || {});
    if (!next.text && !next.shade && !next.dot && !next.circle && !next.cross) delete board.cells[position];
    else board.cells[position] = next;
    selected = position;
    save();
  }
  function clickCell(row: number, col: number) {
    selected = `${row},${col}`;
    if (tool === 'clue') { tick().then(() => clueInput?.focus()); return; }
    if (tool === 'border') return;
    setCell(row, col, (old) => {
      if (tool === 'erase') return {};
      if (tool === 'shade') return { ...old, shade: !old.shade };
      if (tool === 'dot') return { ...old, dot: !old.dot };
      if (tool === 'white' || tool === 'black') return { ...old, circle: old.circle === tool ? undefined : tool };
      return { ...old, cross: !old.cross };
    });
  }
  function editText(value: string) {
    if (!selected) return;
    const [row, col] = selected.split(',').map(Number);
    setCell(row, col, (old) => ({ ...old, text: value.slice(0, 12) }));
  }
  function edgeKey(row: number, col: number, side: string) {
    if (side === 'top') return `${row - 1},${col},bottom`;
    if (side === 'left') return `${row},${col - 1},right`;
    return `${row},${col},${side}`;
  }
  function edgeValue(row: number, col: number, side: string) { return board.edges[edgeKey(row, col, side)] || 0; }
  function clickEdge(event: MouseEvent, row: number, col: number, side: string) {
    event.stopPropagation();
    if (tool !== 'border' && tool !== 'erase') { selected = `${row},${col}`; return; }
    const name = edgeKey(row, col, side);
    const count = tool === 'erase' ? 0 : (board.edges[name] + 1 || 1) % (roundNumber === 20 ? 3 : 2);
    if (count) board.edges[name] = count; else delete board.edges[name];
    selected = `${row},${col}`;
    save();
  }
  function addBoard() {
    if (draft.boards.length >= 100) { notice = 'A draft can contain up to 100 boards.'; return; }
    const next = makeBoard(newTitle.trim() || `Board ${draft.boards.length + 1}`, Math.min(30, Math.max(1, Number(newRows) || 7)), Math.min(30, Math.max(1, Number(newCols) || 7)));
    draft.boards.push(next); boardId = next.id; selected = ''; newTitle = ''; save();
  }
  function resizeBoard(rows: number, cols: number) {
    board.rows = Math.min(30, Math.max(1, Number(rows) || board.rows));
    board.cols = Math.min(30, Math.max(1, Number(cols) || board.cols));
    for (const position of Object.keys(board.cells)) {
      const [row, col] = position.split(',').map(Number);
      if (row >= board.rows || col >= board.cols) delete board.cells[position];
    }
    selected = '';
    save();
  }
  function duplicateBoard() {
    if (draft.boards.length >= 100) return;
    const next: Board = { ...structuredClone(board), id: crypto.randomUUID(), title: `${board.title} copy` };
    draft.boards.push(next); boardId = next.id; selected = ''; save();
  }
  function removeBoard() {
    if (draft.boards.length === 1 || !confirm(`Delete “${board.title}” from this draft?`)) return;
    draft.boards = draft.boards.filter((item) => item.id !== boardId);
    boardId = draft.boards[0].id; selected = ''; save();
  }
  function download() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `wpc2026-round-${roundNumber}-draft.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importDraft(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      const value = JSON.parse(await file.text());
      if (!valid(value, roundNumber)) throw new Error('This file is not a draft for the selected round.');
      draft = value; boardId = draft.boards[0].id; selected = ''; save(); notice = 'Draft imported.';
    } catch (error: any) { notice = error.message || 'Could not read this draft.'; }
    (event.currentTarget as HTMLInputElement).value = '';
  }
  function outside(side: string, index: number) { return board.outside[`${side}-${index}`] || ''; }
  function setOutside(side: string, index: number, value: string) {
    const name = `${side}-${index}`;
    if (value) board.outside[name] = value.slice(0, 12); else delete board.outside[name];
    save();
  }
  function gridKey(event: KeyboardEvent) {
    if (!selected || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
    const [row, col] = selected.split(',').map(Number);
    if (event.key === 'Backspace' || event.key === 'Delete') { setCell(row, col, () => ({})); event.preventDefault(); }
    else if (event.key.length === 1 && /[\p{L}\p{N}?*+\-=<>]/u.test(event.key)) {
      setCell(row, col, (old) => ({ ...old, text: (old.text || '').concat(event.key).slice(0, 12) }));
      tool = 'clue'; event.preventDefault();
    }
  }
  onMount(() => load(roundNumber));
</script>

<section class="team-editor" aria-label="Team round construction workspace">
  <div class="intro"><div><p class="eyebrow">CONSTRUCTION WORKSPACE</p><h2>Round {String(roundNumber).padStart(2, '0')} editor</h2><p>Sketch clues and solutions alongside the booklet. Drafts save in this browser.</p></div><a href="/puzzle/" target="_blank" rel="noreferrer">Open full Penpa editor ↗</a></div>
  <div class="summary"><div><h3>Round {roundNumber}: {teamRounds.find((item) => item.number === roundNumber)?.name}</h3><p>{templates[roundNumber].description}</p><p class="tip">{templates[roundNumber].tip}</p></div><a href={`/wpc2026/?page=${teamRounds.find((item) => item.number === roundNumber)?.firstPage}`}>Read round rules ↗</a></div>
  <div class="editor-layout"><aside class="controls">
    <label>Board<select bind:value={boardId} onchange={() => selected = ''}>{#each draft.boards as item}<option value={item.id}>{item.title} · {item.rows}×{item.cols}</option>{/each}</select></label>
    <div class="sizes"><label>Rows<input type="number" min="1" max="30" value={board.rows} onchange={(event) => resizeBoard(Number(event.currentTarget.value), board.cols)} /></label><label>Columns<input type="number" min="1" max="30" value={board.cols} onchange={(event) => resizeBoard(board.rows, Number(event.currentTarget.value))} /></label></div>
    <div class="board-actions"><button onclick={duplicateBoard}>Duplicate</button><button disabled={draft.boards.length === 1} onclick={removeBoard}>Delete</button></div>
    <details><summary>Add a board</summary><label>Name<input bind:value={newTitle} placeholder="Another puzzle" /></label><div class="sizes"><label>Rows<input type="number" min="1" max="30" bind:value={newRows} /></label><label>Columns<input type="number" min="1" max="30" bind:value={newCols} /></label></div><button onclick={addBoard}>Add board</button></details>
    <h4>Mark</h4><div class="tools">{#each tools as item}<button class:active={tool === item.id} aria-pressed={tool === item.id} onclick={() => tool = item.id}>{item.label}</button>{/each}</div>
    <label class="cell-editor">Selected cell<input bind:this={clueInput} value={cell.text || ''} disabled={!selected} maxlength="12" placeholder={selected || 'Click a cell'} oninput={(event) => editText(event.currentTarget.value)} /></label>
    <p class="hint">Click a cell, then type a clue. Use the Border tool on cell edges. For Hashi, click an edge twice for a double bridge.</p>
    <div class="file-actions"><button onclick={download}>Export JSON</button><button onclick={() => importInput.click()}>Import JSON</button><input bind:this={importInput} type="file" accept="application/json,.json" hidden onchange={importDraft} /></div>
    {#if notice}<p role="status" class="notice">{notice}</p>{/if}
  </aside>
  <div class="work-area">
    <div class="board-heading"><h4>{board.title}</h4><span>{board.rows} rows × {board.cols} columns</span></div>
    <div class="board-scroll"><div class="grid-shell" style={`--cols:${board.cols};--cell:${board.cols > 18 ? 30 : board.cols > 12 ? 35 : 42}px`} onkeydown={gridKey} role="presentation">
      <div class="outside top" style={`grid-template-columns:repeat(${board.cols},var(--cell))`}>{#each Array(board.cols) as _, col}<input aria-label={`Top clue column ${col + 1}`} value={outside('top', col)} oninput={(event) => setOutside('top', col, event.currentTarget.value)} />{/each}</div>
      <div class="middle"><div class="outside side" style={`grid-template-rows:repeat(${board.rows},var(--cell))`}>{#each Array(board.rows) as _, row}<input aria-label={`Left clue row ${row + 1}`} value={outside('left', row)} oninput={(event) => setOutside('left', row, event.currentTarget.value)} />{/each}</div>
        <div class="grid" style={`grid-template-columns:repeat(${board.cols},var(--cell))`} role="grid" aria-label={board.title}>
          {#each Array(board.rows) as _, row}{#each Array(board.cols) as _, col}
            {@const mark = board.cells[`${row},${col}`] || {}}
            <div class="cell-wrap" role="gridcell"><button class="cell" class:shade={mark.shade} class:selected={selected === `${row},${col}`} aria-label={`Row ${row + 1}, column ${col + 1}${mark.text ? ', ' + mark.text : ''}`} onclick={() => clickCell(row, col)}><span class="cell-text">{mark.text || ''}</span>{#if mark.circle}<span class:filled={mark.circle === 'black'} class="circle"></span>{/if}{#if mark.dot}<span class="dot"></span>{/if}{#if mark.cross}<span class="cross">×</span>{/if}</button>
              <button tabindex="-1" class="edge top" class:drawn={edgeValue(row,col,'top') > 0} class:double={edgeValue(row,col,'top') === 2} aria-label={`Top edge of row ${row + 1}, column ${col + 1}`} onclick={(event) => clickEdge(event,row,col,'top')}></button>
              <button tabindex="-1" class="edge right" class:drawn={edgeValue(row,col,'right') > 0} class:double={edgeValue(row,col,'right') === 2} aria-label={`Right edge of row ${row + 1}, column ${col + 1}`} onclick={(event) => clickEdge(event,row,col,'right')}></button>
              <button tabindex="-1" class="edge bottom" class:drawn={edgeValue(row,col,'bottom') > 0} class:double={edgeValue(row,col,'bottom') === 2} aria-label={`Bottom edge of row ${row + 1}, column ${col + 1}`} onclick={(event) => clickEdge(event,row,col,'bottom')}></button>
              <button tabindex="-1" class="edge left" class:drawn={edgeValue(row,col,'left') > 0} class:double={edgeValue(row,col,'left') === 2} aria-label={`Left edge of row ${row + 1}, column ${col + 1}`} onclick={(event) => clickEdge(event,row,col,'left')}></button>
            </div>
          {/each}{/each}
        </div><div class="outside side" style={`grid-template-rows:repeat(${board.rows},var(--cell))`}>{#each Array(board.rows) as _, row}<input aria-label={`Right clue row ${row + 1}`} value={outside('right', row)} oninput={(event) => setOutside('right', row, event.currentTarget.value)} />{/each}</div></div>
      <div class="outside bottom" style={`grid-template-columns:repeat(${board.cols},var(--cell))`}>{#each Array(board.cols) as _, col}<input aria-label={`Bottom clue column ${col + 1}`} value={outside('bottom', col)} oninput={(event) => setOutside('bottom', col, event.currentTarget.value)} />{/each}</div>
    </div></div>
    {#if roundNumber === 16}<section class="helper"><h4>Deshon coded clues</h4><div class="code-list">{#each 'ABCDEFGH' as letter}<label>{letter}<input value={draft.values[`code-${letter}`] || ''} maxlength="2" inputmode="numeric" oninput={(event) => setValue(`code-${letter}`, event.currentTarget.value)} /></label>{/each}</div></section>{/if}
    {#if roundNumber === 17}<section class="helper"><h4>Coded puzzle keys and table sets</h4><div class="code-list">{#each 'NESW' as direction}<label>{direction} set<select value={draft.values[`set-${direction}`] || ''} onchange={(event) => setValue(`set-${direction}`, event.currentTarget.value)}><option value="">Unknown</option>{#each [1,2,3,4] as number}<option value={number}>{number}</option>{/each}</select></label>{/each}</div><label>Letter to digit key<input value={draft.values['letter-key'] || ''} placeholder="A=1, B=3…" oninput={(event) => setValue('letter-key', event.currentTarget.value)} /></label></section>{/if}
    {#if roundNumber === 19}<section class="helper"><h4>Traitor rule matrix</h4><p>Each rule should be omitted exactly once within its set.</p><div class="traitor-grid">{#each ['Loops','Shading','Numbers','Objects'] as group, set}<div><strong>{group}</strong>{#each [0,1,2,3] as puzzle}<label>Puzzle {puzzle + 1}<select value={draft.values[`traitor-${set}-${puzzle}`] || ''} onchange={(event) => setValue(`traitor-${set}-${puzzle}`, event.currentTarget.value)}><option value="">Choose rule</option>{#each [1,2,3,4] as number}<option value={number}>Rule {number}</option>{/each}</select></label>{/each}<span class:ok={traitorComplete[set]}>{traitorComplete[set] ? 'All four rules used once' : 'Assign four different rules'}</span></div>{/each}</div></section>{/if}
    {#if roundNumber === 20}<section class="helper"><h4>Island placement notes</h4><p>Record each small puzzle’s island position and bridge count. Duplicate the 7×7 board to build all 22 small puzzles.</p><div class="placements">{#each Array(22) as _, index}<label>{index + 1}<input value={draft.values[`island-${index}`] || ''} placeholder="Position / bridges" oninput={(event) => setValue(`island-${index}`, event.currentTarget.value)} /></label>{/each}</div></section>{/if}
    {#if roundNumber === 21}<section class="helper"><h4>Cube and base puzzle notes</h4><p>Use the view boards for transferred clues; use X where the transfer cell is empty.</p><label>Cube orientation / base puzzle notes<textarea rows="4" value={draft.values['cube-notes'] || ''} oninput={(event) => setValue('cube-notes', event.currentTarget.value)}></textarea></label></section>{/if}
    <section class="helper"><h4>Construction notes</h4><textarea aria-label="Construction notes" rows="5" bind:value={draft.notes} oninput={save} placeholder="Clue logic, intended deductions, unresolved checks…"></textarea></section>
    <p class="limitation">These are construction worksheets. They save marks and notes but do not check uniqueness or enforce the booklet’s puzzle rules. Use the original booklet for exact rules.</p>
  </div></div>
</section>

<style>
  .team-editor{color:#20382e}.intro,.summary,.board-heading{display:flex;justify-content:space-between;gap:20px;align-items:center}.intro{padding:4px 0 26px}.intro h2{font-size:32px;letter-spacing:-.03em;margin:0 0 6px}.intro p,.summary p{margin:5px 0;color:#61736a;line-height:1.5}.intro a,.summary a{white-space:nowrap;font-size:13px;color:#285741}.eyebrow{font-size:11px;letter-spacing:.14em;font-weight:700}.tools button,.board-actions button,.file-actions button,.controls details button{border:1px solid #cbd6ca;background:white;border-radius:6px;padding:8px 10px;color:#285741;cursor:pointer}.tools button.active{background:#285741;color:white;border-color:#285741}.summary{background:#eaf1e9;border:1px solid #d3dfd3;border-radius:8px;padding:18px 22px;margin-bottom:18px}.summary h3{margin:0;font-size:19px}.summary .tip{font-size:13px}.editor-layout{display:grid;grid-template-columns:236px minmax(0,1fr);gap:20px;align-items:start}.controls,.work-area{background:white;border:1px solid #dce1d6;border-radius:9px;padding:18px}.controls{position:sticky;top:12px;display:grid;gap:11px}.controls h4,.work-area h4{margin:5px 0 0;font-size:15px}.controls label,.helper label{display:grid;gap:5px;font-size:12px;font-weight:700}.controls input,.controls select,.helper input,.helper select,.helper textarea{font:inherit;color:#20382e;border:1px solid #cbd6ca;border-radius:5px;padding:7px;background:white;min-width:0}.controls select{width:100%}.board-actions,.file-actions,.sizes{display:flex;gap:6px}.board-actions>* ,.file-actions>*{flex:1}.sizes label{width:50%}.sizes input{width:100%}.controls details{border-top:1px solid #e2e9e1;padding-top:8px}.controls summary{cursor:pointer;font-weight:700;font-size:13px}.controls details label{margin:10px 0}.tools{display:grid;grid-template-columns:1fr 1fr;gap:5px}.tools button{font-size:12px;text-align:left}.hint,.limitation{font-size:12px;color:#697b6d;line-height:1.5;margin:0}.notice{font-size:12px;color:#285741}.board-heading{margin:0 0 15px}.board-heading span{font-size:12px;color:#718073}.board-scroll{overflow:auto;padding:10px;background:#f7f8f5;border:1px solid #e2e9e1;border-radius:6px}.grid-shell{width:max-content;margin:auto}.middle{display:flex}.outside{display:grid;gap:0}.outside.top,.outside.bottom{margin-left:var(--cell)}.outside input{width:var(--cell);height:var(--cell);text-align:center;font-size:12px;border:0;background:transparent;color:#305c3f;padding:1px;outline-color:#4d8061}.outside.side input{display:block}.grid{display:grid;width:max-content;border:1px solid #718778}.cell-wrap{position:relative;width:var(--cell);height:var(--cell)}.cell{position:absolute;inset:0;border:1px solid #bbcbbb;background:white;color:#20382e;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:1px;font-size:15px}.cell.shade{background:#466a53;color:white}.cell.selected{outline:3px solid #e6a847;outline-offset:-3px;z-index:1}.cell-text{position:relative;z-index:2;overflow:hidden;text-overflow:ellipsis;max-width:100%}.circle{position:absolute;width:68%;height:68%;border:2px solid #1c3023;border-radius:50%;background:white}.circle.filled{background:#1c3023;border-color:#1c3023}.dot{position:absolute;right:3px;bottom:3px;width:8px;height:8px;background:#cf462e;border-radius:50%;z-index:3}.cross{position:absolute;top:1px;left:3px;font-size:16px;color:#be472d;z-index:3}.edge{position:absolute;z-index:4;background:transparent;border:0;padding:0;cursor:crosshair}.edge.top,.edge.bottom{height:6px;left:3px;right:3px}.edge.left,.edge.right{width:6px;top:3px;bottom:3px}.edge.top{top:0}.edge.bottom{bottom:0}.edge.left{left:0}.edge.right{right:0}.edge.drawn{background:#1e6136}.edge.double{background:repeating-linear-gradient(90deg,#1e6136 0 2px,white 2px 4px,#1e6136 4px 6px)}.edge.left.double,.edge.right.double{background:repeating-linear-gradient(90deg,#1e6136 0 2px,white 2px 4px,#1e6136 4px 6px)}.helper{border-top:1px solid #e5ebe3;margin-top:22px;padding-top:18px}.helper h4{margin:0 0 8px}.helper p{font-size:12px;color:#61736a}.helper textarea{width:100%;font-size:13px}.code-list,.placements{display:flex;gap:8px;flex-wrap:wrap}.code-list label{width:68px}.code-list label input{width:100%}.placements label{width:140px}.placements label input{width:100%}.traitor-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.traitor-grid>div{border:1px solid #e0e8dd;border-radius:6px;padding:10px;display:grid;gap:8px}.traitor-grid select{width:100%}.traitor-grid span{font-size:11px;color:#9b6540}.traitor-grid span.ok{color:#217249}.limitation{margin-top:20px}
  @media(max-width:880px){.editor-layout{display:block}.controls{position:static;margin-bottom:14px}.intro,.summary{align-items:start;flex-direction:column}.traitor-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.traitor-grid{grid-template-columns:1fr}.intro h2{font-size:27px}}
</style>
