export const frames=[
 {name:'Right',n:[1,0,0],u:[0,0,-1],v:[0,1,0],kind:'number'},
 {name:'Left',n:[-1,0,0],u:[0,0,1],v:[0,1,0],kind:'dot'},
 {name:'Top',n:[0,1,0],u:[1,0,0],v:[0,0,-1],kind:'letter'},
 {name:'Bottom',n:[0,-1,0],u:[1,0,0],v:[0,0,1],kind:'letter'},
 {name:'Front',n:[0,0,1],u:[1,0,0],v:[0,1,0],kind:'letter'},
 {name:'Back',n:[0,0,-1],u:[-1,0,0],v:[0,1,0],kind:'shade'},
];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,k)=>a.map(v=>v*k),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const transform=(m,v)=>m.map(row=>dot(row,v));
const dirs=frames.map(f=>f.n);
export const rotations=[];
for(const x of dirs)for(const y of dirs)if(!dot(x,y)){const z=cross(x,y);rotations.push([0,1,2].map(i=>[x[i],y[i],z[i]]));}
export const identity=rotations.findIndex(m=>m.flat().join()==='1,0,0,0,1,0,0,0,1');
export function turnOrientation(orientation,axis,reverse=false){
 const a=axis==='x'?[[1,0,0],[0,0,-1],[0,1,0]]:axis==='y'?[[0,0,1],[0,1,0],[-1,0,0]]:[[0,-1,0],[1,0,0],[0,0,1]];
 const r=reverse?a[0].map((_,i)=>a.map(row=>row[i])):a;
 const m=r.map(row=>[0,1,2].map(c=>dot(row,rotations[orientation].map(v=>v[c]))));
 return rotations.findIndex(v=>v.flat().join()===m.flat().join());
}
function axes(mark,face){const angle=(mark.turn||0)*Math.PI/2,c=Math.round(Math.cos(angle)),s=Math.round(Math.sin(angle));return {right:scale(add(scale(face.u,c),scale(face.v,s)),mark.mirror?-1:1),up:add(scale(face.u,-s),scale(face.v,c))};}
function fromWorld(mark,face,position,right,up){
 const turn=(Math.round(Math.atan2(-dot(up,face.u),dot(up,face.v))/(Math.PI/2))+4)%4;
 return {...mark,x:dot(position,face.u),y:dot(position,face.v),turn,mirror:dot(cross(right,up),face.n)<0};
}
export function orientCube(cube,orientation){
 const m=rotations[orientation],faces=frames.map(()=>[]);
 cube.faces.forEach((marks,i)=>{const frame=frames[i],normal=transform(m,frame.n),target=frames.findIndex(f=>dot(f.n,normal)===1);for(const mark of marks){const {right,up}=axes(mark,frame),position=add(scale(frame.u,mark.x),scale(frame.v,mark.y));faces[target].push(fromWorld(mark,frames[target],transform(m,position),transform(m,right),transform(m,up)));}});
 return {...cube,faces};
}
export function pyramid(layers){
 if(![2,3].includes(layers))throw new Error('Choose two or three layers.');
 const slots=[];for(let level=0;level<layers;level++){const width=layers-level;for(let row=0;row<width;row++)for(let col=0;col<width;col++)slots.push({id:slots.length,level,row,col,width,position:[col-(width-1)/2,level,row-(width-1)/2]});}
 const contacts=[];
 for(let a=0;a<slots.length;a++)for(let b=a+1;b<slots.length;b++){
  const pa=slots[a].position,pb=slots[b].position,d=pb.map((v,i)=>v-pa[i]);
  if(d[1]===0&&Math.abs(d[0])+Math.abs(d[2])===1){const face=frames.findIndex(f=>dot(f.n,d)===1);contacts.push({a,b,fa:face,fb:face^1,center:scale(add(pa,pb),.5),half:.5});}
  else if(d[1]===1&&Math.abs(d[0])===.5&&Math.abs(d[2])===.5)contacts.push({a,b,fa:2,fb:3,center:[(pa[0]+pb[0])/2,pa[1]+.5,(pa[2]+pb[2])/2],half:.25});
 }
 return {layers,slots,contacts};
}
function point(slot,face,mark){return add(add(scale(slot.position,4),scale(face.n,2)),add(scale(face.u,mark.x),scale(face.v,mark.y)));}
function inside(point,contact,face){const delta=point.map((v,i)=>v-contact.center[i]*4);return Math.abs(dot(delta,face.u))<=contact.half*4+1e-6&&Math.abs(dot(delta,face.v))<=contact.half*4+1e-6;}
function signature(cube,slot,faceIndex,contact){const frame=frames[faceIndex];return cube.faces[faceIndex].filter(mark=>inside(point(slot,frame,mark),contact,frame)).map(mark=>{const pos=point(slot,frame,mark),{right,up}=axes(mark,frame);return JSON.stringify([pos,mark.kind,mark.value||'',mark.size,['letter','number'].includes(mark.kind)?[right,up]:null]);}).sort().join('|');}
function visibleMarks(board,slot,faceIndex,cube){const frame=frames[faceIndex],touching=board.contacts.filter(c=>(c.a===slot.id&&c.fa===faceIndex)||(c.b===slot.id&&c.fb===faceIndex));return cube.faces[faceIndex].filter(mark=>!touching.some(c=>inside(point(slot,frame,mark),c,frame)));}
function exteriorValid(board,slot,cube){
 for(let f=0;f<6;f++)for(const mark of visibleMarks(board,slot,f,cube)){
  if(mark.kind!==frames[f].kind&&!((f===2||f===3)&&mark.kind==='star'))return false;
  if(['letter','number'].includes(mark.kind)&&(mark.turn!==0||mark.mirror))return false;
 }return true;
}
export function checkAssembly(puzzle,placements){
 const board=pyramid(puzzle.layers);placements=board.slots.map((_,i)=>placements[i]||null);const oriented=placements.map(p=>p&&puzzle.cubes[p.cube]&&rotations[p.orientation]?orientCube(puzzle.cubes[p.cube],p.orientation):null),conflicts=new Set(),used=new Set();let mismatches=0;
 placements.forEach((p,i)=>{if(!p)return;if(!puzzle.cubes[p.cube]||!rotations[p.orientation]||used.has(p.cube)){conflicts.add(i);return;}used.add(p.cube);if(!exteriorValid(board,board.slots[i],oriented[i]))conflicts.add(i);});
 for(const c of board.contacts)if(oriented[c.a]&&oriented[c.b]&&signature(oriented[c.a],board.slots[c.a],c.fa,c)!==signature(oriented[c.b],board.slots[c.b],c.fb,c)){conflicts.add(c.a);conflicts.add(c.b);mismatches++;}
 const missing=board.slots.length-placements.filter(Boolean).length;
 if(!missing){const dots=new Map();for(const slot of board.slots)if(oriented[slot.id])for(const mark of visibleMarks(board,slot,1,oriented[slot.id]))if(mark.kind==='dot'){
  const position=point(slot,frames[1],mark),key=[dot(position,frames[1].u),dot(position,frames[1].v)].join(',');if(!dots.has(key))dots.set(key,[]);dots.get(key).push({slot:slot.id,color:mark.value});
 }for(const pair of dots.values())if(pair.length!==2||pair[0].color!==pair[1].color)pair.forEach(d=>conflicts.add(d.slot));}
 return {ok:missing===0&&conflicts.size===0,missing,mismatches,conflicts:[...conflicts],message:missing?`${missing} cube${missing===1?'':'s'} still to place.`:conflicts.size?`${mismatches} mismatched contact${mismatches===1?'':'s'}; check marked cubes and upright outside faces.`:'Pyramid complete! All touching surfaces and six views match.'};
}
export function solvePyramid(puzzle,limit=2){
 const board=pyramid(puzzle.layers),candidates=puzzle.cubes.flatMap((cube,i)=>rotations.map((_,orientation)=>({cube:i,orientation,oriented:orientCube(cube,orientation)}))),links=board.slots.map(s=>board.contacts.filter(c=>c.a===s.id||c.b===s.id));
 const domains=board.slots.map(slot=>candidates.filter(c=>exteriorValid(board,slot,c.oriented)).map(c=>({...c,signatures:new Map(links[slot.id].map(contact=>[contact,signature(c.oriented,slot,contact.a===slot.id?contact.fa:contact.fb,contact)]))})));
 const found=[],assigned=Array(board.slots.length).fill(null);let nodes=0,complete=true;
 function search(used){if(++nodes>100000){complete=false;return;}let slot=-1,choices;
  for(let i=0;i<assigned.length;i++)if(!assigned[i]){const possible=domains[i].filter(c=>!(used&(1<<c.cube))&&links[i].every(contact=>{const other=assigned[contact.a===i?contact.b:contact.a];return !other||other.signatures.get(contact)===c.signatures.get(contact);}));if(!possible.length)return;if(!choices||possible.length<choices.length){slot=i;choices=possible;}}
  if(slot<0){const placement=assigned.map(({cube,orientation})=>({cube,orientation}));if(checkAssembly(puzzle,placement).ok)found.push(placement);return;}
  for(const candidate of choices){assigned[slot]=candidate;search(used|(1<<candidate.cube));assigned[slot]=null;if(!complete||found.length>=limit)return;}
 }search(0);return {solutions:found,complete,nodes};
}
function random(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function generatePyramid(layers=2,seed=Date.now()){
 const rng=random(seed),pick=a=>a[Math.floor(rng()*a.length)],board=pyramid(layers);
 for(let attempt=0;attempt<40;attempt++){
  const cubes=board.slots.map((slot,i)=>({id:i+1,faces:frames.map(()=>[])}));
  const topPositions=board.slots.map(()=>{
   const positions=[[-1,-1],[-1,1],[1,-1],[1,1]];
   for(let i=3;i>0;i--){const j=Math.floor(rng()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
   return positions.slice(0,2+Math.floor(rng()*3));
  });
  const mark=(kind,size=2)=>({kind,value:kind==='letter'?pick('ACEMRST'):kind==='number'?String(Math.floor(rng()*9)+1):kind==='dot'?pick(['black','white']):'',size,x:0,y:0,turn:0,mirror:false});
  for(const contact of board.contacts){
   const a=board.slots[contact.a],b=board.slots[contact.b],fa=frames[contact.fa],fb=frames[contact.fb],m=mark(pick(contact.fa===2||contact.fa===3?['letter','star']:['letter','number','star','shade']),contact.half===.5?2:1),worldPoint=scale(contact.center,4),{right,up}=axes(m,fa);
   if(contact.fa===2){const local=worldPoint.map((v,i)=>v-a.position[i]*4-fa.n[i]*2),x=dot(local,fa.u),y=dot(local,fa.v);if(!topPositions[a.id].some(p=>p[0]===x&&p[1]===y))continue;}
   for(const [slot,face,index] of [[a,fa,contact.fa],[b,fb,contact.fb]])cubes[slot.id].faces[index].push(fromWorld(m,face,worldPoint.map((v,i)=>v-slot.position[i]*4-face.n[i]*2),right,up));
  }
  for(const slot of board.slots)for(let f=0;f<6;f++){
   const frame=frames[f],touching=board.contacts.filter(c=>(c.a===slot.id&&c.fa===f)||(c.b===slot.id&&c.fb===f));
   if(f===2){for(const [x,y] of topPositions[slot.id]){const m={...mark(pick(['letter','letter','star']),1),x,y};if(!touching.some(c=>inside(point(slot,frame,m),c,frame)))cubes[slot.id].faces[f].push(m);}}
   else if(!touching.length&&f!==1)cubes[slot.id].faces[f].push(mark(f===3?pick(['letter','star']):frame.kind));
  }
  // Semicircles meet at shared borders in the left-side projection.
  const left=board.slots.filter(slot=>slot.col===0);
  for(let i=0;i<left.length;i++)for(let j=i+1;j<left.length;j++){
   const a=left[i],b=left[j],same=a.level===b.level&&Math.abs(a.position[2]-b.position[2])===1,above=b.level===a.level+1&&Math.abs(a.position[2]-b.position[2])===.5;
   if((!same&&!above)||rng()<.3)continue;
   const z=(a.position[2]+b.position[2])/2,y=same?a.level:a.level+.5,color=pick(['black','white']);
   for(const slot of [a,b])cubes[slot.id].faces[1].push({kind:'dot',value:color,x:4*(z-slot.position[2]),y:4*(y-slot.level),size:.45,turn:0,mirror:false});
  }
  const shuffled=cubes.map((cube,slot)=>({cube:orientCube(cube,Math.floor(rng()*24)),slot}));
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const puzzle={layers,seed,cubes:shuffled.map((v,i)=>({...v.cube,id:i+1}))};
  const proof=solvePyramid(puzzle);if(proof.complete&&proof.solutions.length===1)return {...puzzle,solution:proof.solutions[0],unique:true};
 }
 throw new Error('Could not prove a unique pyramid. Try another seed.');
}
