// Cell geometry and constraint membership share lattice coordinates, so drawing
// and solving cannot disagree about rows or about an Isodoku fold.
const H = Math.sqrt(3) / 2;
const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
const pointKey = p => p.join(',');
const edgeKey = (a,b) => [pointKey(a),pointKey(b)].sort().join('|');
const center = points => [0,1].map(axis=>points.reduce((sum,p)=>sum+p[axis],0)/points.length);
const unit = (id,label,cells,kind) => ({id,label,cells,kind});
const groupBy = (cells,key) => {
 const groups=new Map();
 cells.forEach((cell,i)=>{const value=key(cell);if(!groups.has(value))groups.set(value,[]);groups.get(value).push(i);});
 return [...groups.entries()].sort(([a],[b])=>a-b);
};

export function star() {
 let points=[];
 for(let r=0;r<3;r++){
  for(let q=-r;q<=0;q++)points.push([[q,r],[q-1,r+1],[q,r+1]]);
  for(let q=-r;q<0;q++)points.push([[q,r],[q+1,r],[q,r+1]]);
 }
 const cells=[];
 for(let region=0;region<6;region++){
  points.forEach(vertices=>cells.push({points:vertices,region}));
  points=points.map(vertices=>vertices.map(([q,r])=>[3-r,q+r+1]));
 }
 const units=[];
 for(const [axis,label,measure] of [['horizontal','Horizontal',p=>p[1]],['rising','Rising diagonal',p=>p[0]+p[1]],['falling','Falling diagonal',p=>p[0]]]){
  const bands=groupBy(cells,c=>Math.min(...c.points.map(measure)));
  // Each outer eight-cell row includes its adjacent star tip.
  bands[1][1].push(...bands[0][1]);bands.at(-2)[1].push(...bands.at(-1)[1]);
  bands.slice(1,-1).forEach(([,indices],i)=>units.push(unit(`${axis}-${i}`,`${label} ${i+1}`,indices,axis)));
 }
 for(let r=0;r<6;r++)units.push(unit(`region-${r}`,`Region ${r+1}`,cells.flatMap((c,i)=>c.region===r?[i]:[]),'region'));
 return {version:1,kind:'star',digitCount:9,cells,units,values:cells.map(()=>0)};
}

export function starExample() {
 const board=star();
 const rows=[[0],[0,7,5,1,0,0,3,0],[0,2,6,4,0,9,0,0,0],[4,0,0,0,0,0,6,0,0],[0,0,8,0,0,0,5,1,0],[0,0,4,0,0,0,8,0,3],[0,8,0,2,0,0,7,0],[0]];
 groupBy(board.cells,c=>Math.min(...c.points.map(p=>p[1]))).forEach(([,indices],row)=>{
  indices.sort((a,b)=>center(board.cells[a].points)[0]-center(board.cells[b].points)[0]);
  indices.forEach((i,col)=>board.values[i]=rows[row][col]);
 });
 return board;
}

export function hex() {
 const cells=[];
 // Axial coordinates: q goes right; increasing r goes toward the top right.
 // The nine-by-nine parallelogram has 81 true hexagons, never skewed squares.
 for(let r=0;r<9;r++)for(let q=0;q<9;q++){
  const x=q+r/2,y=-r*H;
  const points=Array.from({length:6},(_,i)=>{const angle=(30+i*60)*Math.PI/180;return [x+Math.cos(angle)/Math.sqrt(3),y+Math.sin(angle)/Math.sqrt(3)];});
  cells.push({points,q,r,region:Math.floor(q/3)+3*Math.floor(r/3)});
 }
 const units=[];
 for(const [kind,label,key] of [['horizontal','Horizontal row',c=>c.r],['rising','Top-right column',c=>c.q]]){
  groupBy(cells,key).filter(([,indices])=>indices.length>1).forEach(([k,indices])=>units.push(unit(`${kind}-${k}`,`${label} ${k+1}`,indices,kind)));
 }
 groupBy(cells,c=>c.region).forEach(([r,indices])=>units.push(unit(`region-${r}`,`Box ${r+1}`,indices,'region')));
 return {version:1,kind:'hex',digitCount:9,cells,units,values:cells.map(()=>0)};
}

