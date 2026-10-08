import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1400,height:1000}});
 await page.goto('http://127.0.0.1:5180/');
 await page.waitForFunction(()=>window.pu&&window.SudokuTools);
 // Hold the worker reply so cancellation is deterministic, regardless of puzzle speed.
 await page.evaluate(()=>{
  window.solveWorkers=[];
  window.Worker=class {
   constructor(){this.terminated=false;solveWorkers.push(this);}
   postMessage(message){this.request=message;}
   terminate(){this.terminated=true;}
  };
 });
 await page.locator('#sudoku_solve_once').click();
 await page.waitForFunction(()=>document.body.classList.contains('sudoku-solver-running'));
 await page.getByRole('button',{name:'Stop',exact:true}).click();
 assert.equal(await page.evaluate(()=>solveWorkers.at(-1).terminated),true,'Stop must terminate the solve-once worker');
 assert.equal(await page.evaluate(()=>document.body.classList.contains('sudoku-solver-running')),false);
 await page.locator('#sudoku_solve_once').click();
 await page.waitForFunction(()=>document.body.classList.contains('sudoku-solver-running'));
 await page.evaluate(()=>solveWorkers[0].onmessage({data:{type:'result',result:{solved:false,reason:'stale reply'}}}));
 assert.equal(await page.evaluate(()=>document.body.classList.contains('sudoku-solver-running')),true,'An old reply must not clear a new run');
 await page.keyboard.press('Space');
 assert.equal(await page.evaluate(()=>solveWorkers.at(-1).terminated),true,'Space must cancel solve once too');
 assert.equal(await page.evaluate(()=>document.body.classList.contains('sudoku-solver-running')),false);
 console.log('Solve-once stop terminates the worker and clears busy state.');
}finally{await browser.close();}
