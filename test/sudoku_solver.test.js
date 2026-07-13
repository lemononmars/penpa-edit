const assert = require("node:assert/strict");
const test = require("node:test");

const SudokuCSP = require("../docs/js/sudoku_csp.js");
const SudokuSolver = require("../docs/js/sudoku_solver.js");

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
