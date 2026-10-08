import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {flowerCspProblem} from '../docs/src/wsc2026/flowerCsp.mjs';
import {randomFlowerSolution,FLOWER_UNITS} from '../docs/src/wsc2026/flowerSudoku.mjs';
const csp=createRequire(import.meta.url)('../docs/js/sudoku_csp.js');
test('Flower uses shared exact CSP candidates with its 90-cell topology',async()=>{
 const solution=randomFlowerSolution().solution;
 const values=solution.slice();for(const i of [0,20,45,80,89])values[i]=0;
 const {board,constraints}=flowerCspProblem(values);
 const result=await csp.getCandidatesAsync(board,constraints);
 assert.equal(result.satisfiable,true);
 for(let i=0;i<90;i++)if(!values[i])assert.deepEqual(result.candidates[Math.floor(i/10)][i%10],[solution[i]]);
 const bad=solution.slice();bad[FLOWER_UNITS[0][1]]=bad[FLOWER_UNITS[0][0]];
 const invalid=flowerCspProblem(bad);assert.equal((await csp.getCandidatesAsync(invalid.board,invalid.constraints)).valid,false);
});
