import {puzzleSvg} from './downloadSudokuSvg.mjs';
import {FLOWER_LAYOUTS} from './flowerGeometry.mjs';
import {pentagramPosition} from './pentagram.mjs';
export const ROUND_GENRES=[['perfect','1. Perfect Squares Sudoku'],['arithmetic','2. Arithmetic Pairs Sudoku'],['division','3. Division Sudoku'],['product','4. Product Killer Sudoku'],['killer','5. Killer Sudoku']];
export const ROUND_SIZE=2200;
const middle=1100;
export const ROUND_PLACEMENTS=[{x:middle-300,y:middle-300,width:600,height:600},...ROUND_GENRES.map((_,i)=>{
 // Opposite the five concave-corner directions of an upright Pentagram.
 const a=(-90+i*72)*Math.PI/180;
 return {x:middle+530*Math.cos(a)-300,y:middle+530*Math.sin(a)-305,width:600,height:570};
})];
export function roundConnections(){
 const tips=FLOWER_LAYOUTS.petals.geometries.slice(80).map(c=>({x:800+c.vertices[0].x*.75,y:800+c.vertices[0].y*.75}));
 return ROUND_PLACEMENTS.slice(1).flatMap((placement,i)=>{
  // Two adjacent Flower tips face each upright Pentagram. The perimeter
  // columns 2 and 7 are the two attachment points on its facing side.
  const angle=(-90+i*72)*Math.PI/180;
  const facing={x:middle+Math.cos(angle)*270,y:middle+Math.sin(angle)*270};
  const nearest=tips.map((tip,index)=>({index,distance:Math.hypot(tip.x-facing.x,tip.y-facing.y)})).sort((a,b)=>a.distance-b.distance);
  const pair=nearest.slice(0,2).map(item=>tips[item.index]);
  const candidates=Array.from({length:5},(_,p)=>[pentagramPosition(p,1,5/8),pentagramPosition((p+4)%5,5/8,1)].map(c=>({x:placement.x+c.x,y:placement.y+c.y})));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  let best=null,score=Infinity;
  for(const targets of candidates)for(const ordered of [targets,[...targets].reverse()]){
   const sum=distance(pair[0],ordered[0])+distance(pair[1],ordered[1]);
   if(sum<score){score=sum;best=ordered;}
  }
  return pair.map((from,j)=>({from,to:best[j]}));
 });
}
export function flowerRoundSvg(boards,solution=false,order=[0,1,2,3,4]){
 const ns='http://www.w3.org/2000/svg',root=document.createElementNS(ns,'svg');
 root.setAttribute('viewBox',`0 0 ${ROUND_SIZE} ${ROUND_SIZE}`);root.setAttribute('xmlns',ns);
 const add=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));root.append(e);return e;};
 add('rect',{width:ROUND_SIZE,height:ROUND_SIZE,fill:'white'});
 for(const {from,to} of roundConnections())add('line',{x1:from.x,y1:from.y,x2:to.x,y2:to.y,stroke:'#777','stroke-width':2});
 [boards[0],...order.map(index=>boards[index+1])].forEach((board,i)=>{
  if(!board)return;
  const svg=new DOMParser().parseFromString(puzzleSvg(board,solution),'image/svg+xml').documentElement;
  const place=ROUND_PLACEMENTS[i];
  for(const [k,v] of Object.entries(place))svg.setAttribute(k,String(v));
  svg.querySelectorAll('[id]').forEach(e=>{const old=e.id,next=`round-${i}-${old}`;e.id=next;svg.querySelectorAll('*').forEach(n=>{for(const attr of [...n.attributes])if(attr.value.includes(`url(#${old})`))n.setAttribute(attr.name,attr.value.replaceAll(`url(#${old})`,`url(#${next})`));});});
  svg.querySelectorAll('.cell').forEach((cell,index)=>{cell.setAttribute('data-board',String(i?order[i-1]+1:0));cell.setAttribute('data-cell',String(index));});
  root.append(svg);
  if(i){const text=add('text',{x:place.x+300,y:i!==1?place.y+place.height+28:place.y-12,'text-anchor':'middle','font-size':24,'font-family':'Arial',fill:'#111',class:'decoration-clue'});text.textContent=ROUND_GENRES[order[i-1]][1];}
 });
 return root;
}
