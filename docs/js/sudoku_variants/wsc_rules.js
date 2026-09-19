(function(root,factory){var api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Wsc2026Rules=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const kinds=['wscescape','creasing','palindrome','hundred','flamepath','fractal','disguisedqueen','antiwindoku','nothreeinaline','clonealongline','tunnel','number5stillalive','missingarrow','missingthermo','transparentkropkipairs','unordereddistances','nexttox','anticlone','friends','enemies','antioutside','multidiagonal','sudokuwithnames','sforsudoku','attacktheleader','trishula','divisorsumpairs','magicsword','neighbouringdisparity','indextoone','primerunsum','even','odd'];
 const cell=c=>c&&Number.isInteger(c.row)&&Number.isInteger(c.col)&&c.row>=0&&c.row<9&&c.col>=0&&c.col<9;
 const cells=a=>Array.isArray(a)&&a.length>0&&a.every(cell)&&new Set(a.map(c=>c.row*9+c.col)).size===a.length;
 function valid(q){
  if(!q||!kinds.includes(q.kind))return false;
  if(['wscescape','flamepath','fractal','disguisedqueen','antiwindoku'].includes(q.kind))return cells(q.cells)&&q.cells.length===81;
  if(q.kind==='hundred')return Array.isArray(q.groups)&&q.groups.length>0&&q.groups.every(cells);
  if(q.kind==='trishula')return cells(q.cells)&&cells(q.tips)&&q.tips.length===3;
  if(['clonealongline','anticlone'].includes(q.kind))return cells(q.cells)&&cells(q.other)&&q.other.length===q.cells.length;
  if(q.kind==='sforsudoku')return cells(q.cells)&&Array.isArray(q.allowed)&&q.allowed.length>0&&q.allowed.every(n=>Number.isInteger(n)&&n>=1&&n<=9);
  if(q.kind==='attacktheleader')return cells(q.cells)&&cell(q.origin)&&Array.isArray(q.directions)&&q.directions.every(d=>['left','up-left','up','up-right','right','down-right','down','down-left'].includes(d));
  if(q.kind==='neighbouringdisparity')return cells(q.cells)&&cell(q.origin);
  if(['magicsword','nexttox'].includes(q.kind))return Array.isArray(q.clues)&&q.clues.length>0&&q.clues.every(c=>cells(c.cells)&&(q.kind==='magicsword'?Number.isInteger(c.value)&&c.value>=0&&c.value<=9:/^[1-9]{1,2}$/.test(String(c.value))));
  if(q.kind==='divisorsumpairs')return cells(q.cells)&&q.cells.length===2&&Number.isInteger(q.value)&&q.value>0;
  if(q.kind==='indextoone')return cells(q.cells)&&Number.isInteger(q.value)&&q.value>=1&&q.value<=9;
  if(q.kind==='primerunsum')return cells(q.cells)&&Number.isInteger(q.value)&&q.value>=0;
  if(q.kind==='unordereddistances')return cells(q.cells)&&[q.x,q.y,q.distance].every(n=>Number.isInteger(n)&&n>=1&&n<=9)&&q.x!==q.y;
  if(['antioutside','sudokuwithnames'].includes(q.kind))return cells(q.cells)&&Array.isArray(q.digits)&&q.digits.length>0&&q.digits.every(n=>Number.isInteger(n)&&n>=1&&n<=9);
  if(q.kind==='missingthermo'&&q.paths!==undefined){if(!Array.isArray(q.paths)||!q.paths.length||!q.paths.every(p=>cells(p)&&p.length>=2))return false;const ids=new Set(q.cells?.map(c=>c.row*9+c.col));if(q.paths.flat().some(c=>!ids.has(c.row*9+c.col)))return false;}
  if(['nothreeinaline','tunnel','missingarrow'].includes(q.kind))return cells(q.cells)&&q.cells.length>=3;
  if(q.kind==='transparentkropkipairs')return cells(q.cells)&&q.cells.length===2;
  return cells(q.cells);
 }
 function validate(board,q){
  if(!valid(q))return false;
  const at=c=>board[c.row]?.[c.col]||0, vals=cs=>cs.map(at), v=vals(q.cells||[]), full=v.every(Boolean), unique=a=>new Set(a.filter(Boolean)).size===a.filter(Boolean).length;
  switch(q.kind){
   case 'hundred': {let lo=0,hi=0;for(const g of q.groups){let l=0,h=0;for(const d of vals(g)){l=l*10+(d||1);h=h*10+(d||9);}lo+=l;hi+=h;}return lo<=100&&hi>=100;}
   case 'fractal': for(let br=0;br<9;br+=3)for(let bc=0;bc<9;bc+=3)for(let k=0;k<3;k++){for(const group of [[0,1,2].map(j=>board[br+k][bc+j]),[0,1,2].map(j=>board[br+j][bc+k])]){const bins=group.filter(Boolean).map(d=>Math.floor((d-1)/3));if(new Set(bins).size!==bins.length)return false;}}return true;
   case 'wscescape': {const seen=new Set(),queue=[[4,4]],edges=new Set();while(queue.length){const [r,c]=queue.pop();if(r<0||r>8||c<0||c>8||seen.has(r*9+c)||(board[r][c]&&board[r][c]%2===0))continue;seen.add(r*9+c);if(r===0)edges.add('top');if(r===8)edges.add('bottom');if(c===0)edges.add('left');if(c===8)edges.add('right');queue.push([r+1,c],[r-1,c],[r,c+1],[r,c-1]);}return edges.size===4;}
   case 'flamepath': {const seen=new Set(),queue=[[0,0]];while(queue.length){const [r,c]=queue.pop();if(r<0||r>8||c<0||c>8||seen.has(r*9+c)||[1,5,9].includes(board[r][c]))continue;if(r===8&&c===8)return true;seen.add(r*9+c);queue.push([r+1,c],[r-1,c],[r,c+1],[r,c-1]);}return false;}
   case 'disguisedqueen': return [1,2,3,4,5,6,7,8,9].some(d=>{const cs=q.cells.filter(c=>at(c)===d);return cs.every((a,i)=>cs.slice(i+1).every(b=>Math.abs(a.row-b.row)!==Math.abs(a.col-b.col)));});
   case 'antiwindoku': for(const br of [1,5])for(const bc of [1,5]){const ds=[];for(let r=br;r<br+3;r++)for(let c=bc;c<bc+3;c++)ds.push(board[r][c]);const n=new Set(ds.filter(Boolean)).size;if(n>4||n+ds.filter(d=>!d).length<4)return false;}return true;
   case 'creasing': return [1,-1].some(sign=>v.every((d,i)=>!d||v.slice(i+1).every(e=>!e||(e-d)*sign>0)));
   case 'palindrome': return v.every((d,i)=>!d||!v[v.length-1-i]||d===v[v.length-1-i]);
   case 'nothreeinaline':return v.every((d,i)=>i<2||!d||!v[i-1]||!v[i-2]||d%2!==v[i-1]%2||d%2!==v[i-2]%2);
   case 'clonealongline': {const w=vals(q.other);return [w,w.slice().reverse()].some(a=>v.every((d,i)=>!d||!a[i]||d===a[i]));}
   case 'tunnel': {const ends=[v[0],v[v.length-1]];return v.slice(1,-1).every(d=>!d||ends.every(e=>!e||d<e))&&v.every((d,i)=>!i||!d||!v[i-1]||Math.abs(d-v[i-1])<=3);}
   case 'number5stillalive': {if(!unique(v))return false;const s=v.reduce((a,b)=>a+b,0),n=v.filter(d=>!d).length;return [5,15,25,35,45].some(t=>s+n<=t&&s+9*n>=t);}
   case 'missingarrow':return [v,v.slice().reverse()].some(a=>{const sum=a.slice(1).reduce((s,d)=>s+d,0),n=a.slice(1).filter(d=>!d).length;return a[0]?sum+n<=a[0]&&sum+9*n>=a[0]:sum+n<=9;});
   case 'missingthermo': {const paths=q.paths||[q.cells]; const edges=[];paths.forEach(p=>p.slice(1).forEach((c,i)=>edges.push([p[i],c])));const map=new Map();edges.forEach(([a,b])=>{const ka=a.row*9+a.col,kb=b.row*9+b.col;(map.get(ka)||map.set(ka,[]).get(ka)).push(kb);(map.get(kb)||map.set(kb,[]).get(kb)).push(ka);});return [...map.keys()].filter(k=>map.get(k).length===1).some(start=>{let queue=[[start,-1]],seen=new Set();while(queue.length){const [k,parent]=queue.shift();if(seen.has(k))return false;seen.add(k);for(const next of map.get(k)){if(next===parent)continue;const a=board[Math.floor(k/9)][k%9],b=board[Math.floor(next/9)][next%9];if(a&&b&&a>=b)return false;queue.push([next,k]);}}return true;});}
   case 'transparentkropkipairs':return !full||Math.abs(v[0]-v[1])===1||v[0]===2*v[1]||v[1]===2*v[0];
   case 'unordereddistances':{const a=v.indexOf(q.x),b=v.indexOf(q.y);return a<0||b<0||Math.abs(a-b)===q.distance;}
   case 'nexttox':return [1,2,3,4,5,6,7,8,9].some(x=>q.clues.every(clue=>{const a=vals(clue.cells),ds=String(clue.value).split('').map(Number);return a.some((d,i)=>{if(d&&d!==x)return false;const ns=[i? a[i-1]:null,i<8?a[i+1]:null].filter(n=>n!==null);return ns.length===ds.length&&ns.every(n=>!n||ds.includes(n))&&(!ns.every(Boolean)||ds.every(n=>ns.includes(n)));});}));
   case 'anticlone':return v.every((d,i)=>!d||!at(q.other[i])||d+at(q.other[i])===10);
   case 'friends':return new Set(v.filter(Boolean)).size<=1;
   case 'enemies':case 'multidiagonal':return unique(v);
   case 'antioutside':return v.slice(0,3).every(d=>!q.digits.includes(d));
   case 'sudokuwithnames': {let positions=[-1];for(const d of q.digits){const next=[];for(let i=0;i<v.length;i++)if((!v[i]||v[i]===d)&&positions.some(j=>j<i))next.push(i);positions=next;}return positions.length>0;}
   case 'sforsudoku':return v.every(d=>!d||q.allowed.includes(d));
   case 'attacktheleader':{const n=at(q.origin);if(!n)return true;const distances={};for(const [dir,dr,dc] of [['left',0,-1],['up-left',-1,-1],['up',-1,0],['up-right',-1,1],['right',0,1],['down-right',1,1],['down',1,0],['down-left',1,-1]]){let unknown=false;for(let s=1;;s++){const r=q.origin.row+dr*s,c=q.origin.col+dc*s;if(r<0||r>8||c<0||c>8){distances[dir]=unknown?null:Infinity;break;}const d=board[r][c];if(!d)unknown=true;if(d>n){distances[dir]=unknown?null:s;break;}}}if(Object.values(distances).some(d=>d===null))return true;const min=Math.min(...Object.values(distances));return Object.entries(distances).every(([dir,d])=>q.directions.includes(dir)===(d===min&&d!==Infinity));}
   case 'trishula':{const tips=vals(q.tips);if(!full||!tips.every(Boolean))return true;const expected=[Math.min(...v),v.reduce((s,d)=>s+d,0)/v.length,Math.max(...v)].sort((a,b)=>a-b);return tips.slice().sort((a,b)=>a-b).every((d,i)=>d===expected[i]);}
   case 'divisorsumpairs':return !full||(v[0]+v[1])%q.value===0;
   case 'magicsword':return [1,2,3,4,5,6,7,8,9,10].some(y=>q.clues.every(c=>{const a=vals(c.cells);return a.slice(0,c.value).every(d=>!d||d<y)&&(c.value===9||!a[c.value]||a[c.value]>=y);}));
   case 'neighbouringdisparity':return !at(q.origin)||v.every(d=>!d||d%2!==at(q.origin)%2);
   case 'indextoone':{const n=v[q.value-1];return !n||!v[n-1]||v[n-1]===1;}
   case 'primerunsum':{let sum=0,started=false;for(const d of v){if(!d)return true;if([2,3,5,7].includes(d)){started=true;sum+=d;}else if(started)break;}return sum===q.value;}
   case 'even':return v.every(d=>!d||d%2===0);
   case 'odd':return v.every(d=>!d||d%2===1);
  }return false;
 }
 return {valid,validate,kinds};
});
