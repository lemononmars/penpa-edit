const assert = require("node:assert/strict");
const test = require("node:test");

const SudokuCSP = require("../docs/js/sudoku_csp.js");
const SudokuSolver = require("../docs/js/sudoku_solver.js");
const SudokuGenerator = require("../docs/js/sudoku_generator.js");

function boardFromString(value) {
    return Array.from({ length: 9 }, function(_, row) {
        return Array.from({ length: 9 }, function(__, col) {
            return Number(value[(row * 9) + col]);
        });
    });
}

function emptyBoard() {
    return Array.from({ length: 9 }, function() {
        return Array(9).fill(0);
    });
}

test("caps each automatic CSP analysis run at 60 seconds", function() {
    assert.equal(SudokuSolver.AUTO_RUN_LIMIT_MS, 60000);
});

test("ships the exact CSP regression board as a loadable Penpa edit URL", function() {
    const preset = new URL(SudokuSolver.TEST_BOARD_URL);

    assert.equal(preset.hostname, "swaroopg92.github.io");
    assert.match(preset.hash, /^#m=edit&p=/);
    assert.ok(preset.hash.length > 1200);
});

test("accepts both Sudoku and square 9x9 editor grids", function() {
    assert.equal(SudokuSolver.isClassicSudoku({
        gridtype: "sudoku", nx: 9, ny: 9, space: [0, 0, 0, 0]
    }), true);
    assert.equal(SudokuSolver.isClassicSudoku({
        gridtype: "square", nx: 9, ny: 9, space: ["0", "0", "0", "0"]
    }), true);
    assert.equal(SudokuSolver.isClassicSudoku({
        gridtype: "sudoku", nx: 9, ny: 9, space: [1, 1, 1, 1]
    }), false);
    assert.equal(SudokuSolver.isClassicSudoku({
        gridtype: "sudoku", nx: 11, ny: 11, space: [1, 1, 1, 1]
    }), true);
    assert.equal(SudokuSolver.isClassicSudoku({
        gridtype: "sudoku", nx: 6, ny: 6, space: [0, 0, 0, 0]
    }), true);
});

test("reads playable cells through an expanded outside-clue margin", function() {
    const puzzle = {
        gridtype: "sudoku",
        nx: 11,
        ny: 11,
        nx0: 15,
        space: [1, 1, 1, 1],
        pu_q: { number: { 48: [7, 1, "1"] } },
        pu_a: { number: {} }
    };

    const board = SudokuSolver.readBoard(puzzle, false);

    assert.equal(board.length, 9);
    assert.equal(board[0].length, 9);
    assert.equal(board[0][0], 7);
});

test("solves a 6x6 Sudoku with 2x3 boxes", function() {
    const puzzle = [
        [1, 0, 3, 4, 0, 6],
        [0, 5, 6, 0, 2, 3],
        [2, 3, 0, 5, 6, 0],
        [5, 0, 4, 2, 0, 1],
        [0, 1, 2, 0, 4, 5],
        [6, 4, 0, 3, 1, 0]
    ];
    const result = SudokuSolver.solve(puzzle);
    assert.equal(result.solved, true);
    assert.deepEqual(result.board, [
        [1, 2, 3, 4, 5, 6], [4, 5, 6, 1, 2, 3],
        [2, 3, 1, 5, 6, 4], [5, 6, 4, 2, 3, 1],
        [3, 1, 2, 6, 4, 5], [6, 4, 5, 3, 1, 2]
    ]);
});

test("solves a classic Sudoku without changing its givens", function() {
    const puzzle = boardFromString(
        "530070000" +
        "600195000" +
        "098000060" +
        "800060003" +
        "400803001" +
        "700020006" +
        "060000280" +
        "000419005" +
        "000080079"
    );

    const result = SudokuSolver.solve(puzzle);

    assert.equal(result.solved, true);
    assert.equal(
        result.board.map(function(row) { return row.join(""); }).join(""),
        "534678912672195348198342567859761423426853791713924856961537284287419635345286179"
    );
    assert.equal(puzzle[0][0], 5);
    assert.equal(puzzle[0][2], 0);
});

test("rejects conflicting givens", function() {
    const board = emptyBoard();
    board[0][0] = 5;
    board[0][1] = 5;

    const result = SudokuSolver.solve(board);

    assert.equal(result.solved, false);
    assert.match(result.reason, /conflicting givens/i);
});

test("honors a full-length thermo", function() {
    const constraints = {
        thermos: [Array.from({ length: 9 }, function(_, col) {
            return { row: 0, col: col };
        })]
    };

    const result = SudokuSolver.solve(emptyBoard(), constraints);

    assert.equal(result.solved, true);
    assert.deepEqual(result.board[0], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test("honors an arrow sum", function() {
    const constraints = {
        arrows: [{
            circle: { row: 0, col: 0 },
            shaft: [{ row: 0, col: 1 }, { row: 0, col: 2 }]
        }]
    };

    const result = SudokuSolver.solve(emptyBoard(), constraints);

    assert.equal(result.solved, true);
    assert.equal(result.board[0][0], result.board[0][1] + result.board[0][2]);
});

test("honors killer totals and distinct digits", function() {
    const constraints = {
        killers: [{
            cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            total: 3
        }]
    };

    const result = SudokuSolver.solve(emptyBoard(), constraints);

    assert.equal(result.solved, true);
    assert.equal(result.board[0][0] + result.board[0][1], 3);
    assert.notEqual(result.board[0][0], result.board[0][1]);
});

test("honors odd and even cell marks", function() {
    const odd = SudokuSolver.solve(emptyBoard(), {
        oddEven: [{ cell: { row: 0, col: 0 }, parity: "odd" }]
    });
    const even = SudokuSolver.solve(emptyBoard(), {
        oddEven: [{ cell: { row: 0, col: 0 }, parity: "even" }]
    });

    assert.equal(odd.solved, true);
    assert.equal(odd.board[0][0] % 2, 1);
    assert.equal(even.solved, true);
    assert.equal(even.board[0][0] % 2, 0);
});

test("enforces Battenburg checkerboard parity", function() {
    const solved = boardFromString(
        "123456789456789123789123456" +
        "234567891567891234891234567" +
        "345678912678912345912345678"
    );
    const cells = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }];
    assert.equal(SudokuSolver.solve(solved, { battenburg: [cells] }).solved, true);
    solved.forEach(function(row) {
        row.forEach(function(value, col) { row[col] = value === 1 ? 2 : value === 2 ? 1 : value; });
    });
    assert.equal(SudokuSolver.solve(solved, { battenburg: [cells] }).solved, false);
});

test("negative Battenburg forbids checkerboard parity at an unmarked corner", function() {
    const solved = boardFromString(
        "123456789456789123789123456" +
        "234567891567891234891234567" +
        "345678912678912345912345678"
    );
    const cells = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }];
    assert.equal(SudokuSolver.solve(solved, {
        battenburg: [{ cells: cells, kind: "none" }]
    }).solved, false);
    solved.forEach(function(row) {
        row.forEach(function(value, col) { row[col] = value === 1 ? 2 : value === 2 ? 1 : value; });
    });
    assert.equal(SudokuSolver.solve(solved, {
        battenburg: [{ cells: cells, kind: "none" }]
    }).solved, true);
});

