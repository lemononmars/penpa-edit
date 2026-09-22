<script lang="ts">
 import { onMount, onDestroy } from 'svelte';
 import { star, starExample, parquet, parquetExample, hex, isodoku, drawing, analyze, solverInput, validateLayout, editIsodoku, rhombus, project, fitBoard, enterDigit } from './geometry/layouts.mjs';
 import variantMetadata from '../../variant_metadata.json';
 const parquetRule=variantMetadata.variants.find((v:any)=>v.id==='parquet')!.rules['9x9'];
 import { penpaLinks } from './geometry/penpa.mjs';
 export let kind:'star'|'hex'|'isodoku'|'parquet'='star';
 const factories={star,hex,isodoku,parquet},names={star:'Star Sudoku',hex:'Hex Sudoku',isodoku:'Isodoku',parquet:'Parquet Sudoku'};
 const storageKey=`sudotoku-geometry-v1-${kind}`;
 let board:any=factories[kind](),selected=0,sight=true,noteMode='digit',zoom=1,message='',error='';
 let history:any[]=[],worker:Worker|null=null,running=false,result:any=null;
 let solutionCells:number[]=[],originalPuzzle:any=null,penpa:any=null,exporting=false;
 let building=false,q=0,r=0,orientation='top',region=1,layoutTool='select',painting=false;
 let viewportWidth=600,viewportHeight=500,shareLink='',fileInput:HTMLInputElement;
 $: render=drawing(board,building);
 $: fitted=fitBoard(render.viewBox,viewportWidth,viewportHeight,zoom);
 $: report=analyze(board);
 $: selectedUnits=board.units.filter((u:any)=>u.cells.includes(selected));
 $: peers=new Set<number>(sight?selectedUnits.flatMap((u:any)=>u.cells):[]);
 $: digits=Array.from({length:board.digitCount},(_,i)=>i+1);
 $: filled=board.values.filter(Boolean).length;
 $: ghost=ghostPoints(q,r,orientation,building);
 $: lattice=building?latticePoints(board):[];
 function ghostPoints(q:number,r:number,orientation:string,active:boolean){try{return active?rhombus(q,r,orientation).points.map((p:any)=>project(board,p).join(',')).join(' '):'';}catch{return '';}}
 function latticePoints(b:any){
  const qs=b.cells.flatMap((c:any)=>c.points.map((p:any)=>p[0])),rs=b.cells.flatMap((c:any)=>c.points.map((p:any)=>p[1])),points=[];
  for(let y=Math.max(-30,Math.min(0,...rs)-2);y<=Math.min(30,Math.max(0,...rs)+2);y++)for(let x=Math.max(-30,Math.min(0,...qs)-2);x<=Math.min(30,Math.max(0,...qs)+2);x++)points.push({q:x,r:y,point:project(b,[x,y])});
  return points;
 }
 function store(){try{localStorage.setItem(storageKey,JSON.stringify(board));}catch{message='Browser storage is unavailable. Export your puzzle to keep a copy.';}}
 function cancel(){worker?.terminate();worker=null;running=false;}
 function resetResult(){result=null;solutionCells=[];originalPuzzle=null;penpa=null;error='';shareLink='';}
 function commit(next:any,notice=''){
  cancel();history=[...history.slice(-39),structuredClone(board)];board=next;selected=Math.max(0,Math.min(selected,board.cells.length-1));resetResult();message=notice;store();
 }
 function select(index:number){selected=index;if(building&&layoutTool==='select'&&board.cells[index]){const c=board.cells[index];q=c.q;r=c.r;orientation=c.orientation;region=c.region===null?0:c.region+1;}}
 function touchCell(index:number){select(index);if(building&&layoutTool==='region'){if(board.cells[index].region!==(Number(region)>0?Number(region)-1:null))edit('region');}else if(building&&layoutTool==='erase')edit('remove');}
 function enter(value:number,mode=noteMode){if(running||building||!board.cells.length)return;commit(enterDigit(board,selected,value,mode));}
 function key(event:KeyboardEvent){
  if((event.target as HTMLElement).closest('input,textarea,select,a')||event.metaKey||event.altKey)return;
  if(event.ctrlKey&&!/^[1-9]$/.test(event.key))return;
  if(event.key.toLowerCase()==='x'){noteMode='center';return;}
  if(event.key.toLowerCase()==='z'){noteMode='digit';return;}
  if(/^[1-9]$/.test(event.key)&&Number(event.key)<=board.digitCount){event.preventDefault();enter(Number(event.key),event.ctrlKey?'center':noteMode);}
  else if(['0','Backspace','Delete'].includes(event.key)){event.preventDefault();enter(0);}
  else if(event.key.startsWith('Arrow')&&board.cells.length){
   event.preventDefault();const current=render.cells[selected].center;
   const d=event.key==='ArrowRight'?[1,0]:event.key==='ArrowLeft'?[-1,0]:event.key==='ArrowDown'?[0,1]:[0,-1];
   const choices=render.cells.map((c:any)=>{const x=c.center[0]-current[0],y=c.center[1]-current[1];return {index:c.index,forward:x*d[0]+y*d[1],score:Math.hypot(x,y)+2*Math.abs(x*d[1]-y*d[0])};}).filter((c:any)=>c.forward>.05).sort((a:any,b:any)=>a.score-b.score);
   if(choices.length){select(choices[0].index);requestAnimationFrame(()=>document.getElementById('geometry-cell-'+selected)?.focus());}
  }
 }
 function undo(){if(!history.length)return;cancel();board=history.at(-1);history=history.slice(0,-1);selected=Math.max(0,Math.min(selected,board.cells.length-1));resetResult();message='Previous change restored.';store();}
 function check(){error='';message=report.issues.length?report.issues.join(' '):report.conflicts.size?`${report.conflicts.size} cells contain repeated or out-of-range digits.`:filled===board.cells.length?'Complete: every row and region is valid.':'No conflicts so far. Solve to check whether the puzzle has a completion.';}
 function solve(forExport=false){
  error='';result=null;
  try{
   const input=solverInput(board);cancel();worker=new Worker(new URL('./geometry/solver.worker.js',import.meta.url),{type:'module'});running=true;message='Solving and proving forced digits…';
   worker.onmessage=event=>{
    cancel();if(event.data.error){error=event.data.error;return;}result=event.data.result;
    message=({unique:'Unique solution found.',multiple:'More than one solution. Add givens to make the puzzle unique.',invalid:'The entered digits conflict. Check the highlighted cells.',unsatisfiable:'No solution exists for these entries.',limit:'Search limit reached. Uniqueness is unknown; add more givens and try again.'} as any)[result.status];
    if(forExport&&result.solutions?.length)makePenpa(board,result.solutions[0],result.status);
   };
   worker.onerror=()=>{cancel();error='The solver could not start. Reload the page and try again.';};worker.postMessage(input);
  }catch(e:any){cancel();error=e.message;}
 }
 function applySolution(){const values=result?.solutions?.[0];if(!values)return;const original=structuredClone(board),added=board.values.flatMap((v:number,i:number)=>v?[]:[i]);commit({...original,values:values.slice()},'Completion applied. Use Undo to restore your entries.');originalPuzzle=original;solutionCells=added;}
 function applyTruths(){if(!result?.truths?.length)return;const next=structuredClone(board),indices=result.truths.map((t:any)=>t.index);for(const t of result.truths){next.values[t.index]=t.value;if(next.notes)next.notes[t.index]=[];}const original=structuredClone(board);commit(next,`${indices.length} proven digits applied.`);if(next.values.every(Boolean))originalPuzzle=original;solutionCells=indices;}
 function edit(type:string){try{commit(editIsodoku(board,{type,index:selected,q:Number(q),r:Number(r),orientation,region:Number(region)>0?Number(region)-1:null}),'Layout updated; rows follow opposite sides.');}catch(e:any){error=e.message;}}
 function changeRange(value:string){const digitCount=Number(value);if(board.values.some((v:number)=>v>digitCount)){error='Clear the digits above this range first.';return;}const next={...structuredClone(board),digitCount};if(next.notes)next.notes=next.notes.map((ns:number[])=>ns.filter(v=>v<=digitCount));commit(next);}
 function emptyTiling(){commit({...isodoku(),cells:[],values:[],units:[]},'Choose an orientation, then click lattice dots to place cells.');layoutTool='add';q=0;r=0;}
 function exportPuzzle(){const url=URL.createObjectURL(new Blob([JSON.stringify(board,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${kind}-sudoku.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function makePenpa(puzzle:any,solution:number[],status='solved'){
  exporting=true;error='';try{const links=await penpaLinks(puzzle,solution);if(puzzle===board||puzzle===originalPuzzle){penpa=links;message=status==='multiple'||status==='limit'?'Penpa+ links include one reference completion; uniqueness is not established.':'Penpa+ links include the solution and answer checking.';}}catch(e:any){error=e.message;}finally{exporting=false;}
 }
 function exportPenpa(){if(originalPuzzle)makePenpa(originalPuzzle,board.values);else if(result?.solutions?.length)makePenpa(board,result.solutions[0],result.status);else if(filled===board.cells.length)makePenpa(board,board.values);else solve(true);}
 async function importPuzzle(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;try{if(file.size>200000)throw Error('Puzzle files must be smaller than 200 KB.');const next=validateLayout(JSON.parse(await file.text()));if(next.kind!==kind)throw Error(`Open the ${names[next.kind]} page to import this puzzle.`);commit(next,'Puzzle imported.');}catch(e:any){error=e.message;}input.value='';}
 async function share(){shareLink=`${location.origin}${location.pathname}#p=${encodeURIComponent(JSON.stringify(board))}`;try{await navigator.clipboard.writeText(shareLink);message='Puzzle link copied.';}catch{message='Copy the puzzle link below.';}}
 onMount(()=>{try{const hash=new URLSearchParams(location.hash.slice(1)),saved=hash.get('p')||localStorage.getItem(storageKey);if(saved){if(saved.length>200000)throw Error('Puzzle is too large.');const next=validateLayout(JSON.parse(saved));if(next.kind!==kind)throw Error('This puzzle belongs to another geometry page.');board=next;message=hash.has('p')?'Shared puzzle loaded.':'Restored your last puzzle.';}}catch(e:any){error=`Could not restore puzzle: ${e.message}`;}});
 onDestroy(cancel);
</script>

<svelte:head><title>{names[kind]} · Sudotoku</title><meta name="description" content={`Enter and solve ${names[kind]} with a dedicated geometric board.`}/></svelte:head>
<svelte:window onkeydown={key} onpointerup={()=>painting=false}/>
<main class="studio-grid">
 <aside class="column controls" aria-label="Puzzle controls">
  <section><h2>Variant</h2><nav aria-label="Geometry solvers">{#each Object.keys(names) as id}<a class:active={kind===id} aria-current={kind===id?'page':undefined} href={'/solver/'+id+'/'}>{names[id]}</a>{/each}</nav></section>
  <section><h2>Input</h2><div class="segmented"><button class:active={noteMode==='digit'} aria-pressed={noteMode==='digit'} onclick={()=>noteMode='digit'}>Digit <kbd>Z</kbd></button><button class:active={noteMode==='center'} aria-pressed={noteMode==='center'} onclick={()=>noteMode='center'}>Centre <kbd>X</kbd></button></div><div class="keypad">{#each digits as digit}<button disabled={building||running||!board.cells.length} onclick={()=>enter(digit)}>{digit}</button>{/each}<button class="erase" disabled={building||running||!board.cells.length} onclick={()=>enter(0)}>Erase</button></div><div class="toolbar"><button disabled={!history.length} onclick={undo}>Undo</button><button onclick={()=>commit({...structuredClone(board),values:board.values.map(()=>0),notes:board.values.map(()=>[])},'Digits and notes cleared. Undo restores them.')}>Clear</button></div></section>
  <section class="rules"><details><summary>Rules & templates</summary>    {#if kind==='star'}<p>Use 1–9 once in each bold triangle and each row in all three directions. Rows cross the central gap. Each outer eight-cell row includes the nearest tip cell.</p><button onclick={()=>commit(starExample(),'WSC 2026 booklet example loaded.')}>Load WSC example</button>
    {:else if kind==='parquet'}<p>{parquetRule}</p><p>Each highlighted shape is one cell. Enter a single digit, even when the shape spans two rows or columns.</p><button onclick={()=>commit(parquetExample(),'SVG reference givens loaded. This is a grid example, not a unique puzzle.')}>Load SVG example</button><a href="/geometry/parquet.svg" target="_blank" rel="noopener noreferrer">View supplied grid ↗</a>
    {:else if kind==='hex'}<p>Use 1–9 once in each horizontal row, top-right column (↗), and bold nine-cell box.</p>
    {:else}<p>Rows enter and leave each rhombus through opposite parallel sides, bending across folds. Digits cannot repeat in a row or bold region.</p><p>The starting cube uses 1–8. Create any lattice tiling and paint irregular regions.</p><button aria-pressed={building} onclick={()=>{building=!building;if(building)select(selected);}}>{building?'Finish editing layout':'Edit layout'}</button>{/if}
    <button onclick={()=>commit(factories[kind](),'Blank template loaded. Undo restores your previous puzzle.')}>New blank template</button>
</details></section>
   {#if kind==='isodoku'&&building}
  <section class="layout-editor"><h2>Layout</h2>
   <div class="toolbar"><label>Layout tool<select aria-label="Layout tool" bind:value={layoutTool}><option value="select">Select / move cell</option><option value="add">Place cells on dots</option><option value="region">Paint region</option><option value="erase">Erase cells</option></select></label><button onclick={emptyTiling}>Start empty tiling</button></div>
   <div class="fields"><label>Position q<input aria-label="Position q" type="number" min="-30" max="30" bind:value={q}/></label><label>Position r<input aria-label="Position r" type="number" min="-30" max="30" bind:value={r}/></label><label>Orientation<select aria-label="Cell orientation" bind:value={orientation}><option value="top">Top ◇</option><option value="left">Left face</option><option value="right">Right face</option></select></label><label>Region (0 = none)<input aria-label="Region" type="number" min="0" max="200" bind:value={region}/></label><label>Digits<select aria-label="Digit range" value={board.digitCount} onchange={event=>changeRange(event.currentTarget.value)}>{#each [2,3,4,5,6,7,8,9] as count}<option value={count}>1–{count}</option>{/each}</select></label></div>
   <div class="toolbar"><button onclick={()=>edit('add')}>Add cell</button><button disabled={!board.cells.length} onclick={()=>edit('replace')}>Apply position & orientation</button><button disabled={!board.cells.length} onclick={()=>edit('region')}>Assign region to selected cell</button><button disabled={!board.cells.length} onclick={()=>edit('remove')}>Remove selected cell</button></div>
   {#if report.issues.length}<ul class="layout-issues">{#each report.issues as issue}<li>{issue}</li>{/each}</ul>{/if}
  </section>
 {/if}

  <div class="back-links"><a href="/">← Standard solver</a><a href="/list/">Variant library ↗</a></div>
 </aside>
 <div class="grid-column"><div class="board-caption"><span>{names[kind]}</span><span>{filled} / {board.cells.length}</span></div>  <section class="board-panel" aria-label="Puzzle board">
   <div class="board-scroll" bind:clientWidth={viewportWidth} bind:clientHeight={viewportHeight}>
    <svg viewBox={render.viewBox} style:width={fitted.width+'px'} style:height={fitted.height+'px'} role="group" aria-label={names[kind]+' cells'}>
     {#each render.cells as cell}
      <g id={'geometry-cell-'+cell.index} role="button" tabindex={cell.index===selected?0:-1} aria-label={`Cell ${cell.index+1}, ${board.values[cell.index]||(board.notes?.[cell.index]?.length?'notes '+board.notes[cell.index].join(' '):'empty')}`} aria-pressed={selected===cell.index} onpointerdown={()=>{painting=true;if(building&&layoutTool==='region')touchCell(cell.index);}} onpointerenter={()=>{if(painting&&building&&layoutTool==='region')touchCell(cell.index);}} onclick={()=>touchCell(cell.index)} onkeydown={(event)=>{if(['Enter',' '].includes(event.key)){event.preventDefault();touchCell(cell.index);}}}>
       <polygon style:fill={building&&cell.region!==null?`hsl(${cell.region*137.508%360} 48% 86%)`:undefined} points={cell.points.map((p:any)=>p.join(',')).join(' ')} class:peer={peers.has(cell.index)} class:selected={selected===cell.index} class:conflict={report.conflicts.has(cell.index)}/>
       <text x={cell.center[0]} y={cell.center[1]} class:answer={solutionCells.includes(cell.index)} class:notes={!board.values[cell.index]} style:font-size={!board.values[cell.index]?Math.min(.23,.75/Math.max(1,(board.notes?.[cell.index]?.length||0)*.65))+'px':undefined}>{board.values[cell.index]||board.notes?.[cell.index]?.join('')||''}</text>
      </g>
     {/each}
     {#each render.outlines as edge}<line x1={edge.a[0]} y1={edge.a[1]} x2={edge.b[0]} y2={edge.b[1]}/>{/each}
     {#if building&&layoutTool!=='region'&&layoutTool!=='erase'}
      {#each lattice as point}<circle cx={point.point[0]} cy={point.point[1]} r=".065" class="anchor" role="button" tabindex="-1" aria-label={`Position ${point.q}, ${point.r}`} onclick={()=>{q=point.q;r=point.r;if(layoutTool==='add')edit('add');}} onkeydown={event=>{if(event.key==='Enter'){q=point.q;r=point.r;if(layoutTool==='add')edit('add');}}}/>{/each}
      <polygon points={ghost} class="ghost"/>
     {/if}
    </svg>
   </div>
   <p class="board-help">{building?layoutTool==='region'?'Click or drag across cells to paint the chosen region.':layoutTool==='add'?'Choose an orientation, then click a lattice dot to place that rhombus.':'Select a cell or lattice dot. Use the layout controls on the left.':'Z: digit · X: centre notes · Arrows: move · Delete: erase'}</p>
  </section>
</div>
 <aside class="column options" aria-label="Solver options">
  <section><h2>Solve</h2><div class="toolbar"><button class="primary" disabled={running||!board.cells.length} onclick={()=>solve()}>Solve</button><button disabled={running} onclick={check}>Check</button>{#if running}<button onclick={()=>{cancel();message='Search cancelled.';}}>Cancel</button>{/if}</div>
   {#if error}<p class="notice error" role="alert">{error}</p>{/if}{#if message}<p class="notice" role="status">{message}</p>{/if}
   {#if result?.solutions?.length}<div class="result"><h3>Unrefutable truths · {result.truths?.length||0}</h3><p>{result.truthComplete?'Proof search complete.':'Proof search reached its limit; only proven digits are listed.'}</p>{#if result.truths?.length}<button class="primary" onclick={applyTruths}>Apply proven digits</button><details><summary>Show proven digits</summary><ul>{#each result.truths as t}<li>Cell {t.index+1}: {t.value}</li>{/each}</ul></details>{/if}<button onclick={applySolution}>{result.status==='unique'?'Apply solution':'Apply one completion'}</button></div>{/if}
  </section>
  <section><h2>Display</h2><label class="toggle"><span>Line of sight</span><input type="checkbox" bind:checked={sight} aria-label="Line of sight" title="Highlight all rows, columns and regions through the selected cell"/></label><label class="zoom">Board size<select aria-label="Board size" bind:value={zoom}><option value={1}>Fit</option><option value={1.4}>140%</option><option value={1.8}>180%</option></select></label></section>
   <section class="save"><h2>Import / export</h2><div class="toolbar"><button onclick={exportPuzzle}>Export JSON</button><button disabled={running||exporting||!board.cells.length} onclick={exportPenpa}>{exporting?'Creating links…':'Export Penpa+ with solution'}</button><button onclick={()=>fileInput.click()}>Import puzzle</button><button onclick={share}>Copy puzzle link</button><input class="file-input" bind:this={fileInput} type="file" accept="application/json,.json" onchange={importPuzzle}/></div>
  {#if penpa}<div class="penpa-links"><a href={penpa.solve} target="_blank" rel="noopener noreferrer">Play in Penpa+ (answer check) ↗</a><a href={penpa.edit} target="_blank" rel="noopener noreferrer">Edit in Penpa+ (solution included) ↗</a><label>Penpa+ play link<input readonly value={penpa.solve} onclick={event=>event.currentTarget.select()}/></label></div>{/if}
  {#if shareLink}<label class="share">Puzzle link<input readonly value={shareLink} onclick={event=>event.currentTarget.select()}/></label>{/if}
 </section>

 </aside>
</main>
<style>
 :global(body){margin:0;background:#eef1f5;color:#273444;font-family:Inter,Arial,sans-serif} :global(*){box-sizing:border-box}
 .studio-grid{display:grid;grid-template-columns:clamp(215px,20vw,285px) minmax(0,1fr) clamp(245px,22vw,315px);gap:10px;padding:10px;height:100dvh;overflow:hidden}.column{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0;overflow:auto}.grid-column{display:flex;flex-direction:column;min-width:0;min-height:0}.board-caption{display:flex;justify-content:space-between;padding:3px 4px 10px;font-size:12px;color:#637184}.board-panel{flex:1;display:flex;flex-direction:column;min-height:0;min-width:0}.board-scroll{flex:1;min-height:0;overflow:auto}svg{display:block;max-width:none;margin:auto}section{padding:12px;border:1px solid #dce2ea;border-radius:8px;background:#fff;box-shadow:0 1px 5px #1722310a}h2{font-size:12px;letter-spacing:.04em;margin:0 0 12px;color:#526173}h3{font-size:13px;margin:8px 0}p{font-size:12px;line-height:1.5;color:#607084}a{color:#176fae;text-decoration:none}nav{display:grid;gap:5px}nav a{padding:9px 10px;border:1px solid #dce2ea;border-radius:5px;font-size:13px}nav a.active,.segmented .active{color:#115789;background:#e8f3fb;border-color:#176fae}button,select,input{font:inherit;font-size:12px;color:inherit;border:1px solid #cfd8e3;border-radius:5px;background:white;padding:9px;min-width:0}button{cursor:pointer}button:hover{background:#eff5fa}button:disabled{opacity:.45;cursor:default}.primary{background:#176fae;color:white;border-color:#176fae}.primary:hover{background:#125e96}.segmented{display:flex;margin-bottom:10px}.segmented button{flex:1}kbd{font-size:9px;opacity:.65;margin-left:5px}.keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}.keypad button{font-size:19px}.keypad .erase{grid-column:1/-1;font-size:12px}.toolbar{display:flex;flex-wrap:wrap;gap:6px}.toolbar button{flex:1}.back-links{display:grid;gap:10px;padding:8px;font-size:12px}.rules button{width:100%;margin-top:8px}.rules a{display:block;margin-top:8px;font-size:12px}summary{font-size:12px;cursor:pointer}.toggle{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.toggle input{accent-color:#176fae;width:17px;height:17px}label{display:flex;flex-direction:column;gap:6px;font-size:12px}.toggle{flex-direction:row}.notice{padding:10px;background:#eef5fa;border-radius:5px;overflow-wrap:anywhere}.error{background:#fcece8;color:#a23425}.result{display:grid;gap:8px;margin-top:12px;border-top:1px solid #dde4ec;padding-top:8px}.result p{margin:0}.result ul{font-size:12px;max-height:160px;overflow:auto;padding-left:22px}.save .toolbar{display:grid}.file-input{display:none}.share,.penpa-links{display:grid;gap:8px;min-width:0;margin-top:12px;font-size:12px}.share input,.penpa-links input{width:100%}.fields{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}.layout-editor .toolbar{margin-bottom:8px}.layout-issues{font-size:11px;padding-left:15px;color:#a23425}.board-help{font-size:10px;margin:8px 0 0;color:#7c8795}
 g,.anchor{outline:none}polygon{fill:white;stroke:#9ca7b2;stroke-width:.015;cursor:pointer}.peer{fill:#edf4fa}.selected{fill:#c8e2f5;stroke:#176fae;stroke-width:.045}.conflict{fill:#f9d1c8}g:focus-visible polygon{stroke:#176fae;stroke-width:.06}text{font-family:Arial,sans-serif;font-size:.36px;dominant-baseline:central;text-anchor:middle;fill:#263340;pointer-events:none}text.answer{fill:#176fae}text.notes{fill:#4a6079}line{stroke:#263340;stroke-width:.055;pointer-events:none;stroke-linecap:round}.anchor{fill:#7487a2;cursor:pointer}.anchor:hover{fill:#176fae;stroke:#176fae;stroke-width:.09}.ghost{fill:#7493cc33;stroke:#476aa8;stroke-dasharray:.07 .04;stroke-width:.03;pointer-events:none}button:focus-visible,a:focus-visible{outline:2px solid #176fae;outline-offset:2px}
 @media(max-width:1000px){.studio-grid{grid-template-columns:190px minmax(0,1fr);height:auto;min-height:100dvh;overflow:visible}.grid-column{height:calc(100dvh - 20px);position:sticky;top:10px}.options{grid-column:1;grid-row:2}.controls{grid-column:1;grid-row:1}.grid-column{grid-column:2;grid-row:1/3}.column{overflow:visible}}
 @media(max-width:620px){.studio-grid{display:flex;flex-direction:column;padding:7px}.controls{display:contents}.controls>section:first-child{order:0}.grid-column{order:1;position:static;height:65dvh;min-height:300px}.controls>section{order:2}.options{order:3}.back-links{order:4}nav{grid-template-columns:1fr 1fr}.keypad{grid-template-columns:repeat(5,1fr)}.keypad .erase{grid-column:auto}.fields{grid-template-columns:1fr 1fr}}
</style>
