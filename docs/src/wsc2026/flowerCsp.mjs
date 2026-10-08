import {FLOWER_CELL_COUNT,FLOWER_UNITS} from './flowerSudoku.mjs';

export function flowerCspProblem(values){
 if(values.length!==FLOWER_CELL_COUNT||values.some(v=>!Number.isInteger(v)||v<0||v>9))throw new Error('Enter 90 cells using digits 1–9.');
 const cell=i=>({row:Math.floor(i/10),col:i%10});
 // The shared CSP uses square storage. Ten fixed, independent padding cells
 // fill its 10×10 container; Flower's 90 cells retain their own 1–9 domain.
 return {board:Array.from({length:10},(_,r)=>Array.from({length:10},(_,c)=>r<9?values[r*10+c]:1)),constraints:{
  baseRows:false,baseCols:false,baseBoxes:false,
  allDifferentUnits:FLOWER_UNITS.map(unit=>({cells:unit.map(cell)})),
  pencilmarkCells:values.map((_,i)=>({cell:cell(i),allowed:[1,2,3,4,5,6,7,8,9]}))
 }};
}

export function createFlowerAnalysis(onBusy,onProgress=()=>{}){
 let worker=null,settle=null;
 function cancel(){if(!worker)return;worker.terminate();worker=null;const finish=settle;settle=null;onBusy(false);finish?.(null);}
 function run(values){
  cancel();const problem=flowerCspProblem(values);onBusy(true);
  return new Promise((resolve,reject)=>{
   settle=resolve;
   try{
    const active=new Worker('/js/sudoku_solver_worker_bundle.js');worker=active;
    function finish(){active.terminate();worker=null;settle=null;onBusy(false);}
    active.onmessage=({data})=>{if(worker!==active)return;if(data.type==='progress'){onProgress(data.progress);return;}finish();if(data.type==='error')reject(new Error(data.message));else resolve(data.result);};
    active.onerror=()=>{if(worker!==active)return;finish();reject(new Error('CSP worker failed. Please try again.'));};
    active.postMessage({type:'analyze',...problem});
   }catch(error){worker=null;settle=null;onBusy(false);reject(error);}
  });
 }
 return {run,cancel};
}