test("generates unique Classic, Diagonal, and Odd/Even puzzles", function() {
    ["classic", "diagonal", "odd even"].forEach(function(variant, index) {
        const generated = SudokuGenerator.generate({ size: 9, variant: variant, seed: 100 + index });
        const answers = SudokuCSP.createProblem(generated.board, generated.constraints).enumerateAnswers(2);
        assert.equal(generated.unique, true, variant);
        assert.equal(answers.length, 1, variant);
        assert.deepEqual(answers[0], generated.solution, variant);
        if (variant === "odd even") assert.ok(generated.oddEvenMarks.length > 0);
    });
});

test("generates rotationally symmetric givens and paired variant marks", function() {
    const generated = SudokuGenerator.generate({
        size: 6,
        variants: ["classic", "odd even", "kropki", "xv", "battenburg"],
        seed: 7
    });
    const rotate = (cell) => ({ row: 5 - cell.row, col: 5 - cell.col });
    const cellsKey = (cells) => cells.map((cell) => `${cell.row}:${cell.col}`).sort().join("|");

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            assert.equal(Boolean(generated.board[row][col]), Boolean(generated.board[5 - row][5 - col]));
        }
    }
    const markSets = [
        generated.oddEvenMarks.map((mark) => [mark.cell]),
        generated.kropkiMarks.map((mark) => mark.cells),
        generated.xvMarks.map((mark) => mark.cells),
        generated.battenburgMarks.map((mark) => mark.cells)
    ];
    markSets.forEach(function(marks) {
        const keys = new Set(marks.map(cellsKey));
        marks.forEach(function(cells) {
            assert.equal(keys.has(cellsKey(cells.map(rotate))), true);
        });
    });
    assert.ok(generated.oddEvenMarks.length + generated.kropkiMarks.length +
        generated.xvMarks.length + generated.battenburgMarks.length > 0);
    assert.equal(SudokuCSP.createProblem(generated.board, generated.constraints).enumerateAnswers(2).length, 1);
});

