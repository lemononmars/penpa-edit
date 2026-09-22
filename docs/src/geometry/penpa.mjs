import { drawing, analyze } from './layouts.mjs';
const H=Math.sqrt(3)/2;
const key=p=>p.map(v=>v.toFixed(5)).join(',');
const layer=()=>Object.fromEntries([
 ...['surface','number','numberS','symbol','line','lineE','wall','cage','deletelineE'].map(k=>[k,{}]),
 ...['thermo','arrows','direction','squareframe','polygon','killercages','nobulbthermo'].map(k=>[k,[]]),
 ...['command_redo','command_undo','command_replay'].map(k=>[k,{__a:[]}])
]);
// Native Penpa triangle and hex point numbering. Rhombi are pairs of triangles:
// their shared-edge midpoint is an editable Number-mode position.
export function penpaData(board,solution) {
 if(!Array.isArray(solution)||solution.length!==board.cells.length)throw Error('A valid complete solution is required for Penpa+ export.');
 const checked=analyze({...board,values:solution});
 if(!board.cells.length||!Array.isArray(solution)||solution.length!==board.cells.length||solution.some(v=>!Number.isInteger(v)||v<1||v>board.digitCount)||checked.conflicts.size||checked.issues.length)throw Error('A valid complete solution is required for Penpa+ export.');
 if(board.values.some((v,i)=>v&&v!==solution[i]))throw Error('Solution does not match the givens.');
 const render=drawing(board),iso=board.kind==='isodoku',isHex=board.kind==='hex',isSquare=board.kind==='parquet';
 const raw=p=>iso?[p[1],-p[0]]:p;
 const polygons=render.cells.map(c=>c.points.map(raw));
 const xs=polygons.flat().map(p=>p[0]),ys=polygons.flat().map(p=>p[1]);
 const width=Math.max(...xs)-Math.min(...xs),height=Math.max(...ys)-Math.min(...ys);
 const required=Math.ceil(Math.max(width,height/H))+12;
 const nx=isSquare?12:isHex?Math.ceil((required-1)/3):Math.ceil((required-4)*3/4);
 const n=isSquare?nx+4:isHex?nx*3+1:Math.floor(nx*4/3+4),n2=n*n,base=-(1+.5*((nx+1)%2));
 const dx=isSquare?2:Math.ceil(-Math.min(...xs))+4+base+.5,dy=isSquare?2:(Math.ceil(-Math.min(...ys)/H/2)*2+4)*H;
 const shift=p=>[p[0]+dx,p[1]+dy];
 const points=[],vertices=new Map(),centers=new Map(),midpoints=new Map();
 function put(id,p,type){points[id]={p,type};(type===1?vertices:type===0?centers:midpoints).set(key(p),id);}
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const k=j*n+i,x=i+(j%2)*.5+base,y=(j-1)*H;
  if(isSquare){put(k,[i+.5,j+.5],0);put(k+n2,[i+1,j+1],1);continue;}
  put(k,[x,y],isHex?0:1);
  put(k+n2,[x,y+2*H/3],isHex?1:0);
  put(k+2*n2,[x-.5,y+H/3],isHex?1:0);
  if(!isHex){put(k+3*n2,[x-.25,y+H/2],2);put(k+4*n2,[x+.25,y+H/2],3);put(k+5*n2,[x+.5,y],4);}
 }
 const lookup=(map,p)=>{const id=map.get(key(p));if(id===undefined)throw Error('Could not map this layout to the Penpa lattice.');return id;};
 const given=layer(),answer=layer(),color=layer(),edges=new Map(),centerlist=[],numberIds=[];
 polygons.forEach((polygon,index)=>{
  const p=polygon.map(shift),c=shift(raw(render.cells[index].center));
  const id=lookup(iso?midpoints:centers,c);numberIds.push(id);
  if(isSquare)board.cells[index].slots.forEach(([x,y])=>centerlist.push(lookup(centers,shift([x+.5,y+.5]))));
  else if(!iso)centerlist.push(id);
  else {
   // Select the two triangular faces contained in this rhombus.
   for(const pointId of centers.values()){
    const v=points[pointId].p;
    const signs=p.map((a,i)=>{const b=p[(i+1)%p.length];return (b[0]-a[0])*(v[1]-a[1])-(b[1]-a[1])*(v[0]-a[0]);});
    if(signs.every(s=>s>1e-6)||signs.every(s=>s< -1e-6))centerlist.push(pointId);
   }
  }
  p.forEach((a,e)=>{const b=p[(e+1)%p.length],ids=[lookup(vertices,a),lookup(vertices,b)].sort((a,b)=>a-b),edge=ids.join(',');if(!edges.has(edge))edges.set(edge,[]);edges.get(edge).push(board.cells[index].region);});
  if(board.values[index])given.number[id]=[String(board.values[index]),1,'1'];
  else answer.number[id]=[String(solution[index]),2,'1'];
 });
 for(const [edge,owners] of edges)given.lineE[edge]=owners.length===1||owners[0]!==owners[1]?2:1;
 const middle=[(Math.min(...xs)+Math.max(...xs))/2+dx,(Math.min(...ys)+Math.max(...ys))/2+dy];
 const center=points.reduce((best,p,i)=>!p?best:Math.hypot(p.p[0]-middle[0],p.p[1]-middle[1])<best.distance?{id:i,distance:Math.hypot(p.p[0]-middle[0],p.p[1]-middle[1])}:best,{id:0,distance:Infinity}).id;
 const size=45,canvas=[Math.ceil(((iso?height:width)+2)*size),Math.ceil(((iso?width:height)+2)*size)];
 const rules=isSquare?'Place a digit from 1 to 9 into each empty cell in the grid so that each digit appears exactly once in each row%2C column and outlined region. Some cells belong to multiple rows and/or columns. Enter digits in the corner unit of an L-shaped cell and the top-left unit of a large square.':board.kind==='star'?'Use 1–9 once in each bold triangle and each row in three directions. Each outer eight-cell row includes its nearest tip.':isHex?'Use 1–9 once in every horizontal row; top-right column; and bold box.':`Use 1–${board.digitCount} without repeats in every bold region and each row traced through opposite rhombus sides. Enter digits at rhombus centres using Number mode.`;
 const title={star:'Star Sudoku',hex:'Hex Sudoku',isodoku:'Isodoku',parquet:'Parquet Sudoku'}[board.kind];
 const header=[isSquare?'square':isHex?'hex':'tri',nx,nx,size,iso?90:0,1,1,...canvas,center,center,0,0,0,0,'Title: '+title,'Author: ','',rules,'ON',false].join(',');
 const mode={qa:'pu_a',grid:['3','2','2'],pu_a:{edit_mode:iso?'number':'sudoku',number:['1',2],sudoku:['1',9]},pu_q:{edit_mode:'number',number:['1',1],sudoku:['1',1]}};
 const delta=centerlist.map((id,i)=>i?id-centerlist[i-1]:id);
 const solutionData=[[],[],[],[],Object.entries(answer.number).map(([id,v])=>id+','+v[0]).sort(),[]];
 const common=[JSON.stringify(delta),'[]',JSON.stringify({sol_number:true}),'"x"','"x"','[3,3,30]',JSON.stringify(mode),'"x"','0',JSON.stringify(color)];
 const space=isSquare?'[0,0,0,0]':'[0,0]';
 const solve=[header,space,JSON.stringify(mode.grid)+'~'+JSON.stringify(mode.pu_a.edit_mode)+'~'+JSON.stringify(mode.pu_a[mode.pu_a.edit_mode]),JSON.stringify(given),'',...common,'x','{}','[]','false'].join('\n');
 const edit=[header,space,JSON.stringify(mode),JSON.stringify(given),JSON.stringify(answer),...common,JSON.stringify(color),'{}','[]','false'].join('\n');
 // Escape literal z, the first native Penpa compression substitution.
 return {solve:solve.replaceAll('z','zZ'),edit:edit.replaceAll('z','zZ'),solution:JSON.stringify(solutionData),numberIds,centerlist,points};
}
async function encode(text){
 const stream=new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
 const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
 let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
 return btoa(binary);
}
export async function penpaLinks(board,solution){
 const data=penpaData(board,solution),base='https://swaroopg92.github.io/penpa-edit/';
 const [p,e,a]=await Promise.all([encode(data.solve),encode(data.edit),encode(data.solution)]);
 return {solve:base+'#m=solve&p='+p+'&a='+a,edit:base+'#m=edit&p='+e+'&a='+a};
}
