const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const SudokuCSP = require('../docs/js/sudoku_csp.js');
const SudokuVariants = require('../docs/js/sudoku_variants/index.js');

const solution = [
    '534678912', '672195348', '198342567', '859761423', '426853791',
    '713924856', '961537284', '287419635', '345286179'
].map(row => Array.from(row, Number));

function ambiguousBoard() {
    return solution.map(row => row.map(digit => digit <= 2 ? 0 : digit));
}

function assertExactFacts(board, constraints, result) {
    const answers = SudokuCSP.createProblem(board, constraints).enumerateAnswers(100);
    assert.ok(answers.length > 0 && answers.length < 100);
    assert.equal(result.unique, answers.length === 1);
    board.forEach((row, r) => row.forEach((digit, c) => {
        if (digit) return;
        const possible = [...new Set(answers.map(answer => answer[r][c]))].sort((a, b) => a - b);
        assert.deepEqual(result.candidates[r][c], possible, `r${r + 1}c${c + 1}`);
        assert.equal(result.forced[r][c], possible.length === 1 ? possible[0] : 0);
    }));
}

test('cached witnesses give exact facts after adding and removing digits and marks', async () => {
    const board = ambiguousBoard();
    let result = await SudokuCSP.getCandidatesAsync(board, {});
    assertExactFacts(board, {}, result);
    board[0][7] = solution[0][7];
    result = await SudokuCSP.getCandidatesAsync(board, {}, { seedSolutions: result.witnessSolutions });
    assertExactFacts(board, {}, result);
    board[0][7] = 0;
    result = await SudokuCSP.getCandidatesAsync(board, {}, { seedSolutions: result.witnessSolutions });
    assertExactFacts(board, {}, result);
    const constraints = { oddEven: [{ cell: { row: 0, col: 7 }, parity: 'odd' }] };
    result = await SudokuCSP.getCandidatesAsync(board, constraints, { seedSolutions: result.witnessSolutions });
    assert.equal(result.unique, true, 'the added odd mark distinguishes the two solutions');
    assertExactFacts(board, constraints, result);
    result = await SudokuCSP.getCandidatesAsync(board, {}, { seedSolutions: result.witnessSolutions });
    assertExactFacts(board, {}, result);
});

function editorHarness(board) {
    const requests = [];
    const texts = [];
    const context = vm.createContext({
        SudokuCSP, SudokuVariantRegistry: SudokuVariants, setTimeout, clearTimeout,
        window: {},
        document: { getElementById: () => null, body: { classList: { toggle() {} } } },
        set_font_style() {},
        Worker: class {
            postMessage(request) { requests.push({ worker: this, request }); }
            terminate() {}
        }
    });
    vm.runInContext(fs.readFileSync(require.resolve('../docs/js/sudoku_solver.js'), 'utf8'), context);
    context.window.SudokuTools.autoEnabled = true;
    const puzzle = {
        gridtype: 'sudoku', nx: 9, ny: 9, nx0: 13, ny0: 13, space: [0, 0, 0, 0],
        activeSudokuVariants: ['classic'], centerlist: [], point: {},
        pu_q: { number: {}, numberS: {}, symbol: {}, surface: {}, wall: {} },
        pu_a: { number: {} }, size: 40,
        ctx: { text(value, x, y) { texts.push({ value, x, y }); } },
        redraw() {}
    };
    board.forEach((row, r) => row.forEach((digit, c) => {
        const key = (r + 2) * 13 + c + 2;
        puzzle.centerlist.push(key);
        puzzle.point[key] = { x: c * 40, y: r * 40 };
        if (digit) puzzle.pu_q.number[key] = [String(digit), 1, '1'];
    }));
    return { solver: context.SudokuSolver, puzzle, requests, texts, context };
}

test('priming a cached solution cannot display unproved digits on a multiple-solution board', () => {
    const harness = editorHarness(ambiguousBoard());
    harness.solver.primeUniqueSolution(harness.puzzle, solution);
    harness.solver.drawAutoCandidates(harness.puzzle);
    assert.equal(harness.texts.length, 0, 'a single witness must not be displayed as irrefutable digits');
});