test("prunes generated puzzles to rotational pair minimality", function() {
    const generated = SudokuGenerator.generate({ size: 9, variants: ["classic", "xv"], seed: 7 });
    const checked = new Set();
    for (let index = 0; index < 81; index++) {
        const rotated = 80 - index;
        if (checked.has(index) || !generated.board[Math.floor(index / 9)][index % 9]) continue;
        checked.add(index);
        checked.add(rotated);
        const copy = generated.board.map((row) => row.slice());
        copy[Math.floor(index / 9)][index % 9] = 0;
        copy[Math.floor(rotated / 9)][rotated % 9] = 0;
        assert.notEqual(SudokuCSP.createProblem(copy, generated.constraints).enumerateAnswers(2).length, 1);
    }
    if (generated.xvMarks.length) {
        const withoutXV = { ...generated.constraints, xv: [] };
        assert.notEqual(SudokuCSP.createProblem(generated.board, withoutXV).enumerateAnswers(2).length, 1);
    }
});

test("can complete an existing grid before symmetric minimal pruning", function() {
    const source = Array.from({ length: 6 }, () => Array(6).fill(0));
    source[0][0] = 1;
    source[1][4] = 2;
    const generated = SudokuGenerator.generate({
        size: 6,
        variants: ["classic", "odd even"],
        sourceBoard: source,
        sourceConstraints: { oddEven: [{ cell: { row: 0, col: 0 }, parity: "odd" }] },
        seed: 19
    });
    assert.equal(generated.solution[0][0], 1);
    assert.equal(generated.solution[1][4], 2);
    assert.equal(SudokuCSP.createProblem(generated.board, generated.constraints).enumerateAnswers(2).length, 1);
});

test("preserves arbitrary existing variant constraints while pruning only givens", function() {
    const source = [
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [2, 3, 4, 5, 6, 1],
        [5, 6, 1, 2, 3, 4],
        [3, 4, 5, 6, 1, 2],
        [6, 1, 2, 3, 4, 5]
    ];
    const thermo = Array.from({ length: 6 }, function(_, col) { return { row: 0, col: col }; });
    const generated = SudokuGenerator.generate({
        size: 6,
        variants: ["classic", "thermo"],
        sourceBoard: source,
        sourceConstraints: { thermos: [thermo] },
        preserveExisting: true,
        seed: 23
    });
    assert.equal(generated.preserveExisting, true);
    assert.deepEqual(generated.constraints.thermos, [thermo]);
    assert.equal(generated.oddEvenMarks.length + generated.kropkiMarks.length +
        generated.xvMarks.length + generated.battenburgMarks.length, 0);
    assert.equal(SudokuCSP.createProblem(generated.board, generated.constraints).enumerateAnswers(2).length, 1);
});

test("counts Skyscraper visibility from an outside clue", function() {
    const solved = boardFromString(
        "123456789456789123789123456" +
        "234567891567891234891234567" +
        "345678912678912345912345678"
    );
    const cells = Array.from({ length: 9 }, function(_, col) { return { row: 0, col: col }; });
    assert.equal(SudokuSolver.solve(solved, { skyscrapers: [{ clue: 9, cells: cells }] }).solved, true);
    assert.equal(SudokuSolver.solve(solved, { skyscrapers: [{ clue: 1, cells: cells }] }).solved, false);
});

test("sums digits strictly between 1 and 6 for Sandwich clues", function() {
    const solved = boardFromString(
        "123456789456789123789123456" +
        "234567891567891234891234567" +
        "345678912678912345912345678"
    );
    const firstRow = Array.from({ length: 9 }, function(_, col) { return { row: 0, col: col }; });
    const secondRow = Array.from({ length: 9 }, function(_, col) { return { row: 1, col: col }; });

    assert.equal(SudokuSolver.solve(solved, { sandwiches: [{ clue: 14, cells: firstRow }] }).solved, true);
    assert.equal(SudokuSolver.solve(solved, { sandwiches: [{ clue: 24, cells: secondRow }] }).solved, true);
    assert.equal(SudokuSolver.solve(solved, { sandwiches: [{ clue: 13, cells: firstRow }] }).solved, false);
});

