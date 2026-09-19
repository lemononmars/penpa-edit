(function(root,factory){var make=factory(typeof module!=='undefined'&&module.exports?require('../wsc_rules.js'):root.Wsc2026Rules);if(typeof module!=='undefined'&&module.exports)module.exports=make;else root.createWsc2026Descriptor=make;})(typeof globalThis!=='undefined'?globalThis:this,function(rules){
 return function(id,label,category){return {id,label,supportedSizes:[9],constraintTypes:['wscRules'],inputType:{categories:[category],instructions:['Use the supported Penpa marks or a saved structured clue payload; cell coordinates are zero-based.']},parse:function(e,emit,diagnostic){
  const saved=e.option('wsc2026Clues'),hasSaved=!!saved&&Object.prototype.hasOwnProperty.call(saved,id);
  let clues=hasSaved?saved[id]:undefined;
  const global=['wscescape','flamepath','fractal','disguisedqueen','antiwindoku'];
  if(global.includes(id))clues=[{cells:e.cells()}];
  if(!clues){
   if(id==='trishula'){const puzzle=e.option('pu_q')||{},nx=Number(e.option('nx0'))||13,space=e.option('space')||[0,0,0,0],toCell=key=>{const col=Number(key)%nx-2-Number(space[2]||0),row=Math.floor(Number(key)/nx)-2-Number(space[0]||0);return e.cell(row,col);},handles=(puzzle.nobulbthermo||[]).map(path=>path.map(toCell).filter(Boolean)).filter(path=>path.length),arrows=puzzle.direction||[];clues=handles.map((cells,index)=>{const keys=new Set((puzzle.nobulbthermo[index]||[]).map(Number)),tips=arrows.filter(path=>path.length>1&&path.some(key=>keys.has(Number(key)))).map(path=>toCell(path[path.length-1])).filter(Boolean);return {cells,tips};}).filter(clue=>clue.tips.length===3);}
   if(id==='attacktheleader')clues=e.symbolMarks().filter(m=>m.cell&&m.entry&&m.entry[1]==='arrow_eight').map(m=>{const names=['left','up-left','up','up-right','right','down-right','down','down-left'];const bits=Array.isArray(m.entry[0])?m.entry[0]:[];return {origin:m.cell,cells:e.cells(),directions:bits.map((on,i)=>on===1?names[i]:null).filter(Boolean)};});
   if(id==='neighbouringdisparity')clues=e.symbolMarks().filter(m=>m.cell&&m.entry&&['square_L','diamond_L'].includes(m.entry[1])&&Number(m.entry[0])===1).map(m=>{const offsets=m.entry[1]==='square_L'?[[-1,-1],[-1,1],[1,-1],[1,1]]:[[-1,0],[0,1],[1,0],[0,-1]];return {origin:m.cell,cells:offsets.map(([dr,dc])=>e.cell(m.cell.row+dr,m.cell.col+dc)).filter(Boolean),shape:m.entry[1]==='square_L'?'diagonal':'orthogonal'};});
   if(id==='hundred') {clues=[];for(let r=0;r<9;r++){let groups=[],g=[];for(let c=0;c<9;c++){if(e.isShaded(r,c))g.push(e.cell(r,c));else if(g.length){groups.push(g);g=[];}}if(g.length)groups.push(g);if(groups.length)clues.push({groups});}}
   if(id==='number5stillalive')clues=e.cages().map(c=>({cells:c.cells}));
   if(['nothreeinaline','tunnel','missingarrow','missingthermo','multidiagonal'].includes(id))clues=e.connectedLinePaths(3).concat(e.connectedLinePaths(5)).map(cells=>({cells}));
   if(['friends','enemies','even','odd'].includes(id)){const marks=e.symbolMarks().filter(m=>m.cell&&(id==='even'?/square/:/circle/).test(String(m.entry[1]))).map(m=>m.cell);clues=marks.length?[{cells:marks}]:[];}
   if(id==='divisorsumpairs')clues=e.numberMarks().filter(m=>m.neighbors.length===2).map(m=>({cells:m.neighbors,value:Number(m.entry[0])}));
   if(id==='transparentkropkipairs')clues=e.symbolMarks().filter(m=>m.neighbors.length===2&&/circle/.test(m.entry[1])).map(m=>({cells:m.neighbors}));
   if(['indextoone','primerunsum','antioutside','sudokuwithnames','magicsword','nexttox'].includes(id)){
    const outside=[];for(const side of ['top','left','bottom','right'])for(let i=0;i<9;i++){const value=e.outsideText(side,i);if(value!==null){let cells=Array.from({length:9},(_,j)=>side==='top'||side==='bottom'?e.cell(j,i):e.cell(i,j));if(side==='bottom'||side==='right')cells.reverse();outside.push({cells,value:['antioutside','sudokuwithnames','nexttox'].includes(id)?value:Number(value),digits:String(value).replace(/\D/g,'').split('').map(Number)});}}
    clues=['magicsword','nexttox'].includes(id)?(outside.length?[{clues:outside}]:[]):outside;
   }
  }
  if(!Array.isArray(clues)||!clues.length){if(id==='trishula'&&!hasSaved)return;diagnostic({code:'missing-wsc-clues',message:label+': add the required marks or a structured clue payload.'});return;}
  for(const raw of clues){const clue=Object.assign({},raw,{kind:id});if(!rules.valid(clue)){diagnostic({code:'invalid-wsc-clues',message:label+': invalid WSC clue payload.'});return;}emit('wscRules',clue);}
 }};};
});