export const orientations={top:[[-1,0],[1,-1]],left:[[-1,0],[0,1]],right:[[1,-1],[0,1]]};
export function rhombus(q,r,orientation,region=null) {
 if(!Number.isInteger(q)||!Number.isInteger(r)||Math.abs(q)>30||Math.abs(r)>30||!orientations[orientation])throw Error('Choose a lattice position from −30 to 30 and a cell orientation.');
 const origin=[q,r],[a,b]=orientations[orientation];
 return {q,r,orientation,region,points:[origin,add(origin,a),add(add(origin,a),b),add(origin,b)]};
}

export function isoUnits(cells) {
 // A path state is (cell, opposite-edge pair). Crossing a shared edge
 // continues through the opposite edge of the neighbouring rhombus.
 const edges=new Map();
 cells.forEach((cell,i)=>cell.points.forEach((p,e)=>{
  const key=edgeKey(p,cell.points[(e+1)%4]);
  if(!edges.has(key))edges.set(key,[]);edges.get(key).push([i,e]);
 }));
 const links=Array.from({length:cells.length*2},()=>new Set());
 for(const owners of edges.values()){
  if(owners.length>2)throw Error('More than two cells share an edge.');
  if(owners.length===2){const [[a,ae],[b,be]]=owners,x=a*2+ae%2,y=b*2+be%2;links[x].add(y);links[y].add(x);}
 }
 const visited=new Set(),units=[];
 links.forEach((_,start)=>{
  if(visited.has(start))return;
  const pending=[start],path=[];
  while(pending.length){const state=pending.pop();if(visited.has(state))continue;visited.add(state);path.push(Math.floor(state/2));links[state].forEach(next=>pending.push(next));}
  if(new Set(path).size!==path.length)throw Error('A row crosses the same cell twice. Change the layout.');
  if(path.length>1)units.push(unit(`row-${units.length}`,`Bent row ${units.length+1}`,path,'row'));
 });
 groupBy(cells,c=>c.region??-1).filter(([region])=>region>=0).forEach(([region,indices])=>units.push(unit(`region-${region}`,`Region ${region+1}`,indices,'region')));
 return units;
}

export function isodoku() {
 const cells=[],size=4;
 for(const [face,orientation] of ['top','left','right'].entries()){
  const [a,b]=orientations[orientation];
  for(let i=0;i<size;i++)for(let j=0;j<size;j++)cells.push(rhombus(i*a[0]+j*b[0],i*a[1]+j*b[1],orientation,face*2+Math.floor(i/2)));
 }
 return {version:1,kind:'isodoku',digitCount:8,cells,units:isoUnits(cells),values:cells.map(()=>0)};
}

export function project(board,point) {
 const [q,r]=point;
 return board.kind==='star'?[q+r/2,r*H]:board.kind==='isodoku'?[q*H,q/2+r]:point;
}

export function drawing(board, editing=false) {
 const cells=board.cells.map((cell,i)=>{const points=cell.points.map(p=>project(board,p));return {...cell,index:i,points,center:cell.labelPoint?project(board,cell.labelPoint):center(points)};});
 const xs=cells.flatMap(c=>c.points.map(p=>p[0])),ys=cells.flatMap(c=>c.points.map(p=>p[1]));
 if(!xs.length){xs.push(-2,2);ys.push(-2,2);}
 const margin=editing?2.5:.45;
 const minX=Math.min(...xs)-margin,minY=Math.min(...ys)-margin;
 const edges=new Map();
 cells.forEach(cell=>cell.points.forEach((a,e)=>{
  const b=cell.points[(e+1)%cell.points.length];
  const key=edgeKey(a.map(n=>+n.toFixed(6)),b.map(n=>+n.toFixed(6)));
  if(!edges.has(key))edges.set(key,{a,b,owners:[]});edges.get(key).owners.push(cell.region);
 }));
 const outlines=[...edges.values()].filter(e=>e.owners.length===1||e.owners[0]!==e.owners[1]);
 return {cells,outlines,viewBox:[minX,minY,Math.max(...xs)-minX+margin,Math.max(...ys)-minY+margin].join(' ')};
}