test("reads a zero-valued Sandwich clue from an expanded margin", function() {
    const puzzle = {
        gridtype: "sudoku",
        nx: 11,
        ny: 11,
        nx0: 15,
        space: [1, 1, 1, 1],
        activeSudokuVariants: ["classic", "sandwich"],
        centerlist: [],
        point: {},
        pu_q: { number: { 33: [0, 1, "1"] }, symbol: {}, line: {} }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.sandwiches.length, 1);
    assert.equal(constraints.sandwiches[0].clue, 0);
    assert.deepEqual(constraints.sandwiches[0].cells[0], { row: 0, col: 0 });
});

test("enforces both Sudoku diagonals as all-different", function() {
    const diagonals = [
        Array.from({ length: 9 }, function(_, index) { return { row: index, col: index }; }),
        Array.from({ length: 9 }, function(_, index) { return { row: index, col: 8 - index }; })
    ];
    const result = SudokuSolver.solve(emptyBoard(), { diagonalAllDifferent: diagonals });

    assert.equal(result.solved, true);
    diagonals.forEach(function(diagonal) {
        assert.equal(new Set(diagonal.map(function(cell) {
            return result.board[cell.row][cell.col];
        })).size, 9);
    });
});

test("anti-diagonals contain exactly three digits repeated three times", function() {
    const diagonals = [
        Array.from({ length: 9 }, function(_, index) { return { row: index, col: index }; }),
        Array.from({ length: 9 }, function(_, index) { return { row: index, col: 8 - index }; })
    ];
    const result = SudokuSolver.solve(emptyBoard(), { antiDiagonals: diagonals });

    assert.equal(result.solved, true);
    diagonals.forEach(function(diagonal) {
        const counts = {};
        diagonal.forEach(function(cell) {
            const value = result.board[cell.row][cell.col];
            counts[value] = (counts[value] || 0) + 1;
        });
        assert.deepEqual(Object.values(counts).sort(), [3, 3, 3]);
    });
});

test("anti-king rejects equal digits a king move apart", function() {
    const board = emptyBoard();
    board[2][2] = 5;
    board[3][3] = 5;
    const result = SudokuSolver.solve(board, {
        antiKing: [[{ row: 2, col: 2 }, { row: 3, col: 3 }]]
    });

    assert.equal(result.solved, false);
});

test("anti-knight rejects equal digits a knight move apart", function() {
    const board = emptyBoard();
    board[0][1] = 5;
    board[1][3] = 5;
    const result = SudokuSolver.solve(board, {
        antiKnight: [[{ row: 0, col: 1 }, { row: 1, col: 3 }]]
    });

    assert.equal(result.solved, false);
});

test("non-consecutive rejects consecutive orthogonal neighbors", function() {
    const board = emptyBoard();
    board[0][0] = 4;
    board[0][1] = 5;
    const result = SudokuSolver.solve(board, {
        nonConsecutive: [[{ row: 0, col: 0 }, { row: 0, col: 1 }]]
    });

    assert.equal(result.solved, false);
});

test("limits candidates using white and black Kropki dots", function() {
    const whiteBoard = emptyBoard();
    whiteBoard[0][0] = 4;
    const white = SudokuSolver.getCandidates(whiteBoard, {
        kropki: [{
            cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            kind: "white"
        }]
    });
    assert.deepEqual(white.candidates[0][1], [3, 5]);

    const blackBoard = emptyBoard();
    blackBoard[0][0] = 4;
    const black = SudokuSolver.getCandidates(blackBoard, {
        kropki: [{
            cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            kind: "black"
        }]
    });
    assert.deepEqual(black.candidates[0][1], [2, 8]);

    const none = SudokuSolver.getCandidates(blackBoard, {
        kropki: [{
            cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            kind: "none"
        }]
    });
    assert.deepEqual(none.candidates[0][1], [1, 6, 7, 9]);
});

test("mirrors candidates across palindrome paths", function() {
    const board = emptyBoard();
    board[0][0] = 4;
    const result = SudokuSolver.getCandidates(board, {
        palindromes: [[
            { row: 0, col: 0 },
            { row: 1, col: 2 },
            { row: 3, col: 4 }
        ]]
    });

    assert.deepEqual(result.candidates[3][4], [4]);
});

