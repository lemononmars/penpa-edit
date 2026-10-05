const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const CSP = require('../docs/js/sudoku_csp.js');
const solution9 = ['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179'].map(row=>Array.from(row,Number));
const solution6 = ['123456','456123','234561','561234','345612','612345'].map(row=>Array.from(row,Number));
const solution7 = Array.from({length:7}, (_,r)=>Array.from({length:7}, (_,c)=>(r+c)%7+1));
const solution8 = Array.from({length:8}, (_,r)=>Array.from({length:8}, (_,c)=>((r%2)*4+Math.floor(r/2)+c)%8+1));
function oneMissing(solution) {
    const b = solution.map(row=>row.slice());
    b[b.length-1][b.length-1] = 0;
    return b;
}
function assertLastFact(result, solution) {
    const last = solution.length-1;
    assert.equal(result.unique,true);
    assert.equal(result.candidates.length,solution.length);
    assert.deepEqual(result.candidates[last][last],[solution[last][last]]);
    assert.deepEqual(result.forced,solution);
}

test('overlapping candidate analyses retain their own grid size', async () => {
    const solutions = [solution9,solution6,solution7,solution8];
    const results = await Promise.all(solutions.map(solution=>CSP.getCandidatesAsync(oneMissing(solution),{})));
    results.forEach((result,index)=>assertLastFact(result,solutions[index]));
});

test('progress and cancellation callbacks may solve a different-sized puzzle', async () => {
    const result = await CSP.getCandidatesAsync(oneMissing(solution9),{}, {
        onProgress() { assert.equal(CSP.solve(solution6,{}).solved,true); },
        isCancelled() { CSP.solve(solution6,{}); return false; }
    });
    assertLastFact(result,solution9);
});

test('cached witnesses with the wrong dimensions are ignored', async () => {
    const result = await CSP.getCandidatesAsync(solution9.map(row=>row.map(()=>0)),{}, {seedSolutions:[solution6]});
    assert.equal(result.unique,false);
    assert.deepEqual(result.candidates[8][8],[1,2,3,4,5,6,7,8,9]);
    assert.equal(result.reusedWitnesses,0);
});

test('covered candidate facts do not introduce a timer pause every four checks', async () => {
    let timers = 0;
    const context = vm.createContext({Date:{now:()=>0}, setTimeout(callback) { timers++; queueMicrotask(callback); }});
    vm.runInContext(fs.readFileSync(require.resolve('../docs/js/sudoku_csp.js'),'utf8'),context);
    const events = [];
    const blank = solution9.map(row=>row.map(()=>0));
    const result = await context.SudokuCSP.getCandidatesAsync(blank,{}, {onProgress:event=>events.push(event)});
    assert.equal(result.unique,false);
    assert.equal(result.candidates[0][0].length,9);
    const checks = events.filter(e=>['covered','refuted','witness'].includes(e.type)).length;
    assert.ok(checks > 500);
    assert.ok(timers < checks / 8, `${timers} timer pauses for ${checks} facts`);
});

test('candidate analysis yields to queued cancellation without publishing partial facts', async () => {
    let elapsed = 0;
    let stop = false;
    const context = vm.createContext({
        Date: {now:()=>elapsed},
        setTimeout(callback) {queueMicrotask(callback);}
    });
    vm.runInContext(fs.readFileSync(require.resolve('../docs/js/sudoku_csp.js'),'utf8'),context);
    const events = [];
    const blank = solution9.map(row=>row.map(()=>0));
    const result = await context.SudokuCSP.getCandidatesAsync(blank,{}, {
        isCancelled:()=>stop,
        onProgress(event) {
            events.push(event.type);
            if(['covered','witness','refuted'].includes(event.type)) {
                elapsed += 4;
                queueMicrotask(()=>{stop = true;});
            }
        }
    });
    assert.equal(result.cancelled,true);
    assert.equal(result.candidates,undefined);
    assert.equal(events.includes('cancelled'),true);
    assert.equal(events.includes('done'),false);
});

test('search shortcut still enforces both local and global variant constraints', () => {
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(require.resolve('../docs/js/sudoku_csp.js'),'utf8'),context);
    context.SudokuCSP.registerConstraint('reviewGlobal', {
        validatePartial(b) {return !b[0][0] || b[0][0] === 4;}
    });
    context.SudokuCSP.registerConstraint('reviewLocal', {
        validatePartial(b,q) {return !b[q.cell.row][q.cell.col] || b[q.cell.row][q.cell.col] === q.digit;}
    });
    const b = solution9.map(row=>row.slice()); b[0][0]=0;
    assert.equal(context.SudokuCSP.solve(b,{}).solved,true);
    assert.equal(context.SudokuCSP.solve(b,{reviewGlobal:[{}]}).solved,false);
    assert.equal(context.SudokuCSP.solve(b,{reviewLocal:[{cell:{row:0,col:0},digit:4}]}).solved,false);
    assert.equal(context.SudokuCSP.solve(b,{reviewLocal:[{cell:{row:0,col:0},digit:5}]}).solved,true);
});
