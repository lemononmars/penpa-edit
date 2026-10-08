export const sets = [
  {id:'loops',name:'Loops',base:'Draw one closed loop through cell centres, visiting every circle and avoiding grey cells.',rules:['Visit every white cell.','Turn at black circles; go straight at white circles.','Alternate black and white circles along the loop.','Grey numbers count turns in their eight neighbouring cells.']},
  {id:'shading',name:'Shading',base:'Shade one orthogonally connected group. Circled cells stay unshaded.',rules:['Circled numbers count shaded cells among their eight neighbours.','Small region numbers count shaded cells in that region.','Circled numbers count shaded cells seen in the four straight directions, stopping at an unshaded cell.','No row or column has four consecutive shaded cells.']},
  {id:'numbers',name:'Number placement',base:'Fill 1–N once in each row and column. Respect the given digits and inequalities.',rules:['No three consecutive digits of the same parity in any row or column.','Outside numbers are skyscraper counts from that side.','Outside numbers occur within the first two cells from that side.','The two digits in each cage have opposite parity.']},
  {id:'objects',name:'Object placement',base:'Place the fleet of straight ships, allowing rotation. Separate ships cannot touch orthogonally. Numbered cells cannot contain ships.',rules:['Cell numbers count ship cells among their eight neighbours.','Outside numbers count ship cells in their row or column.','Separate ships cannot touch diagonally.','Use exactly the given fleet. When this is the traitor, add one extra ship of a given size.']},
];
const pools = new Map();
const adjacent=(a,b,n)=>Math.abs(Math.floor(a/n)-Math.floor(b/n))+Math.abs(a%n-b%n)===1;
const around=(i,n)=>Array.from({length:8},(_,k)=>[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]][k]).map(([dr,dc])=>[Math.floor(i/n)+dr,i%n+dc]).filter(([r,c])=>r>=0&&c>=0&&r<n&&c<n).map(([r,c])=>r*n+c);
const count=(values,indices)=>indices.reduce((sum,i)=>sum+(values[i]?1:0),0);
const rows=(values,n)=>Array.from({length:2*n},(_,k)=>Array.from({length:n},(_,i)=>values[k<n?k*n+i:i*n+k-n]));
function noParityTriple(values,n){return rows(values,n).every(row=>row.every((_,i)=>i+2>=n||!(row[i]%2===row[i+1]%2&&row[i]%2===row[i+2]%2)));}
function noFour(values,n){return rows(values,n).every(row=>row.every((_,i)=>i+3>=n||!row.slice(i,i+4).every(Boolean)));}
function connected(values,n){const first=values.findIndex(Boolean);if(first<0)return false;const seen=new Set([first]),queue=[first];for(const i of queue)for(let j=0;j<values.length;j++)if(values[j]&&!seen.has(j)&&adjacent(i,j,n)){seen.add(j);queue.push(j);}return seen.size===values.filter(Boolean).length;}
function components(values,n){const seen=new Set(),out=[];for(let i=0;i<values.length;i++)if(values[i]&&!seen.has(i)){const part=[i];seen.add(i);for(const a of part)for(let b=0;b<values.length;b++)if(values[b]&&!seen.has(b)&&adjacent(a,b,n)){part.push(b);seen.add(b);}out.push(part);}return out;}
function ships(values,n){const parts=components(values,n);if(parts.some(p=>p.length>(n===8?4:3)||!(p.every(i=>Math.floor(i/n)===Math.floor(p[0]/n))||p.every(i=>i%n===p[0]%n))))return null;return parts;}
function diagonalFree(parts,n){return parts.every((p,a)=>parts.every((q,b)=>a===b||p.every(i=>q.every(j=>Math.abs(Math.floor(i/n)-Math.floor(j/n))!==1||Math.abs(i%n-j%n)!==1))));}
function fleetMatches(parts,fleet){return parts.map(p=>p.length).sort().join()===fleet.slice().sort().join();}
function sight(values,i,n){let total=0;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]])for(let r=Math.floor(i/n)+dr,c=i%n+dc;r>=0&&c>=0&&r<n&&c<n;r+=dr,c+=dc){if(!values[r*n+c])break;total++;}return total;}
function line(values,clue,n){let out=Array.from({length:n},(_,i)=>values[clue.side==='left'||clue.side==='right'?clue.index*n+i:i*n+clue.index]);if(clue.side==='right'||clue.side==='bottom')out.reverse();return out;}
function skyline(row){let max=0,total=0;for(const v of row)if(v>max){max=v;total++;}return total;}
export function loopEdges(path){return path.map((a,k)=>[a,path[(k+1)%path.length]].sort((x,y)=>x-y).join(','));}
function turns(path,n){return new Set(path.filter((b,k)=>{const a=path[(k+path.length-1)%path.length],c=path[(k+1)%path.length];return Math.floor(a/n)!==Math.floor(c/n)&&a%n!==c%n;}));}
function latinPool(n){const out=[],board=Array(n*n).fill(0),row=Array(n).fill(0),col=Array(n).fill(0);function search(i){if(i===board.length){out.push([...board]);return;}const r=Math.floor(i/n),c=i%n;for(let v=1;v<=n;v++){const bit=1<<v;if((row[r]|col[c])&bit)continue;board[i]=v;row[r]|=bit;col[c]|=bit;search(i+1);row[r]^=bit;col[c]^=bit;}}search(0);return out;}
function cyclePool(n){const out=[];for(let start=0;start<n*n;start++){const path=[start],used=new Set(path);function search(a){for(let b=start;b<n*n;b++){if(!adjacent(a,b,n))continue;if(b===start){if(path.length>=4&&path[1]<a)out.push([...path]);continue;}if(used.has(b))continue;used.add(b);path.push(b);search(b);path.pop();used.delete(b);}}search(start);}return out;}
export function candidatePool(type){if(pools.has(type))return pools.get(type);const n=type==='numbers'?5:4;let pool;if(type==='numbers')pool=latinPool(n);else if(type==='loops')pool=cyclePool(n);else{pool=[];for(let mask=1;mask<1<<(n*n);mask++){const values=Array.from({length:n*n},(_,i)=>mask>>i&1);if(type==='shading'?connected(values,n):!!ships(values,n))pool.push(values);}}pools.set(type,pool);return pool;}
export function ruleResults(puzzle,answer){const {type,n}=puzzle;if(type==='loops'){
 const path=answer,t=turns(path,n),visited=new Set(path),circleSequence=path.filter(i=>puzzle.circles[i]);
 return [puzzle.blocked.every((v,i)=>v||visited.has(i)),Object.entries(puzzle.circles).every(([i,color])=>t.has(Number(i))===(color==='black')),circleSequence.length<2||circleSequence.every((i,k)=>puzzle.circles[i]!==puzzle.circles[circleSequence[(k+1)%circleSequence.length]]),puzzle.clues.every(c=>around(c.cell,n).filter(i=>t.has(i)).length===c.value)];
 }if(type==='shading')return [puzzle.clues.every(c=>count(answer,around(c.cell,n))===c.value),puzzle.regions.every(c=>count(answer,c.cells)===c.value),puzzle.clues.every(c=>sight(answer,c.cell,n)===c.value),noFour(answer,n)];
 if(type==='numbers')return [noParityTriple(answer,n),puzzle.outside.every(c=>skyline(line(answer,c,n))===c.value),puzzle.outside.every(c=>line(answer,c,n).slice(0,2).includes(c.value)),puzzle.cages.every(([a,b])=>answer[a]%2!==answer[b]%2)];
 const parts=ships(answer,n);return [puzzle.clues.every(c=>count(answer,around(c.cell,n))===c.value),puzzle.outside.every(c=>count(line(answer,c,n),Array.from({length:n},(_,i)=>i))===c.value),diagonalFree(parts,n),fleetMatches(parts,puzzle.fleet)];
}
function baseHolds(p,a){if(p.type==='loops'){const visited=new Set(a),edges=new Set(loopEdges(a));return p.blocked.every((v,i)=>!v||!visited.has(i))&&Object.keys(p.circles).every(i=>visited.has(Number(i)))&&p.givens.every(g=>edges.has(g.edge)===g.value);}
 if(!p.givens.every(g=>a[g.cell]===g.value))return false;
 if(p.type==='numbers')return p.inequalities.every(([i,j])=>a[i]<a[j]);
 if(p.clues.some(c=>a[c.cell])||(p.type==='shading'&&Object.keys(p.circles).some(i=>a[Number(i)])))return false;
 if(p.type==='shading')return connected(a,p.n);
 const parts=ships(a,p.n);return !!parts&&(fleetMatches(parts,p.fleet)||p.fleet.some(size=>fleetMatches(parts,[...p.fleet,size])));
}
export function solvePractice(puzzle,limit=2){if(puzzle.n>=6)return solveLarge(puzzle,limit);const solutions=[];for(const answer of candidatePool(puzzle.type)){if(!baseHolds(puzzle,answer))continue;const results=ruleResults(puzzle,answer);if(results.filter(Boolean).length!==3)continue;solutions.push({answer,traitor:results.indexOf(false)+1});if(solutions.length>=limit)break;}return solutions;}
export function checkPractice(puzzle,values,traitor){let answer=values;if(puzzle.type==='loops'){
 const edges=new Set(values),graph=new Map();for(const edge of edges){const [a,b]=edge.split(',').map(Number);if(!adjacent(a,b,puzzle.n))return {ok:false,message:'Use adjacent cell centres.'};for(const [i,j] of [[a,b],[b,a]]){if(!graph.has(i))graph.set(i,[]);graph.get(i).push(j);}}
 if(!graph.size||[...graph.values()].some(a=>a.length!==2))return {ok:false,message:'Draw one closed loop without branches.'};
 answer=[];let previous=-1,current=graph.keys().next().value;do{answer.push(current);const next=graph.get(current).find(i=>i!==previous);previous=current;current=next;}while(current!==answer[0]&&answer.length<=graph.size);
 if(answer.length!==graph.size)return {ok:false,message:'Draw only one loop.'};
 }else if(puzzle.type==='numbers'&&(values.some(v=>v<1||v>puzzle.n)||rows(values,puzzle.n).some(r=>new Set(r).size!==puzzle.n)))return {ok:false,message:`Fill every row and column with 1–${puzzle.n} once each.`};
 if(!baseHolds(puzzle,answer))return {ok:false,message:'The base rules or given clues are not satisfied.'};
 const results=ruleResults(puzzle,answer),actual=results.indexOf(false)+1;
 if(results.filter(Boolean).length!==3)return {ok:false,message:'Exactly three additional rules must hold.'};
 if(Number(traitor)!==actual)return {ok:false,message:'Choose the rule that this solution breaks.'};
 return {ok:true,message:'Correct! The solution and traitor rule match.'};
}
function random(seed){let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
function shuffle(list,rng){list=[...list];for(let i=list.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
function makePuzzle(type,traitor,rng,size){if(size>=6)return makeUnfilled(type,traitor,rng,size);const n=size||(type==='numbers'?5:4),pool=candidatePool(type);for(let attempt=0;attempt<3000;attempt++){
 const answer=pool?pool[Math.floor(rng()*pool.length)]:largeAnswer(type,n,traitor,rng),p={type,n,givens:[],clues:[],regions:[],outside:[],cages:[],inequalities:[],circles:{},blocked:Array(n*n).fill(0),fleet:type==='objects'&&n>=6?[3,2,1,1]:[2,1]};
 if(type==='loops'){
  const t=turns(answer,n),straight=answer.filter(i=>!t.has(i));if(!straight.length)continue;
  p.blocked=p.blocked.map((_,i)=>answer.includes(i)?0:1);
  if(traitor===1){const extra=p.blocked.findIndex(Boolean);if(extra<0)continue;p.blocked[extra]=0;}
  if(traitor===2){p.circles[straight[0]]='black';p.circles[answer.find(i=>i!==straight[0])]='white';}
  else if(traitor===3){for(const i of [...t].slice(0,2))p.circles[i]='black';}
  else {p.circles[[...t][0]]='black';p.circles[straight[0]]='white';}
  if(traitor===4){const i=p.blocked.findIndex(Boolean);if(i<0)continue;p.clues=[{cell:i,value:around(i,n).filter(j=>t.has(j)).length+1}];}
  p.givens=loopEdges(answer).map(edge=>({edge,value:true}));
 }else if(type==='numbers'){
  if(noParityTriple(answer,n)===(traitor===1))continue;
  for(const side of ['left','right','top','bottom'])for(let index=0;index<n;index++){
   const row=line(answer,{side,index},n),sky=skyline(row),first=row.slice(0,2);
   const value=traitor===2?first.find(v=>v!==sky):traitor===3?(!first.includes(sky)?sky:undefined):(first.includes(sky)?sky:undefined);
   if(value!==undefined)p.outside.push({side,index,value});
  }
  if((traitor===2||traitor===3)&&!p.outside.length)continue;
  for(let i=0;i<n*n;i++)for(let j=i+1;j<n*n;j++)if(adjacent(i,j,n)&&(answer[i]%2===answer[j]%2)===(traitor===4))p.cages.push([i,j]);
  if(traitor===4&&!p.cages.length)continue;p.cages=disjointCages(p.cages,rng,3);
  for(let i=0;i<n*n;i++)if(i%n<n-1&&rng()<.15)p.inequalities.push(answer[i]<answer[i+1]?[i,i+1]:[i+1,i]);
  p.outside=shuffle(p.outside,rng).slice(0,8);p.givens=answer.map((value,cell)=>({cell,value}));
 }else if(type==='shading'){
  if(noFour(answer,n)===(traitor===4))continue;
  const eligible=answer.map((v,i)=>i).filter(i=>!answer[i]&&(traitor===1||traitor===3?count(answer,around(i,n))!==sight(answer,i,n):count(answer,around(i,n))===sight(answer,i,n)));
  if((traitor===1||traitor===3)&&!eligible.length)continue;
  p.clues=shuffle(eligible,rng).slice(0,2).map(cell=>({cell,value:traitor===1?sight(answer,cell,n):count(answer,around(cell,n))}));
  p.regions=Array.from({length:n},(_,r)=>({cells:Array.from({length:n},(_,c)=>r*n+c),value:answer.slice(r*n,(r+1)*n).filter(Boolean).length}));
  if(traitor===2)p.regions[0].value=(p.regions[0].value+1)%(n+1);
  p.givens=answer.map((value,cell)=>({cell,value}));
 }else{
  const parts=ships(answer,n);if(!fleetMatches(parts,traitor===4?[...p.fleet,1]:p.fleet))continue;
  if(diagonalFree(parts,n)===(traitor===3))continue;
  p.clues=shuffle(answer.map((v,i)=>i).filter(i=>!answer[i]),rng).slice(0,4).map(cell=>({cell,value:count(answer,around(cell,n))}));
  if(traitor===1)p.clues[0].value=(p.clues[0].value+1)%9;
  p.outside=['left','top'].flatMap(side=>Array.from({length:n},(_,index)=>({side,index,value:line(answer,{side,index},n).filter(Boolean).length})));
  if(traitor===2)p.outside[0].value=(p.outside[0].value+1)%(n+1);
  p.givens=answer.map((value,cell)=>({cell,value}));
 }
 if(!baseHolds(p,answer)||ruleResults(p,answer).filter(Boolean).length!==3||ruleResults(p,answer)[traitor-1])continue;
 if(pool){
 const possible=pool.filter(a=>{const clone={...p,givens:[]};return baseHolds(clone,a)&&ruleResults(p,a).filter(Boolean).length===3;});
 for(const given of shuffle(p.givens,rng)){const next=p.givens.filter(g=>g!==given);const clone={...p,givens:next};let count=0;for(const a of possible)if(baseHolds(clone,a)&&++count>1)break;if(count===1)p.givens=next;}
 }else{
 for(const given of shuffle(p.givens,rng)){
  const next=p.givens.filter(g=>g!==given);
  if((type==='shading'||type==='objects')&&n*n-next.length>18)break;
  if(type==='numbers'&&next.length<Math.ceil(n*n*.4))break;
  const result=solveLarge({...p,givens:next},2);
  if(result.complete&&result.length===1)p.givens=next;
 }
 const verification=solveLarge(p,2);if(!verification.complete||verification.length!==1)continue;
 }
 return {...p,answer,traitor,unique:true};
 }throw new Error(`Could not construct ${type}; try another seed.`);}
export function generatePracticeSet(type,seed=Date.now(),size){if(size!==undefined&&![6,8].includes(size))throw new Error('Choose 6×6 or 8×8.');if(!sets.some(s=>s.id===type))throw new Error('Unknown practice set.');const rng=random(seed);return {type,seed,size,puzzles:shuffle([1,2,3,4],rng).map(traitor=>makePuzzle(type,traitor,rng,size))};}

function largeAnswer(type,n,traitor,rng){
 if(type==='numbers'){
  let rr,cc;do{rr=shuffle(Array.from({length:n},(_,i)=>i),rng);cc=shuffle(Array.from({length:n},(_,i)=>i),rng);}while(traitor!==1&&(!noParityTriple(Array.from({length:n*n},(_,i)=>(rr[Math.floor(i/n)]+cc[i%n])%n+1),n)));
  const odds=shuffle(Array.from({length:n/2},(_,i)=>i*2+1),rng),evens=shuffle(Array.from({length:n/2},(_,i)=>i*2+2),rng);
  return Array.from({length:n*n},(_,i)=>{const v=(rr[Math.floor(i/n)]+cc[i%n])%n+1;return v%2?odds[(v-1)/2]:evens[v/2-1];});
 }
 if(type==='loops'){
  const top=1,left=1,bottom=n-2,right=n-2,path=[];
  for(let c=left;c<=right;c++)path.push(top*n+c);for(let r=top+1;r<=bottom;r++)path.push(r*n+right);for(let c=right-1;c>=left;c--)path.push(bottom*n+c);for(let r=bottom-1;r>top;r--)path.push(r*n+left);
  for(let k=0;k<n*n;k++){const index=Math.floor(rng()*path.length),a=path[index],b=path[(index+1)%path.length];const shift=Math.floor(a/n)===Math.floor(b/n)?(rng()<.5?-n:n):(rng()<.5?-1:1);const c=a+shift,d=b+shift;if(c<0||d<0||c>=n*n||d>=n*n||!adjacent(a,c,n)||!adjacent(b,d,n)||path.includes(c)||path.includes(d))continue;path.splice(index+1,0,c,d);}return path;
 }
 if(type==='shading'){
  const out=Array(n*n).fill(0),target=Math.floor(n*n*(.3+rng()*.15));if(traitor===4){const row=Math.floor(rng()*n),start=Math.floor(rng()*(n-3));for(let c=start;c<start+4;c++)out[row*n+c]=1;}else out[Math.floor(rng()*out.length)]=1;
  for(const i of shuffle(Array.from({length:n*n},(_,i)=>i),rng).concat(shuffle(Array.from({length:n*n},(_,i)=>i),rng))){if(out.filter(Boolean).length>=target)break;if(!out.some((v,j)=>v&&adjacent(i,j,n)))continue;out[i]=1;if(traitor!==4&&!noFour(out,n))out[i]=0;}return out;
 }
 const out=Array(n*n).fill(0),fleet=traitor===4?[3,2,1,1,1]:[3,2,1,1];
 for(const length of fleet){let placed=false;for(let k=0;k<300;k++){const start=Math.floor(rng()*out.length),step=rng()<.5?1:n,part=Array.from({length},(_,i)=>start+i*step);if(part.some(i=>i>=out.length||(step===1&&Math.floor(i/n)!==Math.floor(start/n))||out[i]||out.some((v,j)=>v&&adjacent(i,j,n))))continue;part.forEach(i=>out[i]=1);placed=true;break;}if(!placed)return largeAnswer(type,n,traitor,rng);}return out;
}
function solveLarge(p,limit=2){
 if(p.type==='objects')return solveShips(p,limit);
 if(p.type==='loops')return solveLoopDomains(p,limit);
 if(p.type==='shading')return solveShading(p,limit);
 const answers=[];let nodes=0,exhausted=false;const maxNodes=24000,n=p.n;
 function accept(a){if(!baseHolds(p,a))return;const rules=ruleResults(p,a);if(rules.filter(Boolean).length===3)answers.push({answer:[...a],traitor:rules.indexOf(false)+1});}
 {
  const a=Array(n*n).fill(-1);for(const g of p.givens)a[g.cell]=g.value;
  if(p.type!=='numbers'){for(const c of p.clues)a[c.cell]=0;for(const cell of Object.keys(p.circles))a[Number(cell)]=0;}
  const lower=Array(n*n).fill(1),upper=Array(n*n).fill(n);
  if(p.type==='numbers')for(let pass=0;pass<n*n;pass++){let changed=false;for(const [x,y] of p.inequalities){const lo=Math.max(lower[y],lower[x]+1),hi=Math.min(upper[x],upper[y]-1);if(lo!==lower[y]||hi!==upper[x])changed=true;lower[y]=lo;upper[x]=hi;}if(!changed)break;}
  const rowUsed=Array(n).fill(0),colUsed=Array(n).fill(0),incoming=Array.from({length:n*n},()=>[]),outgoing=Array.from({length:n*n},()=>[]);
  if(p.type==='numbers'){
   for(const [x,y] of p.inequalities){outgoing[x].push(y);incoming[y].push(x);}
   for(let i=0;i<a.length;i++)if(a[i]>0){const bit=1<<a[i],r=Math.floor(i/n),c=i%n;if((rowUsed[r]|colUsed[c])&bit){answers.complete=true;return answers;}rowUsed[r]|=bit;colUsed[c]|=bit;}
  }
  function candidates(i){if(p.type!=='numbers')return [0,1];const r=Math.floor(i/n),c=i%n,used=rowUsed[r]|colUsed[c],list=[];let lo=lower[i],hi=upper[i];for(const j of incoming[i])if(a[j]>0)lo=Math.max(lo,a[j]+1);for(const j of outgoing[i])if(a[j]>0)hi=Math.min(hi,a[j]-1);for(let v=lo;v<=hi;v++)if(!(used&(1<<v)))list.push(v);return list;}

  function possibleRules(){
   let failures=0;
   if(p.type==='numbers'){
    if(rows(a,n).some(row=>row.some((v,i)=>i+2<n&&v>0&&row[i+1]>0&&row[i+2]>0&&v%2===row[i+1]%2&&v%2===row[i+2]%2)))failures++;
    if(p.outside.some(c=>{const l=line(a,c,n);return l.every(v=>v>0)&&skyline(l)!==c.value;}))failures++;
    if(p.outside.some(c=>{const l=line(a,c,n).slice(0,2);return l.every(v=>v>0)&&!l.includes(c.value);} ))failures++;
    if(p.cages.some(([x,y])=>a[x]>0&&a[y]>0&&a[x]%2===a[y]%2))failures++;
   }else{
    if(p.clues.some(c=>{const near=around(c.cell,n),used=near.filter(i=>a[i]===1).length,blank=near.filter(i=>a[i]<0).length;return used>c.value||used+blank<c.value;}))failures++;
    if(p.type==='shading'){
     if(p.regions.some(c=>{const used=c.cells.filter(i=>a[i]===1).length,blank=c.cells.filter(i=>a[i]<0).length;return used>c.value||used+blank<c.value;}))failures++;
     if(p.clues.some(c=>{const [lo,hi]=partialSight(a,c.cell,n);return lo>c.value||hi<c.value;}))failures++;
     if(!noFour(a.map(v=>v===1?1:0),n))failures++;
    }else if(p.outside.some(c=>{const l=line(a,c,n),used=l.filter(v=>v===1).length,blank=l.filter(v=>v<0).length;return used>c.value||used+blank<c.value;}))failures++;
   }return failures<=1;
  }
  function search(){if(++nodes>maxNodes){exhausted=true;return;}if(!possibleRules())return;let cell=-1,choices=null;for(let i=0;i<a.length;i++)if(a[i]<0){const opts=candidates(i);if(!opts.length)return;if(!choices||opts.length<choices.length){cell=i;choices=opts;if(opts.length===1||p.type!=='numbers')break;}}if(cell<0){accept(a);return;}for(const v of choices){a[cell]=v;if(p.type==='numbers'){rowUsed[Math.floor(cell/n)]|=1<<v;colUsed[cell%n]|=1<<v;}search();if(p.type==='numbers'){rowUsed[Math.floor(cell/n)]^=1<<v;colUsed[cell%n]^=1<<v;}if(exhausted||answers.length>=limit)break;}a[cell]=-1;}
  search();
 }answers.complete=!exhausted;return answers;
}

function partialSight(a,i,n){let lo=0,hi=0;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){let uncertain=false;for(let r=Math.floor(i/n)+dr,c=i%n+dc;r>=0&&c>=0&&r<n&&c<n;r+=dr,c+=dc){const v=a[r*n+c];if(v===0)break;hi++;if(v<0)uncertain=true;if(!uncertain)lo++;}}return [lo,hi];}
function rectangles(n,rng){const regions=[];function split(r,c,height,width){if((height<4&&width<4)||height*width<=6||rng()<.18){regions.push({r,c,height,width,cells:Array.from({length:height*width},(_,i)=>(r+Math.floor(i/width))*n+c+i%width)});return;}const horizontal=height>=4&&(width<4||rng()<.5),span=horizontal?height:width,cut=2+Math.floor(rng()*(span-3));if(horizontal){split(r,c,cut,width);split(r+cut,c,height-cut,width);}else{split(r,c,height,cut);split(r,c+cut,height,width-cut);}}split(0,0,n,n);return regions;}
function makeUnfilled(type,traitor,rng,n){
 for(let attempt=0;attempt<250;attempt++){
  const p={type,n,givens:[],clues:[],regions:[],outside:[],cages:[],inequalities:[],circles:{},blocked:Array(n*n).fill(0),fleet:n===8?[4,3,2,2,1,1,1]:[3,2,2,1,1,1]};let answer;
  if(type==='loops'){
   answer=denseLoop(n,rng,traitor===1?4:2);if(!answer)continue;
   const missing=shuffle(Array.from({length:n*n},(_,i)=>i).filter(i=>!answer.includes(i)),rng);missing.slice(0,2).forEach(i=>p.blocked[i]=1);
   const t=turns(answer,n);
   if(traitor===3)for(const cell of answer)p.circles[cell]=t.has(cell)?'black':'white';
   else{
    let previous=null;
    for(const cell of answer){const color=t.has(cell)?'black':'white';if(color!==previous){p.circles[cell]=color;previous=color;}}
    const circleCells=answer.filter(i=>p.circles[i]);if(circleCells.length%2)delete p.circles[circleCells.at(-1)];
    if(traitor===2){
     p.circles={};const cells=answer.filter(()=>rng()<.8);if(cells.length%2)cells.pop();const offset=rng()<.5?0:1;
     cells.forEach((cell,i)=>p.circles[cell]=(i+offset)%2?'black':'white');
    }
   }
   p.clues=missing.slice(0,2).map(cell=>({cell,value:around(cell,n).filter(i=>t.has(i)).length}));
   if(traitor===4)p.clues[Math.floor(rng()*2)].value++;
  }else if(type==='shading'){
   answer=largeAnswer('shading',n,traitor,rng);const shaded=answer.map((v,i)=>v?i:-1).filter(i=>i>=0),rs=shaded.map(i=>Math.floor(i/n)),cs=shaded.map(i=>i%n);if(shaded.length===(Math.max(...rs)-Math.min(...rs)+1)*(Math.max(...cs)-Math.min(...cs)+1)||noFour(answer,n)===(traitor===4))continue;
   for(let i=0;i<answer.length;i++)if(!answer[i])p.circles[i]='white';
   p.clues=answer.map((v,cell)=>({cell,value:count(answer,around(cell,n))})).filter(c=>!answer[c.cell]&&c.value===sight(answer,c.cell,n));
   if(traitor===1||traitor===3){const bad=shuffle(answer.map((v,i)=>i).filter(i=>!answer[i]&&count(answer,around(i,n))!==sight(answer,i,n)),rng)[0];if(bad===undefined)continue;p.clues.push({cell:bad,value:traitor===1?sight(answer,bad,n):count(answer,around(bad,n))});}
   do{p.regions=rectangles(n,rng).map(region=>({...region,value:count(answer,region.cells)}));}while(p.regions.length<3);if(traitor===2){const region=p.regions[Math.floor(rng()*p.regions.length)];region.value=(region.value+1)%(region.cells.length+1);}
  }else if(type==='numbers'){
   answer=structuredNumbers(n,traitor,rng);if(noParityTriple(answer,n)===(traitor===1))continue;
   for(const side of ['left','right','top','bottom'])for(let index=0;index<n;index++){const row=line(answer,{side,index},n),sky=skyline(row),first=row.slice(0,2),value=traitor===2?first.find(v=>v!==sky):traitor===3?(!first.includes(sky)?sky:undefined):(first.includes(sky)?sky:undefined);if(value!==undefined)p.outside.push({side,index,value});}
   if(p.outside.length<n)continue;
   for(let i=0;i<n*n;i++)for(const j of [i+1,i+n])if(j<n*n&&adjacent(i,j,n)){p.inequalities.push(answer[i]<answer[j]?[i,j]:[j,i]);if((answer[i]%2===answer[j]%2)===(traitor===4))p.cages.push([i,j]);}
   if(traitor===4&&!p.cages.length)continue;
   if(traitor===4){const opposite=[];for(let i=0;i<n*n;i++)for(const j of [i+1,i+n])if(j<n*n&&adjacent(i,j,n)&&answer[i]%2!==answer[j]%2)opposite.push([i,j]);const bad=shuffle(p.cages,rng)[0];p.cages=[bad,...disjointCages(opposite.filter(c=>c.every(i=>!bad.includes(i))),rng,n)];}else p.cages=disjointCages(p.cages,rng,n+1);if(p.cages.length<3)continue;
  }else{
   answer=shipAnswer(n,traitor,p.fleet,rng);if(!answer)continue;const parts=ships(answer,n);if(diagonalFree(parts,n)===(traitor===3))continue;
   p.clues=answer.map((v,cell)=>({cell,value:count(answer,around(cell,n))})).filter(c=>!answer[c.cell]);if(traitor===1)p.clues[Math.floor(rng()*p.clues.length)].value++;
   p.outside=['left','top'].flatMap(side=>Array.from({length:n},(_,index)=>({side,index,value:line(answer,{side,index},n).filter(Boolean).length})));if(traitor===2)p.outside[Math.floor(rng()*p.outside.length)].value++;
  }
  if(!baseHolds(p,answer)||ruleResults(p,answer).filter(Boolean).length!==3||ruleResults(p,answer)[traitor-1])continue;
  const initial=solveLarge(p,2);if(!initial.complete||initial.length!==1)continue;
  if(type==='shading'){
   // A numbered circle and its unshaded-cell constraint are one removable clue.
   for(const cell of shuffle(Object.keys(p.circles),rng)){
    const circles={...p.circles};delete circles[cell];const clues=p.clues.filter(c=>c.cell!==Number(cell)),test={...p,circles,clues};
    if(ruleResults(test,answer).filter(Boolean).length!==3)continue;
    const result=solveLarge(test,2);if(result.complete&&result.length===1){p.circles=circles;p.clues=clues;}
   }
   if(Object.keys(p.circles).length>n)continue;
  }
  if(type==='loops'){
   for(const cell of shuffle(Object.keys(p.circles),rng)){const circles={...p.circles};delete circles[cell];const test={...p,circles};if(ruleResults(test,answer).filter(Boolean).length!==3)continue;const result=solveLarge(test,2);if(result.complete&&result.length===1)p.circles=circles;}
   if(Object.keys(p.circles).length>=answer.length*.85)continue;
  }
  if(type==='numbers'){
   for(const clue of shuffle(p.outside,rng)){if(p.outside.length<=n)break;const outside=p.outside.filter(c=>c!==clue),test={...p,outside};if(ruleResults(test,answer).filter(Boolean).length!==3)continue;const result=solveLarge(test,2);if(result.complete&&result.length===1)p.outside=outside;}
   for(const cage of shuffle(p.cages,rng)){if(p.cages.length<=Math.max(3,Math.ceil(n/2)))break;const cages=p.cages.filter(c=>c!==cage),test={...p,cages};if(ruleResults(test,answer).filter(Boolean).length!==3)continue;const result=solveLarge(test,2);if(result.complete&&result.length===1)p.cages=cages;}
   if(p.outside.length!==n||['left','right','top','bottom'].some(side=>p.outside.filter(c=>c.side===side).length===n))continue;
  }
  if(type==='objects')for(const clue of shuffle(p.clues,rng)){const next=p.clues.filter(c=>c!==clue);const test={...p,clues:next};if(!baseHolds(test,answer)||ruleResults(test,answer).filter(Boolean).length!==3)continue;const result=solveShips(test,2,2000);if(result.complete&&result.length===1)p.clues=next;}
  if(type==='numbers')for(const clue of shuffle(p.inequalities,rng)){const next=p.inequalities.filter(c=>c!==clue),result=solveLarge({...p,inequalities:next},2);if(result.complete&&result.length===1)p.inequalities=next;if(p.inequalities.length<=n*n)break;}
  return {...p,answer,traitor,unique:true};
 }
 throw new Error(`Could not prove a unique ${type} puzzle without answer givens. Try another seed.`);
}
function shipAnswer(n,traitor,fleet,rng){
 const out=Array(n*n).fill(0),sizes=traitor===4?[...fleet,[...new Set(fleet)][Math.floor(rng()*new Set(fleet).size)]]:fleet;
 for(const length of sizes){let placed=false;for(let k=0;k<500;k++){const start=Math.floor(rng()*out.length),step=rng()<.5?1:n,part=Array.from({length},(_,i)=>start+i*step);if(part.some(i=>i>=out.length||(step===1&&Math.floor(i/n)!==Math.floor(start/n))||out[i]||out.some((v,j)=>v&&adjacent(i,j,n))))continue;if(traitor!==3&&part.some(i=>out.some((v,j)=>v&&Math.abs(Math.floor(i/n)-Math.floor(j/n))===1&&Math.abs(i%n-j%n)===1)))continue;part.forEach(i=>out[i]=1);placed=true;break;}if(!placed)return null;}return out;
}
function solveShips(p,limit,maxNodes=24000){
 const n=p.n,solutions=[],seen=new Set(),blocked=new Set(p.clues.map(c=>c.cell));for(const g of p.givens)if(!g.value)blocked.add(g.cell);
 let nodes=0,cut=false;
 const placements=new Map();for(const length of [...new Set(p.fleet)]){const list=[];for(let cell=0;cell<n*n;cell++)for(const step of length===1?[1]:[1,n]){const cells=Array.from({length},(_,i)=>cell+i*step);if(cells.some(i=>i>=n*n||(step===1&&Math.floor(i/n)!==Math.floor(cell/n))||blocked.has(i)))continue;list.push(cells);}placements.set(length,list);}
 for(let traitor=1;traitor<=4;traitor++)for(const extra of traitor===4?[...new Set(p.fleet)]:[0]){
  const fleet=[...p.fleet,...(extra?[extra]:[])].sort((a,b)=>b-a),values=Array(n*n).fill(0),chosen=[];
  function search(depth){if(++nodes>maxNodes){cut=true;return;}
   if(traitor!==1&&p.clues.some(c=>{const used=count(values,around(c.cell,n)),remaining=fleet.slice(depth).reduce((a,b)=>a+b,0);return used>c.value||used+remaining<c.value;}))return;
   if(traitor!==2&&p.outside.some(c=>{const used=line(values,c,n).filter(Boolean).length,remaining=fleet.slice(depth).reduce((a,b)=>a+b,0);return used>c.value||used+remaining<c.value;}))return;
   if(depth===fleet.length){if(!baseHolds(p,values))return;const rules=ruleResults(p,values);if(rules.filter(Boolean).length!==3||rules[traitor-1])return;const key=values.join('');if(!seen.has(key)){seen.add(key);solutions.push({answer:[...values],traitor});}return;}
   const length=fleet[depth],list=placements.get(length),begin=depth&&fleet[depth-1]===length?chosen[depth-1]+1:0;
   for(let k=begin;k<list.length;k++){const cells=list[k];if(cells.some(i=>values[i]||values.some((v,j)=>v&&(adjacent(i,j,n)||(traitor!==3&&Math.abs(Math.floor(i/n)-Math.floor(j/n))===1&&Math.abs(i%n-j%n)===1)))))continue;
    cells.forEach(i=>values[i]=1);chosen[depth]=k;search(depth+1);cells.forEach(i=>values[i]=0);if(cut||solutions.length>=limit)return;}
  }search(0);if(cut||solutions.length>=limit){solutions.complete=!cut;return solutions;}
 }
 solutions.complete=!cut;return solutions;
}

function structuredNumbers(n,traitor,rng){
 const columns=traitor===1?[0,2,4,1,3,...Array.from({length:n-5},(_,i)=>i+5)]:traitor===4?[0,2,1,...Array.from({length:n-3},(_,i)=>i+3)]:Array.from({length:n},(_,i)=>i);
 const flipR=rng()<.5,flipC=rng()<.5,transpose=rng()<.5,phase=Math.floor(rng()*n),reverse=rng()<.5;
 return Array.from({length:n*n},(_,i)=>{let r=Math.floor(i/n),c=i%n;if(transpose)[r,c]=[c,r];if(flipR)r=n-1-r;if(flipC)c=n-1-c;const v=(r+columns[c]+phase)%n+1;return reverse?n+1-v:v;});
}

function denseLoop(n,rng,omitted){
 let path;
 for(let attempt=0;attempt<40;attempt++){
  path=[0,1,n+1,n];
  while(path.length<n*n-omitted){
   const options=[];
   for(let i=0;i<path.length;i++){
    const a=path[i],b=path[(i+1)%path.length];
    for(const shift of Math.floor(a/n)===Math.floor(b/n)?[-n,n]:[-1,1]){
     const c=a+shift,d=b+shift;
     if(c>=0&&d>=0&&c<n*n&&d<n*n&&adjacent(a,c,n)&&adjacent(b,d,n)&&!path.includes(c)&&!path.includes(d))options.push([i,c,d]);
    }
   }
   if(!options.length)break;const [i,c,d]=options[Math.floor(rng()*options.length)];path.splice(i+1,0,c,d);
  }
  if(path.length===n*n-omitted)break;
 }
 if(path.length!==n*n-omitted)return null;
 const rotation=Math.floor(rng()*4),mirror=rng()<.5;
 return path.map(i=>{let r=Math.floor(i/n),c=i%n;if(mirror)c=n-1-c;for(let k=0;k<rotation;k++)[r,c]=[c,n-1-r];return r*n+c;});
}
function solveLoopDomains(p,limit){
 const n=p.n,size=n*n,solutions=[],seen=new Set();let nodes=0,exhausted=false;
 const links=Array.from({length:size},(_,i)=>[[i-n,1,4],[i+1,2,8],[i+n,4,1],[i-1,8,2]].filter(([j])=>j>=0&&j<size&&adjacent(i,j,n)));
 const isTurn=m=>m!==0&&m!==5&&m!==10;
 for(let traitor=1;traitor<=4;traitor++){
  const mandatory=p.blocked.map((v,i)=>!v&&(traitor!==1||!!p.circles[i]));
  const initial=links.map((near,i)=>{
   if(p.blocked[i])return [0];let opts=mandatory[i]?[]:[0];
   for(let a=0;a<near.length;a++)for(let b=a+1;b<near.length;b++){const mask=near[a][1]|near[b][1];if(traitor!==2&&p.circles[i]&&(isTurn(mask)!==(p.circles[i]==='black')))continue;opts.push(mask);}
   for(const g of p.givens){const [a,b]=g.edge.split(',').map(Number);if(i!==a&&i!==b)continue;const bit=near.find(([j])=>j===(i===a?b:a))?.[1];opts=opts.filter(m=>!!(m&bit)===!!g.value);}return opts;
  });
  function propagate(d){
   let changed=true;while(changed){changed=false;
    for(let i=0;i<size;i++){
     const opts=d[i].filter(m=>links[i].every(([j,bit,other])=>d[j].some(v=>!!(v&other)===!!(m&bit))));
     if(!opts.length)return false;if(opts.length!==d[i].length){d[i]=opts;changed=true;}
    }
    if(traitor!==4)for(const clue of p.clues){
     const near=around(clue.cell,n),lo=near.filter(i=>d[i].every(isTurn)).length,hi=near.filter(i=>d[i].some(isTurn)).length;
     if(lo>clue.value||hi<clue.value)return false;
     if(lo===clue.value||hi===clue.value)for(const i of near){if(d[i].every(isTurn)||!d[i].some(isTurn))continue;const opts=d[i].filter(m=>isTurn(m)===(hi===clue.value));if(opts.length!==d[i].length){d[i]=opts;changed=true;}}
    }
    if(traitor!==3){
     const fixed=d.map((opts,i)=>links[i].filter(([j,bit])=>opts.every(m=>m&bit)).map(([j])=>j)),seenPaths=new Set();
     const starts=fixed.map((near,i)=>i).sort((a,b)=>fixed[a].length-fixed[b].length);
     for(const start of starts)if(fixed[start].length&&!seenPaths.has(start)){
      let previous=-1,current=start,lastColor=null,firstColor=null,circleCount=0;
      do{seenPaths.add(current);const color=p.circles[current];if(color){if(color===lastColor)return false;lastColor=color;firstColor??=color;circleCount++;}
       const next=fixed[current].find(j=>j!==previous);if(next===undefined)break;previous=current;current=next;
      }while(current!==start&&!seenPaths.has(current));
      if(current===start&&circleCount>1&&lastColor===firstColor)return false;
     }
    }
    // A forced closed cycle cannot coexist with another required loop cell.
    const visited=new Set();for(let start=0;start<size;start++)if(d[start].length===1&&d[start][0]&&!visited.has(start)){
     const part=[],queue=[start];let closed=true;visited.add(start);
     for(const i of queue){part.push(i);for(const [j,bit] of links[i])if(d[i][0]&bit){if(d[j].length!==1){closed=false;continue;}if(!visited.has(j)){visited.add(j);queue.push(j);}}}
     if(closed){if(mandatory.some((v,i)=>v&&!part.includes(i)))return false;for(let i=0;i<size;i++)if(!part.includes(i)&&d[i].length!==1){if(!d[i].includes(0))return false;d[i]=[0];changed=true;}}
    }
   }return true;
  }
  function search(d){
   if(++nodes>24000){exhausted=true;return;}if(!propagate(d))return;
   const cell=d.reduce((best,opts,i)=>opts.length>1&&(best<0||opts.length<d[best].length)?i:best,-1);
   if(cell<0){
    const start=d.findIndex(opts=>opts[0]),path=[];if(start<0)return;let previous=-1,current=start;
    do{if(path.includes(current))return;path.push(current);const next=links[current].find(([j,bit])=>(d[current][0]&bit)&&j!==previous)?.[0];if(next===undefined)return;previous=current;current=next;}while(current!==start);
    if(path.length!==d.filter(opts=>opts[0]).length||!baseHolds(p,path))return;const rules=ruleResults(p,path);if(rules.filter(Boolean).length!==3||rules[traitor-1])return;
    const key=loopEdges(path).sort().join(';');if(!seen.has(key)){seen.add(key);solutions.push({answer:path,traitor});}return;
   }
   for(const mask of d[cell]){const next=d.map(opts=>opts.slice());next[cell]=[mask];search(next);if(exhausted||solutions.length>=limit)return;}
  }
  search(initial);if(exhausted||solutions.length>=limit)break;
 }solutions.complete=!exhausted;return solutions;
}
function solveShading(p,limit){
 const n=p.n,size=n*n,solutions=[],seen=new Set();let nodes=0,exhausted=false;
 const neighbours=Array.from({length:size},(_,i)=>[i-n,i+n,i-1,i+1].filter(j=>j>=0&&j<size&&adjacent(i,j,n)));
 const runs=rows(Array.from({length:size},(_,i)=>i),n).flatMap(row=>Array.from({length:n-3},(_,k)=>row.slice(k,k+4)));
 const rays=p.clues.map(clue=>({clue,lines:[[-1,0],[1,0],[0,-1],[0,1]].map(([dr,dc])=>{const cells=[];for(let r=Math.floor(clue.cell/n)+dr,c=clue.cell%n+dc;r>=0&&c>=0&&r<n&&c<n;r+=dr,c+=dc)cells.push(r*n+c);return cells;})}));
 function sightBounds(a,lines){let lo=0,hi=0;for(const cells of lines){let uncertain=false;for(const i of cells){if(a[i]===0)break;hi++;if(a[i]<0)uncertain=true;if(!uncertain)lo++;}}return [lo,hi];}
 // Each branch applies the base rule and exactly three of the four IB rules.
 for(let traitor=1;traitor<=4;traitor++){
  const equations=[...(traitor!==1?p.clues.map(c=>({cells:around(c.cell,n),value:c.value})):[]),...(traitor!==2?p.regions:[])];
  const weights=Array(size).fill(0);for(const e of equations)for(const i of e.cells)weights[i]+=4/e.cells.length;if(traitor!==3)for(const ray of rays)for(const cells of ray.lines)cells.forEach((i,k)=>weights[i]+=2/(k+1));
  const initial=Array(size).fill(-1);for(const cell of Object.keys(p.circles))initial[Number(cell)]=0;for(const clue of p.clues)initial[clue.cell]=0;for(const g of p.givens)initial[g.cell]=g.value;
  function propagate(a){
   let changed=true;while(changed){changed=false;
    for(const {cells,value} of equations){const used=cells.filter(i=>a[i]===1).length,blank=cells.filter(i=>a[i]<0);if(used>value||used+blank.length<value)return false;if(used===value||used+blank.length===value)for(const i of blank){a[i]=used===value?0:1;changed=true;}}
    if(traitor!==4)for(const cells of runs){const used=cells.filter(i=>a[i]===1).length;if(used===4)return false;if(used===3)for(const i of cells)if(a[i]<0){a[i]=0;changed=true;}}
    if(traitor!==3)for(const {clue,lines} of rays){const [lo,hi]=sightBounds(a,lines);if(lo>clue.value||hi<clue.value)return false;
     for(const cells of lines)for(const i of cells){if(a[i]===0)break;if(a[i]>=0)continue;const allowed=[];for(const v of [0,1]){a[i]=v;const [min,max]=sightBounds(a,lines);if(min<=clue.value&&max>=clue.value)allowed.push(v);}a[i]=-1;if(!allowed.length)return false;if(allowed.length===1){a[i]=allowed[0];changed=true;if(a[i]===0)break;}}
    }
    // Connectivity permits every shape, including bends, branches and holes.
    const first=a.findIndex(v=>v===1);if(first>=0){const reach=new Set([first]),queue=[first];for(const i of queue)for(const j of neighbours[i])if(a[j]!==0&&!reach.has(j)){reach.add(j);queue.push(j);}if(a.some((v,i)=>v===1&&!reach.has(i)))return false;for(let i=0;i<size;i++)if(a[i]<0&&!reach.has(i)){a[i]=0;changed=true;}}
   }return true;
  }
  function search(a){if(++nodes>24000){exhausted=true;return;}if(!propagate(a))return;let cell=-1;for(let i=0;i<size;i++)if(a[i]<0&&(cell<0||weights[i]>weights[cell]))cell=i;
   if(cell<0){if(!baseHolds(p,a))return;const rules=ruleResults(p,a);if(rules.filter(Boolean).length!==3||rules[traitor-1])return;const key=a.join('');if(!seen.has(key)){seen.add(key);solutions.push({answer:a,traitor});}return;}
   for(const v of [0,1]){const next=a.slice();next[cell]=v;search(next);if(exhausted||solutions.length>=limit)return;}
  }
  search(initial);if(exhausted||solutions.length>=limit)break;
 }solutions.complete=!exhausted;return solutions;
}

function disjointCages(candidates,rng,limit){
 const used=new Set(),cages=[];
 for(const cage of shuffle(candidates,rng)){
  if(cage.some(cell=>used.has(cell)))continue;
  cages.push(cage);cage.forEach(cell=>used.add(cell));if(cages.length===limit)break;
 }
 return cages;
}
