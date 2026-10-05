const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const install = require('../docs/js/sudoku_csp_variants/index.js');
const { cases } = require('../test/fixtures/sudoku_solver_performance.js');

// Count deterministic search work on the real engine without adding profiling
// state to the shipped solver. A ceiling keeps a slow baseline runnable.
const source = fs.readFileSync(require.resolve('../docs/js/sudoku_csp.js'), 'utf8')
    .replace('function visit() {', 'function visit() { probe.nodes++; if (probe.nodes > probe.limit) throw new Error("work limit");')
    .replace('function allowedMask(state, constraints, row, col, evaluator) {',
        'function allowedMask(state, constraints, row, col, evaluator) { probe.masks++;');

function measureCase(fixture, options = {}) {
    const samples = [];
    let result;
    for (let index = 0; index < (options.samples || 3); index++) {
        const probe = { nodes: 0, masks: 0, limit: options.limit || 10000 };
        const context = vm.createContext({ probe });
        const engine = options.legacyDifferences ? source.replace('var prepared = typeof handler.prepare',
            'var prepared = name !== "wscRules" && typeof handler.prepare') : source;
        vm.runInContext(engine, context);
        install(context.SudokuCSP);
        const started = performance.now();
        let answers, error;
        try { answers = context.SudokuCSP.createProblem(fixture.board, fixture.constraints).enumerateAnswers(2); }
        catch (err) { if (err.message !== 'work limit') throw err; error = err.message; }
        samples.push(performance.now() - started);
        result = { name: fixture.name, nodes: probe.nodes, masks: probe.masks, answers: answers?.length, error };
        if (answers) assert.ok(answers.length > 0);
    }
    samples.sort((a,b) => a-b);
    return { ...result, medianMs: +samples[Math.floor(samples.length / 2)].toFixed(1) };
}
module.exports = { measureCase };

if (require.main === module) {
    for (const fixture of cases) {
        if (process.argv.includes('--outside') && !fixture.name.includes('outside') && !fixture.name.includes('pencilmarks')) continue;
        const result = measureCase(fixture, {legacyDifferences:process.argv.includes('--legacy-differences')});
        console.log(JSON.stringify(result));
        if (process.argv.includes('--assert-budget')) assert.ok(!result.error && result.nodes < 3000, `${fixture.name} exceeded search budget`);
    }
}