test('removing a deadly-pair given restores 1,6 pencilmarks over previous solver answers', async () => {
    const board = solution.map(row => row.map(digit => digit === 7 ? 1 : digit === 1 ? 7 : digit));
    const pair = [[0, 3], [0, 4], [3, 3], [3, 4]];
    const answer = board.map(row => row.slice());
    pair.slice(1).forEach(([r, c]) => { board[r][c] = 0; });
    const { solver, puzzle, requests, texts, context } = editorHarness(board);
    context.Puzzle = class {};
    context.UserSettings = { custom_colors_on: false, sudoku_normal_bottom: false };
    vm.runInContext(fs.readFileSync(require.resolve('../docs/js/class_square.js'), 'utf8'), context);
    const drawAnswers = vm.runInContext('Puzzle_square.prototype.draw_number', context);
    pair.forEach(([r, c]) => {
        puzzle.pu_a.number[solver.cellKey(puzzle, r, c)] = [String(answer[r][c]), 9, '1'];
    });
    assert.equal(solver.primeUniqueSolution(puzzle, answer), true);
    delete puzzle.pu_q.number[solver.cellKey(puzzle, ...pair[0])];
    board[pair[0][0]][pair[0][1]] = 0;
    assert.equal(solver.startAutoAnalysis(puzzle), true);
    const { worker, request } = requests.at(-1);
    const result = await SudokuCSP.getCandidatesAsync(request.board, request.constraints, {
        seedSolutions: request.seedSolutions
    });
    assertExactFacts(board, request.constraints, result);
    pair.forEach(([r, c]) => assert.deepEqual(result.candidates[r][c], [1, 6]));
    worker.onmessage({ data: { type: 'result', result } });
    await Promise.resolve();
    solver.drawAutoCandidates(puzzle);
    drawAnswers.call(puzzle, 'pu_a');
    assert.equal(texts.length, 8, 'only the two pencilmarks per cell should be visible');
    texts.length = 0;
    context.window.SudokuTools.autoEnabled = false;
    drawAnswers.call(puzzle, 'pu_a');
    assert.equal(texts.length, 4, 'stored answers are preserved when Auto Solver is disabled');
});

test('cache priming accepts a proved unique answer and rejects a mismatched answer', () => {
    const board = solution.map(row => row.slice());
    board[0][0] = 0;
    const { solver, puzzle, texts } = editorHarness(board);
    assert.equal(solver.primeUniqueSolution(puzzle, solution), true);
    solver.drawAutoCandidates(puzzle);
    assert.equal(texts.length, 1);
    assert.equal(texts[0].value, '5');
    texts.length = 0;
    const different = solution.map(row => row.map(digit => digit === 1 ? 2 : digit === 2 ? 1 : digit));
    assert.equal(solver.primeUniqueSolution(puzzle, different), false);
    solver.drawAutoCandidates(puzzle);
    assert.equal(texts.length, 0, 'rejecting a witness also clears previously primed facts');
});

test('editor reuses witnesses for additions but starts fresh after a digit removal or replacement', async () => {
    const harness = editorHarness(ambiguousBoard());
    const { solver, puzzle, requests } = harness;
    async function analyze() {
        assert.equal(solver.startAutoAnalysis(puzzle), true);
        const { worker, request } = requests.at(-1);
        const result = await SudokuCSP.getCandidatesAsync(request.board, request.constraints, {
            seedSolutions: request.seedSolutions
        });
        assertExactFacts(request.board, request.constraints, result);
        worker.onmessage({ data: { type: 'result', result } });
        await Promise.resolve();
        return request;
    }
    await analyze();
    const key = solver.cellKey(puzzle, 0, 7);
    puzzle.pu_q.number[key] = ['1', 1, '1'];
    assert.ok((await analyze()).seedSolutions.length > 0);
    delete puzzle.pu_q.number[key];
    assert.equal((await analyze()).seedSolutions.length, 0);
    puzzle.pu_q.number[key] = ['1', 1, '1'];
    await analyze();
    puzzle.pu_q.number[key] = ['2', 1, '1'];
    assert.equal((await analyze()).seedSolutions.length, 0);
    delete puzzle.pu_q.number[key];
    puzzle.activeSudokuVariants.push('odd even');
    puzzle.pu_q.symbol[solver.cellKey(puzzle, 0, 0)] = [3, 'circle_L', 2];
    await analyze();
    puzzle.pu_q.symbol[key] = [3, 'circle_L', 2];
    assert.equal((await analyze()).seedSolutions.length, 0);
    delete puzzle.pu_q.symbol[key];
    assert.equal((await analyze()).seedSolutions.length, 0);
});
