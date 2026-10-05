const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const install = require('../docs/js/sudoku_csp_variants/index.js');
const { cases } = require('../test/fixtures/sudoku_solver_performance.js');

const classic = [
    '530070000', '600195000', '098000060', '800060003', '400803001',
    '700020006', '060000280', '000419005', '000080079'
].map(row => Array.from(row, Number));
const fixtures = [{ name: 'classic', board: classic, constraints: {} }, ...cases];

// Measure the complete Auto Solver analysis, including cooperative yields.
// An optional source path allows comparisons with a saved engine baseline.
async function measure(sourcePath) {
    const source = fs.readFileSync(sourcePath, 'utf8');
    const results = [];
    for (const fixture of fixtures) {
        const samples = [];
        let result;
        for (let index = 0; index < 3; index++) {
            const context = vm.createContext({ setTimeout, clearTimeout });
            vm.runInContext(source, context);
            install(context.SudokuCSP);
            const started = performance.now();
            result = await context.SudokuCSP.getCandidatesAsync(fixture.board, fixture.constraints);
            samples.push(performance.now() - started);
            assert.equal(result.satisfiable, true, fixture.name);
        }
        samples.sort((a, b) => a - b);
        results.push({ name: fixture.name, medianMs: Math.round(samples[1]), unique: result.unique });
    }
    return results;
}

if (require.main === module) {
    measure(process.argv[2] || require.resolve('../docs/js/sudoku_csp.js'))
        .then(results => results.forEach(result => console.log(JSON.stringify(result))))
        .catch(error => { console.error(error); process.exitCode = 1; });
}