function overlaps(a,b) {
 // Convex separating-axis test; shared edges and corners are allowed.
 for(const polygon of [a,b])for(let i=0;i<polygon.length;i++){
  const p=polygon[i],q=polygon[(i+1)%polygon.length],axis=[p[1]-q[1],q[0]-p[0]];
  const pa=a.map(p=>p[0]*axis[0]+p[1]*axis[1]),pb=b.map(p=>p[0]*axis[0]+p[1]*axis[1]);
  if(Math.max(...pa)<=Math.min(...pb)+1e-7||Math.max(...pb)<=Math.min(...pa)+1e-7)return false;
 }
 return true;
}

export function editIsodoku(board,action) {
 const next=structuredClone(board);
 if(!['add','replace','remove','region'].includes(action.type))throw Error('Unknown layout edit.');
 if(action.type!=='add'&&(!Number.isInteger(action.index)||action.index<0||action.index>=board.cells.length))throw Error('Select a cell first.');
 if(action.region!==undefined&&action.region!==null&&(!Number.isInteger(action.region)||action.region<0||action.region>199))throw Error('Region must be 0 (none) through 200.');
 if(board.kind!=='isodoku')throw Error('Custom orientation is available for Isodoku.');
 if(action.type==='remove'){
  next.cells.splice(action.index,1);next.values.splice(action.index,1);
  next.notes?.splice(action.index,1);
 } else if(action.type==='region')next.cells[action.index].region=action.region;
 else {
  const cell=rhombus(action.q,action.r,action.orientation,action.region??null);
  const replace=action.type==='replace'?action.index:-1;
  if(next.cells.some((other,i)=>i!==replace&&overlaps(cell.points,other.points)))throw Error('That orientation overlaps another cell. Remove nearby cells first, or choose another position.');
  if(replace>=0)next.cells[replace]=cell;
  else {if(next.cells.length>=200)throw Error('Layouts support up to 200 cells.');next.cells.push(cell);next.values.push(0);next.notes?.push([]);}
 }
 next.units=isoUnits(next.cells);
 return next;
}

export function validateLayout(data) {
 if(!data||data.version!==1||!['star','hex','isodoku','parquet'].includes(data.kind))throw Error('Use a geometry puzzle exported by this page.');
 if(!Number.isInteger(data.digitCount)||data.digitCount<2||data.digitCount>9)throw Error('Choose a digit range from 1–2 through 1–9.');
 let board;
 if(data.kind==='star')board=star();
 else if(data.kind==='hex')board=hex();
 else if(data.kind==='parquet')board=parquet();
 else {
  if(!Array.isArray(data.cells)||data.cells.length>200)throw Error('Isodoku needs 1–200 cells.');
  const cells=data.cells.map(c=>{
   if(c.region!==null&&(!Number.isInteger(c.region)||c.region<0||c.region>199))throw Error('Invalid region number.');
   return rhombus(c.q,c.r,c.orientation,c.region);
  });
  cells.forEach((cell,i)=>{if(cells.slice(i+1).some(other=>overlaps(cell.points,other.points)))throw Error('Cells overlap in this layout.');});
  board={version:1,kind:'isodoku',digitCount:data.digitCount,cells,units:isoUnits(cells)};
 }
 if(data.kind!=='isodoku'&&data.digitCount!==9)throw Error('Star, Hex and Parquet use digits 1–9.');
 if(!Array.isArray(data.values)||data.values.length!==board.cells.length||data.values.some(v=>!Number.isInteger(v)||v<0||v>board.digitCount))throw Error('Each cell needs a digit in range, or 0 for empty.');
 board.values=data.values.slice();
 if(data.notes!==undefined){
  if(!Array.isArray(data.notes)||data.notes.length!==board.cells.length||data.notes.some(ns=>!Array.isArray(ns)||ns.some(v=>!Number.isInteger(v)||v<1||v>board.digitCount)||new Set(ns).size!==ns.length))throw Error('Invalid centre notes.');
  board.notes=data.notes.map(ns=>ns.slice().sort((a,b)=>a-b));
 }
 return board;
}

