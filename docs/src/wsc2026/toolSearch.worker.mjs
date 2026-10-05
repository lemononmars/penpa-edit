import {solveFlower,randomFlowerSolution,generateFlowerPuzzle} from './flowerSudoku.mjs';
import {solvePentagram,randomPentagramSolution,generatePentagramPuzzle} from './pentagram.mjs';
import {solveShiftedAlignments,generateShiftedPuzzle} from './shiftedSudoku.mjs';
import {solveBlindPips,generateBlindPips} from './blindPractice.mjs';
self.onmessage=({data:{tool,action,payload}})=>{
 try{
  let result;
  if(tool==='blind')result=action==='solve'?solveBlindPips(payload.clues,payload.entries):generateBlindPips({targetPips:payload.targetPips});
  else if(tool==='flower')result=action==='solve'?solveFlower(payload.values):action==='random'?randomFlowerSolution():generateFlowerPuzzle({clues:payload.clues});
  else if(tool==='pentagram')result=action==='solve'?solvePentagram(payload.values):action==='random'?randomPentagramSolution():generatePentagramPuzzle({clues:payload.clues});
  else if(tool==='shifted')result=action==='solve'?solveShiftedAlignments(payload.values,payload.rotations,payload.includeOuter,payload.outerRotation):generateShiftedPuzzle(payload.rotations,false,0,payload.clues);
  else throw new Error('Unknown puzzle tool.');
  self.postMessage({result});
 }catch(error){self.postMessage({error:error.message||'Search failed.'});}
};
