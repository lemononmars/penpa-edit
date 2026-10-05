const test = require('node:test');
const assert = require('node:assert/strict');
const CSP = require('../docs/js/sudoku_csp.js');
const rules = require('../docs/js/sudoku_variants/wsc_rules.js');
const installOutside = require('../docs/js/sudoku_csp_variants/outside_relations/outside.js');
const { cases } = require('./fixtures/sudoku_solver_performance.js');
const { measureCase } = require('../scripts/benchmark-sudoku-variants.cjs');
const board = () => Array.from({length: 9}, () => Array(9).fill(0));

test('Outside and Differences stay within a deterministic search budget', () => {
    for(const fixture of cases) {
        const result = measureCase(fixture, {samples:1,limit:3000});
        assert.equal(result.error,undefined,fixture.name);
        assert.ok(result.nodes < 3000,fixture.name);
    }
});

test('Outside pruning agrees with an exhaustive completion oracle, including partial and duplicate clues', () => {
    let handler;
    installOutside({register(name, value) { if(name === 'outside') handler = value; }});
    const cells = [0,1,2].map(col => ({row:0,col}));
    const helpers = {cellValue: (b,c) => b[c.row][c.col], size:9, countBits:mask=>mask.toString(2).replace(/0/g, "").length};
    for (const clues of [[1,2,3], [1,3], [2], [1,1,2], []]) {
        const prepared = handler.prepare({cells,clues}, helpers);
        for (let a=0;a<=4;a++) for(let b=0;b<=4;b++) for(let c=0;c<=4;c++) {
            const values = [a,b,c];
            const completions = [[]];
            for (const value of values) {
                const prefixes = completions.splice(0);
                for (const prefix of prefixes) for (const digit of value ? [value] : [1,2,3,4]) completions.push([...prefix, digit]);
            }
            const expected = completions.some(row => clues.every(d => row.includes(d)));
            assert.equal(handler.validatePartial([values], {cells,clues}, helpers), expected, JSON.stringify({values,clues}));
            assert.equal(prepared.validatePartial([values]), expected, JSON.stringify({values,clues}));
        }
    }
});

test('fully clued Outside and equivalent Pencilmarks preserve the same complete answers and exact candidates', async () => {
    const pencil = cases[0], outside = cases[1];
    assert.deepEqual(CSP.createProblem(outside.board,outside.constraints).enumerateAnswers(2),
        CSP.createProblem(pencil.board,pencil.constraints).enumerateAnswers(2));
    const a = await CSP.getCandidatesAsync(outside.board,outside.constraints);
    const b = await CSP.getCandidatesAsync(pencil.board,pencil.constraints);
    assert.deepEqual(a.candidates,b.candidates);
    assert.deepEqual(a.forced,b.forced);
    assert.equal(a.unique,b.unique);
});

test('Differences prepares its clue validation outside repeated candidate checks', () => {
    assert.equal(typeof rules.prepare, 'function');
    const q = {kind:'differences',cells:[{row:0,col:0},{row:0,col:1}],value:5};
    const prepared = rules.prepare(q, {size:9});
    const b = board(); b[0][0]=5;
    assert.equal(prepared.validatePartial(b), false, '5 has no partner at distance 5 in digits 1 through 9');
    b[0][0]=3;
    assert.equal(prepared.validatePartial(b), true);
    b[0][1]=8;
    assert.equal(prepared.validatePartial(b), true);
    b[0][1]=7;
    assert.equal(prepared.validatePartial(b), false);
});

test('prepared Differences rejects only partial assignments without a supporting pair', () => {
    const cells = [{row:0,col:0},{row:0,col:1}];
    for(let target=0;target<=9;target++) {
        const prepared = rules.prepare({kind:'differences',cells,value:target}, {size:9});
        for(let a=0;a<=9;a++) for(let b=0;b<=9;b++) {
            const values = board(); values[0][0]=a; values[0][1]=b;
            const left = a ? [a] : [1,2,3,4,5,6,7,8,9];
            const right = b ? [b] : [1,2,3,4,5,6,7,8,9];
            const supported = left.some(x=>right.some(y=>Math.abs(x-y)===target));
            assert.equal(prepared.validatePartial(values), supported, JSON.stringify({a,b,target}));
        }
    }
    for(const invalid of [
        {kind:'differences',cells,value:-1}, {kind:'differences',cells,value:1.5},
        {kind:'differences',cells:[cells[0],cells[0]],value:2}
    ]) {
        assert.equal(CSP.solve(board(),{wscRules:[invalid]}).solved,false);
    }
});

test('Differences optimization preserves full and sparse answers and irrefutable facts', async () => {
    for (const fixture of cases.filter(q => q.name.startsWith('differences'))) {
        const reference = {edgeRelations:fixture.constraints.wscRules.map(q => ({relation:'difference',cells:q.cells,target:q.value}))};
        const actual = CSP.createProblem(fixture.board,fixture.constraints).enumerateAnswers(100);
        const expected = CSP.createProblem(fixture.board,reference).enumerateAnswers(100);
        assert.ok(actual.length > 0 && actual.length < 100 && expected.length < 100);
        assert.deepEqual(actual.map(JSON.stringify).sort(),expected.map(JSON.stringify).sort());
        const a = await CSP.getCandidatesAsync(fixture.board,fixture.constraints);
        const b = await CSP.getCandidatesAsync(fixture.board,reference);
        assert.deepEqual(a.candidates,b.candidates);
        assert.deepEqual(a.forced,b.forced);
        assert.equal(a.unique,b.unique);
    }
});
