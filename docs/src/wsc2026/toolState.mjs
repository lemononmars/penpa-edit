const PREFIX='wsc2026-tool-';
const digits=(values,count,max=9)=>Array.isArray(values)&&values.length===count&&values.every(v=>Number.isInteger(v)&&v>=0&&v<=max);
const grid=(values,rows,cols,max=9)=>Array.isArray(values)&&values.length===rows&&values.every(row=>Array.isArray(row)&&digits(row.map(Number),cols,max));
const notes=(values,count)=>Array.isArray(values)&&values.length===count&&values.every(row=>Array.isArray(row)&&row.every(v=>Number.isInteger(v)&&v>=1&&v<=9));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
export function validateToolState(tool,state){
 if(!object(state))return false;
 if(tool==='hundred')return Number.isInteger(state.groupIndex)&&state.groupIndex>=0&&state.groupIndex<7&&typeof state.query==='string'&&(state.chosenNumber===null||Number.isInteger(state.chosenNumber));
 if(tool==='blind')return (Array.isArray(state.clues)?digits(state.clues,36,511)&&['set','solve'].includes(state.editMode):grid(state.board,6,6,6)&&grid(state.solution,6,6,6))&&grid(state.entries,6,6,6)&&Array.isArray(state.revealed)&&state.revealed.length<=2&&state.revealed.every(v=>Number.isInteger(v)&&v>=0&&v<36);
 if(!['set','solve'].includes(state.editMode)||!['normal','center','corner'].includes(state.mode))return false;
 if(tool==='shifted')return grid(state.coreDigits,9,9)&&grid(state.outerDigits,9,54)&&Array.isArray(state.rotations)&&state.rotations.length===4&&state.rotations.every((v,i)=>Number.isInteger(v)&&v>=0&&v<(i===3?18:9))&&['classic','outer'].includes(state.view)&&object(state.givens)&&Object.values(state.givens).every(v=>typeof v==='boolean')&&object(state.notes)&&Object.values(state.notes).every(n=>Array.isArray(n)&&n.every(v=>Number.isInteger(v)&&v>=1&&v<=9))&&object(state.arrows)&&Object.values(state.arrows).every(a=>Array.isArray(a)&&a.every(v=>object(v)&&[-1,0,1].includes(v.dx)&&[-1,0,1].includes(v.dy)&&(v.dx||v.dy)))&&(state.selected===null||object(state.selected)&&['core','outer'].includes(state.selected.surface)&&Number.isInteger(state.selected.row)&&state.selected.row>=0&&state.selected.row<9&&Number.isInteger(state.selected.col)&&state.selected.col>=0&&state.selected.col<(state.selected.surface==='core'?9:54))&&Number.isInteger(state.selectedRing)&&state.selectedRing>=0&&state.selectedRing<4;
 const count=tool==='flower'?90:tool==='pentagram'?80:0;
 if(!count||!digits(state.values,count)||!Array.isArray(state.givens)||state.givens.length!==count||!state.givens.every(v=>typeof v==='boolean')||!notes(state.centerNotes,count)||!notes(state.cornerNotes,count)||!Number.isInteger(state.selected)||state.selected<0||state.selected>=count)return false;
 if(tool==='pentagram')return object(state.edgeDots)&&Object.values(state.edgeDots).every(v=>object(v)&&['black','white'].includes(v.kind)&&typeof v.clue==='string')&&Array.isArray(state.cages)&&state.cages.every(c=>object(c)&&typeof c.clue==='string'&&Array.isArray(c.cells)&&c.cells.every(v=>Number.isInteger(v)&&v>=0&&v<80))&&Array.isArray(state.cageDraft)&&state.cageDraft.every(v=>Number.isInteger(v)&&v>=0&&v<80)&&['digits','black','white','cage'].includes(state.decorationMode)&&typeof state.dotClue==='string'&&typeof state.cageClue==='string';
 return true;
}
export function parseToolBackup(text,tool){
 const data=JSON.parse(text);
 if(data.version!==1||data.tool!==tool||!validateToolState(tool,data.state))throw new Error('This backup is invalid or belongs to another tool.');
 return data.state;
}
export function loadToolState(tool){try{const text=localStorage.getItem(PREFIX+tool);return text?parseToolBackup(text,tool):null;}catch{return null;}}
export function saveToolState(tool,state){try{localStorage.setItem(PREFIX+tool,JSON.stringify({version:1,tool,state}));return true;}catch{return false;}}
export function downloadToolBackup(tool,state){
 const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,tool,state},null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=`wsc2026-${tool}-backup.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function readToolBackup(file,tool){if(!file||file.size>2_000_000)throw new Error('Choose a JSON backup smaller than 2 MB.');return parseToolBackup(await file.text(),tool);}
