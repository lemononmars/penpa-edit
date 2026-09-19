(function(root,factory){var make=factory(typeof module!=='undefined'&&module.exports?require('../wsc_rules.js'):root.Wsc2026Rules);if(typeof module!=='undefined'&&module.exports)module.exports=make;else root.createWsc2026Descriptor=make;})(typeof globalThis!=='undefined'?globalThis:this,function(rules){
 return function(id,label,category){return {id,label,supportedSizes:[9],constraintTypes:['wscRules'],inputType:{categories:[category],instructions:['Use the WSC clue editor for structured clues; cell coordinates are zero-based.']},parse:function(e,emit,diagnostic){
  let clues=e.option('wsc2026Clues')?.[id];
  const global=['wscescape','flamepath','fractal','disguisedqueen','antiwindoku'];
  if(global.includes(id))clues=[{cells:e.cells()}];
  if(!clues){
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
  if(!Array.isArray(clues)||!clues.length){diagnostic({code:'missing-wsc-clues',message:label+': add the required marks or use the WSC clue editor.'});return;}
  for(const raw of clues){const clue=Object.assign({},raw,{kind:id});if(!rules.valid(clue)){diagnostic({code:'invalid-wsc-clues',message:label+': invalid WSC clue payload.'});return;}emit('wscRules',clue);}
 }};};
});