test("limits candidates using V, X, and negative XV edges", function() {
    const board = emptyBoard();
    board[0][0] = 2;
    const cells = [{ row: 0, col: 0 }, { row: 0, col: 1 }];

    assert.deepEqual(SudokuSolver.getCandidates(board, {
        xv: [{ cells: cells, kind: "V" }]
    }).candidates[0][1], [3]);
    assert.deepEqual(SudokuSolver.getCandidates(board, {
        xv: [{ cells: cells, kind: "X" }]
    }).candidates[0][1], [8]);
    assert.deepEqual(SudokuSolver.getCandidates(board, {
        xv: [{ cells: cells, kind: "none" }]
    }).candidates[0][1], [1, 4, 5, 6, 7, 9]);
});

test("candidate analysis keeps only digits that occur in a complete solution", function() {
    const puzzle = boardFromString(
        "530070000" +
        "600195000" +
        "098000060" +
        "800060003" +
        "400803001" +
        "700020006" +
        "060000280" +
        "000419005" +
        "000080079"
    );

    const result = SudokuCSP.createProblem(puzzle).irrefutableFacts();

    assert.equal(result.satisfiable, true);
    assert.equal(result.unique, true);
    assert.deepEqual(result.candidates[0][2], [4]);
    assert.equal(result.forced[0][2], 4);
});

test("asynchronous irrefutable extraction reports witness and completion progress", async function() {
    const puzzle = boardFromString(
        "530070000" +
        "600195000" +
        "098000060" +
        "800060003" +
        "400803001" +
        "700020006" +
        "060000280" +
        "000419005" +
        "000080079"
    );
    const events = [];

    const result = await SudokuCSP.getCandidatesAsync(puzzle, {}, {
        onProgress: function(event) { events.push(event.type); }
    });

    assert.equal(result.unique, true);
    assert.deepEqual(result.candidates[0][2], [4]);
    assert.equal(events.includes("solution"), true);
    assert.equal(events.includes("refuted"), true);
    assert.equal(events.at(-1), "done");
});

test("incremental candidate analysis reuses compatible solution witnesses", async function() {
    const puzzle = boardFromString(
        "530070000" +
        "600195000" +
        "098000060" +
        "800060003" +
        "400803001" +
        "700020006" +
        "060000280" +
        "000419005" +
        "000080079"
    );
    const first = await SudokuCSP.getCandidatesAsync(puzzle, {});
    puzzle[0][2] = first.witnessSolutions[0][0][2];

    const next = await SudokuCSP.getCandidatesAsync(puzzle, {}, {
        seedSolutions: first.witnessSolutions
    });

    assert.equal(next.satisfiable, true);
    assert.ok(next.reusedWitnesses > 0);
    assert.equal(next.witnessSolutions[0][0][2], puzzle[0][2]);
});

test("problem answer enumeration is bounded", function() {
    const problem = SudokuCSP.createProblem(emptyBoard());
    const answers = problem.enumerateAnswers(2);

    assert.equal(problem.answerKeys.length, 81);
    assert.equal(answers.length, 2);
    assert.notDeepEqual(answers[0], answers[1]);
});

test("reads black and white Kropki dots from edge symbols", function() {
    const puzzle = {
        nx0: 13,
        centerlist: [28, 29, 41, 42],
        point: {
            200: { neighbor: [28, 29] },
            201: { neighbor: [28, 41] }
        },
        pu_q: {
            symbol: {
                200: [2, "circle_SS", 1],
                201: [1, "circle_SS", 1]
            }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.kropki, [
        {
            cells: [{ row: 0, col: 0, key: 28 }, { row: 0, col: 1, key: 29 }],
            kind: "black"
        },
        {
            cells: [{ row: 0, col: 0, key: 28 }, { row: 1, col: 0, key: 41 }],
            kind: "white"
        }
    ]);
    assert.equal(constraints.supported.includes("kropki"), true);
});

test("reads odd circles and even squares from cell symbols", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "odd even",
        centerlist: [28, 29],
        point: {},
        pu_q: {
            line: {},
            number: {},
            symbol: {
                28: [3, "circle_L", 2],
                29: [3, "square_L", 2]
            }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.oddEven.map(function(mark) {
        return [mark.cell.row, mark.cell.col, mark.parity];
    }), [[0, 0, "odd"], [0, 1, "even"]]);
    assert.equal(constraints.supported.includes("odd even"), true);
});