export function enterDigit(board,index,value,mode='digit'){
 if(!Number.isInteger(index)||index<0||index>=board.cells.length||!Number.isInteger(value)||value<0||value>board.digitCount)throw Error('Choose a cell and a digit in range.');
 const next=structuredClone(board);next.notes??=next.values.map(()=>[]);
 if(mode==='center'){
  if(!value)next.notes[index]=[];
  else if(!next.values[index])next.notes[index]=next.notes[index].includes(value)?next.notes[index].filter(v=>v!==value):[...next.notes[index],value].sort((a,b)=>a-b);
 }else{next.values[index]=value;next.notes[index]=[];}
 return next;
}

export function analyze(board) {
 const conflicts=new Set(),candidates=board.values.map(()=>Array.from({length:board.digitCount},(_,i)=>i+1)),issues=[];
 if(!board.cells.length)issues.push('Add cells before solving.');
 const covered=new Set();
 for(const u of board.units){
  u.cells.forEach(i=>covered.add(i));
  if(u.cells.length>board.digitCount)issues.push(`${u.label} has ${u.cells.length} cells but only ${board.digitCount} digits.`);
  const placed=new Map();
  u.cells.forEach(i=>{const v=board.values[i];if(v){if(!placed.has(v))placed.set(v,[]);placed.get(v).push(i);}});
  for(const indices of placed.values())if(indices.length>1)indices.forEach(i=>conflicts.add(i));
  u.cells.forEach(i=>candidates[i]=candidates[i].filter(v=>!placed.has(v)));
 }
 if(covered.size!==board.cells.length)issues.push('Some cells have no row or region. Connect them before solving.');
 board.values.forEach((v,i)=>{if(v<0||v>board.digitCount)conflicts.add(i);if(v)candidates[i]=[];});
 return {conflicts,candidates,issues};
}

export function solverInput(board) {
 const report=analyze(board);
 if(report.issues.length)throw Error(report.issues.join(' '));
 return {digitCount:board.digitCount,values:board.values,units:board.units.map(u=>u.cells)};
}

export function fitBoard(viewBox,width,height,zoom=1) {
 const [, ,w,h]=viewBox.split(' ').map(Number);
 const scale=Math.max(0,Math.min(width/w,height/h))*zoom;
 return {width:w*scale,height:h*scale};
}

// Nine-cell parquet tile, read from the supplied SVG. Coordinates describe
// occupied unit squares; a spanning cell is still one shared variable.
export function parquet() {
 const tile=[[[0,0],[1,0],[0,1]],[[2,0]],[[3,0]],[[1,1],[2,1],[1,2],[2,2]],[[3,1]],[[0,2]],[[3,3],[3,2],[2,3]],[[0,3]],[[1,3]]];
 const cells=[];
 for(let by=0;by<3;by++)for(let bx=0;bx<3;bx++)for(const shape of tile){
  const slots=shape.map(([x,y])=>[x+4*bx,y+4*by]),edges=new Map();
  for(const [x,y] of slots){
   const square=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]];
   square.forEach((a,i)=>{const b=square[(i+1)%4],key=edgeKey(a,b);if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);});
  }
  const boundary=[...edges.values()],points=[boundary[0][0]];
  let next=boundary[0][1];
  while(pointKey(next)!==pointKey(points[0])){points.push(next);next=boundary.find(([a])=>pointKey(a)===pointKey(next))[1];}
  cells.push({points,slots,region:by*3+bx,labelPoint:slots[0].map(v=>v+.5)});
 }
 const units=[];
 for(let r=0;r<12;r++)units.push(unit(`row-${r}`,`Row ${r+1}`,cells.flatMap((c,i)=>c.slots.some(p=>p[1]===r)?[i]:[]),'row'));
 for(let c=0;c<12;c++)units.push(unit(`column-${c}`,`Column ${c+1}`,cells.flatMap((cell,i)=>cell.slots.some(p=>p[0]===c)?[i]:[]),'column'));
 for(let r=0;r<9;r++)units.push(unit(`region-${r}`,`Region ${r+1}`,cells.flatMap((c,i)=>c.region===r?[i]:[]),'region'));
 return {version:1,kind:'parquet',digitCount:9,cells,units,values:cells.map(()=>0)};
}
export function parquetExample(){const board=parquet();board.values.splice(0,9,1,2,3,5,6,4,9,7,8);return board;}