test("reads native Penpa cage boundaries through the refreshed Killer cache", function() {
    let refreshCalls = 0;
    const puzzle = {
        nx0: 13,
        ny0: 13,
        centerlist: [28, 29],
        point: {},
        refreshKillerCages: function(layer) {
            refreshCalls++;
            assert.equal(layer, "pu_q");
            return [[28, 29]];
        },
        pu_q: {
            line: {},
            number: {},
            symbol: {},
            numberS: { 788: [" 3", 1] }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(refreshCalls, 1);
    assert.equal(constraints.killers.length, 1);
    assert.equal(constraints.killers[0].total, 3);
    assert.deepEqual(constraints.killers[0].cells.map(function(cell) {
        return [cell.row, cell.col];
    }), [[0, 0], [0, 1]]);
});

test("normalizes multiple selected variants at once", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariants: ["classic", "diagonal", "anti diagonal", "odd even"],
        centerlist: [28],
        point: {},
        pu_q: {
            line: {},
            number: {},
            symbol: { 28: [3, "circle_L", 2] }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.diagonalAllDifferent.length, 2);
    assert.equal(constraints.antiDiagonals.length, 2);
    assert.equal(constraints.oddEven.length, 1);
    assert.equal(constraints.supported.includes("diagonal"), true);
    assert.equal(constraints.supported.includes("anti diagonal"), true);
});

test("normalizes anti-king, anti-knight, and non-consecutive global pairs", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariants: ["classic", "anti king", "anti knight", "non consecutive"],
        centerlist: [],
        point: {},
        pu_q: { line: {}, number: {}, symbol: {} }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.antiKing.length, 272);
    assert.equal(constraints.antiKnight.length, 224);
    assert.equal(constraints.nonConsecutive.length, 144);
    assert.equal(constraints.supported.includes("anti king"), true);
    assert.equal(constraints.supported.includes("anti knight"), true);
    assert.equal(constraints.supported.includes("non consecutive"), true);
});

test("reads palindrome paths from foreground line segments", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "palindrome",
        centerlist: [28, 42, 56],
        pu_q: {
            line: { "28,42": 5, "42,56": 5 },
            symbol: {},
            number: {}
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.palindromes[0].map(function(cell) {
        return [cell.row, cell.col];
    }), [[0, 0], [1, 1], [2, 2]]);
});

test("reads XV edge clues and keeps negative XV off by default", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "xv",
        centerlist: [28, 29],
        point: { 200: { neighbor: [28, 29] } },
        pu_q: {
            line: {},
            symbol: {},
            number: { 200: ["V", 6, "5"] }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.xv.length, 1);
    assert.equal(constraints.xv[0].kind, "V");
    assert.equal(constraints.xv.some(function(item) { return item.kind === "none"; }), false);
});

test("negative XV toggle constrains unmarked orthogonal edges", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "xv",
        xvNegativeConstraint: true,
        centerlist: [28, 29],
        point: {},
        pu_q: { line: {}, symbol: {}, number: {} }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);
    const edge = constraints.xv.find(function(item) {
        return item.cells[0].row === 0 && item.cells[0].col === 0 &&
            item.cells[1].row === 0 && item.cells[1].col === 1;
    });

    assert.equal(edge.kind, "none");
});

test("selected Kropki variant leaves negative constraints off by default", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "kropki",
        centerlist: [28, 29],
        point: {},
        pu_q: { symbol: {} }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.kropki.some(function(item) { return item.kind === "none"; }), false);
});

test("negative Kropki toggle adds constraints to undotted edges", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "kropki",
        kropkiNegativeConstraint: true,
        centerlist: [28, 29],
        point: {},
        pu_q: { symbol: {} }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);
    const edge = constraints.kropki.find(function(item) {
        return item.cells[0].row === 0 && item.cells[0].col === 0 &&
            item.cells[1].row === 0 && item.cells[1].col === 1;
    });

    assert.equal(edge.kind, "none");
});

test("supports registering new CSP constraint handlers", function() {
    SudokuCSP.registerConstraint("testAllowedDigits", {
        validatePartial: function(board, constraint, helpers) {
            const value = helpers.cellValue(board, constraint.cell);
            return !value || constraint.allowed.includes(value);
        }
    });

    const result = SudokuCSP.createProblem(emptyBoard(), {
        testAllowedDigits: [{
            cell: { row: 0, col: 0 },
            allowed: [2, 4]
        }]
    }).candidates();

    assert.equal(SudokuCSP.registeredConstraints().includes("testAllowedDigits"), true);
    assert.deepEqual(result.candidates[0][0], [2, 4]);
});
