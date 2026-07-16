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

test("shared Penpa primitives stay owned by the selected variant", function() {
    const settings = {
        renban: { modeset: ["sudoku", "line", "cage"], submodeset: ["1", "2", "1"] },
        extraregion: { modeset: ["sudoku", "surface"], submodeset: ["1", ""] },
        palindrome: { modeset: ["sudoku", "line"], submodeset: ["1", "2"] },
        killer: { modeset: ["sudoku", "cage", "number"], submodeset: ["1", "1", "11"] }
    };

    assert.equal(SudokuSolver.shouldDiscoverVariant(
        ["classic", "renban"], settings, "palindrome", "line", "2"
    ), false);
    assert.equal(SudokuSolver.shouldDiscoverVariant(
        ["classic", "extraregion"], settings, "killer", "cage", "1"
    ), true);
    assert.equal(SudokuSolver.shouldDiscoverVariant(
        ["classic"], settings, "palindrome", "line", "2"
    ), true);
    assert.equal(SudokuSolver.shouldDiscoverVariant(
        ["classic", "palindrome"], settings, "palindrome", "line", "2"
    ), true);
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

test("applies a solution to a legacy puzzle mode without Sudoku settings", function() {
    const puzzle = {
        nx0: 13,
        space: [0, 0, 0, 0],
        mode: {
            qa: "pu_q",
            pu_q: { edit_mode: "surface" },
            pu_a: { edit_mode: "surface" }
        },
        pu_q: { number: {} },
        pu_a: { number: {} },
        undoredo_counter: 0,
        mode_qa: function(mode) { this.mode.qa = mode; },
        set_value: function(type, key, value) { this[this.mode.qa][type][key] = value; },
        redraw: function() {}
    };

    const solution = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );
    const changed = SudokuSolver.applySolution(puzzle, solution);

    assert.equal(changed, 81);
    assert.deepEqual(puzzle.mode.pu_a.sudoku, ["1", 9]);
    assert.deepEqual(puzzle.pu_a.number[28], ["5", 9, "1"]);
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

test("catalog global constraints cover diagonal, parity, queen, and touch rules", function() {
    const diagonalPair = [[{ row: 0, col: 0 }, { row: 1, col: 1 }]];
    let board = emptyBoard();
    board[0][0] = 3; board[1][1] = 4;
    assert.equal(SudokuSolver.solve(board, { diagonalNonConsecutive: diagonalPair }).solved, false);

    board = emptyBoard();
    board[0][0] = 2; board[1][1] = 4;
    assert.equal(SudokuSolver.solve(board, { noEvenNeighbours: diagonalPair }).solved, false);

    board = emptyBoard();
    board[0][0] = 1; board[0][1] = 3; board[0][2] = 5;
    assert.equal(SudokuSolver.solve(board, { noThreeInRow: [[
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }
    ]] }).solved, false);

    board = emptyBoard();
    board[0][0] = 9; board[1][1] = 9;
    assert.equal(SudokuSolver.solve(board, { queenDigits: diagonalPair }).solved, false);

    board = emptyBoard();
    board[0][0] = 1; board[0][1] = 3; board[1][0] = 4; board[1][1] = 5;
    assert.equal(SudokuSolver.solve(board, { touchyCells: [{
        cell: { row: 0, col: 0 },
        neighbors: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }]
    }] }).solved, false);
});

test("catalog edge relations enforce arithmetic and parity clues", function() {
    const cells = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    const board = emptyBoard();
    board[0][0] = 2;
    board[0][1] = 5;
    assert.equal(SudokuSolver.solve(board, {
        edgeRelations: [{ cells: cells, relation: "difference", target: 3 }]
    }).solved, true);
    assert.equal(SudokuSolver.solve(board, {
        edgeRelations: [{ cells: cells, relation: "sum", target: 8 }]
    }).solved, false);
    assert.equal(SudokuSolver.solve(board, {
        edgeRelations: [{ cells: cells, relation: "oddSum" }]
    }).solved, true);
    assert.equal(SudokuSolver.solve(board, {
        edgeRelations: [{ cells: cells, relation: "evenSum" }]
    }).solved, false);
});

test("catalog line and four-cell relations enforce their shared CSP families", function() {
    const line = [{ row: 0, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 4 }];
    let board = emptyBoard();
    board[0][0] = 2; board[1][2] = 4; board[2][4] = 6;
    assert.equal(SudokuSolver.solve(board, {
        catalogLines: [{ path: line, relation: "paritylines" }]
    }).solved, true);
    board[2][4] = 5;
    assert.equal(SudokuSolver.solve(board, {
        catalogLines: [{ path: line, relation: "paritylines" }]
    }).solved, false);

    const cells = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }];
    board = emptyBoard();
    board[0][0] = 1; board[0][1] = 2; board[1][0] = 3; board[1][1] = 4;
    assert.equal(SudokuSolver.solve(board, {
        quadRelations: [{ cells: cells, relation: "equalsums" }]
    }).solved, true);
    assert.equal(SudokuSolver.solve(board, {
        quadRelations: [{ cells: cells, relation: "equalproducts" }]
    }).solved, false);
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

test("groups shaded All Odd All Even cells by Sudoku box", function() {
    const puzzle = {
        nx: 9,
        ny: 9,
        nx0: 13,
        space: [0, 0, 0, 0],
        activeSudokuVariants: ["classic", "alloddalleven"],
        centerlist: [28, 29, 30, 31],
        point: {},
        pu_q: {
            line: {}, number: {}, symbol: {},
            surface: { 28: 1, 29: 1, 30: 1, 31: 1 }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.shadedParityGroups.map(function(group) {
        return group.map(function(cell) { return [cell.row, cell.col]; });
    }), [[[0, 0], [0, 1], [0, 2]]]);
    assert.equal(constraints.supported.includes("alloddalleven"), true);
});

test("normalizes matching translated shaded Clone regions", function() {
    const puzzle = {
        nx: 9,
        ny: 9,
        nx0: 13,
        space: [0, 0, 0, 0],
        activeSudokuVariants: ["classic", "clone"],
        centerlist: [28, 29, 56, 57],
        point: {},
        pu_q: {
            line: {}, number: {}, symbol: {},
            surface: { 28: 1, 29: 1, 56: 1, 57: 1 }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.cloneGroups.map(function(group) {
        return group.map(function(cell) { return [cell.row, cell.col]; });
    }), [
        [[0, 0], [2, 2]],
        [[0, 1], [2, 3]]
    ]);
    assert.deepEqual(constraints.cloneShapeChecks, [{ valid: true }]);
    assert.equal(constraints.supported.includes("clone"), true);
});

test("rejects an unmatched shaded Clone shape", function() {
    const puzzle = {
        nx: 9,
        ny: 9,
        nx0: 13,
        space: [0, 0, 0, 0],
        activeSudokuVariants: ["classic", "clone"],
        centerlist: [28, 29, 56, 57, 98],
        point: {},
        pu_q: {
            line: {}, number: {}, symbol: {},
            surface: { 28: 1, 29: 1, 56: 1, 57: 1, 98: 1 }
        }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.cloneShapeChecks, [{ valid: false }]);
    assert.equal(SudokuCSP.solve(emptyBoard(), constraints).solved, false);
});

test("enforces shaded parity and corresponding Clone digits in CSP", function() {
    const solution = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );

    assert.equal(SudokuCSP.solve(solution, {
        shadedParityGroups: [[{ row: 0, col: 0 }, { row: 0, col: 4 }]],
        cloneGroups: [[{ row: 0, col: 0 }, { row: 2, col: 6 }]],
        cloneShapeChecks: [{ valid: true }]
    }).solved, true);
    assert.equal(SudokuCSP.solve(solution, {
        shadedParityGroups: [[{ row: 0, col: 0 }, { row: 0, col: 2 }]]
    }).solved, false);
    assert.equal(SudokuCSP.solve(solution, {
        cloneGroups: [[{ row: 0, col: 0 }, { row: 0, col: 1 }]]
    }).solved, false);
});

test("enforces all-different, coverage, Renban, and consecutive Clone regions", function() {
    const solution = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );

    assert.equal(SudokuCSP.solve(solution, {
        regionAllDifferent: [[{ row: 0, col: 0 }, { row: 2, col: 6 }]]
    }).solved, false);
    assert.equal(SudokuCSP.solve(solution, {
        regionCoverage: [[0, 1, 2, 3, 4, 5, 6, 7, 8].map(function(col) { return { row: 0, col: col }; })]
    }).solved, true);
    assert.equal(SudokuCSP.solve(solution, {
        renbanRegions: [[{ row: 0, col: 0 }, { row: 0, col: 3 }, { row: 0, col: 4 }]]
    }).solved, true);
    assert.equal(SudokuCSP.solve(solution, {
        consecutiveCloneGroups: [[{ row: 0, col: 0 }, { row: 0, col: 3 }]]
    }).solved, true);
    assert.equal(SudokuCSP.solve(solution, {
        consecutiveCloneGroups: [[{ row: 0, col: 0 }, { row: 0, col: 4 }]]
    }).solved, false);

    const latin = Array.from({ length: 9 }, function(_, row) {
        return Array.from({ length: 9 }, function(__, col) { return (row + col) % 9 + 1; });
    });
    assert.equal(SudokuCSP.solve(latin, { baseBoxes: false }).solved, true);
    assert.equal(SudokuCSP.solve(latin, {}).solved, false);
});

test("reads matching Clone cages as corresponding CSP groups", function() {
    const puzzle = {
        nx: 9,
        ny: 9,
        nx0: 13,
        space: [0, 0, 0, 0],
        activeSudokuVariants: ["classic", "clone"],
        centerlist: [28, 29, 56, 57],
        point: {},
        refreshKillerCages: function() { return [[28, 29], [56, 57]]; },
        pu_q: { line: {}, number: {}, numberS: {}, symbol: {}, surface: {} }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.deepEqual(constraints.cloneGroups.map(function(group) {
        return group.map(function(cell) { return [cell.row, cell.col]; });
    }), [
        [[0, 0], [2, 2]],
        [[0, 1], [2, 3]]
    ]);
    assert.equal(constraints.killers.length, 0);
    assert.equal(constraints.cloneShapeChecks[0].valid, true);
});

test("Windoku exposes four all-different window regions", function() {
    const cage = (startRow, startCol) => Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (__, col) => (startCol + col + 2) + (startRow + row + 2) * 13)).flat();
    const puzzle = {
        nx: 9, ny: 9, nx0: 13, space: [0, 0, 0, 0],
        activeSudokuVariants: ["classic", "windoku"],
        centerlist: [], point: {},
        refreshKillerCages: function() { return [cage(1, 1), cage(1, 4), cage(4, 1), cage(4, 4)]; },
        pu_q: { line: {}, number: {}, numberS: {}, symbol: {}, surface: {}, killercages: [] }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.regionAllDifferent.length, 4);
    assert.deepEqual(constraints.regionAllDifferent[0].map(function(cell) {
        return [cell.row, cell.col];
    }), [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]]);
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

test("Consecutive reads only white dots and applies its negative toggle", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariant: "consecutive",
        consecutiveNegativeConstraint: true,
        centerlist: [28, 29, 41, 42],
        point: {
            200: { neighbor: [28, 29] },
            201: { neighbor: [28, 41] }
        },
        pu_q: { symbol: {
            200: [1, "circle_SS", 2],
            201: [2, "circle_SS", 2]
        } }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);
    const marked = constraints.edgeRelations.filter(function(clue) { return clue.relation === "consecutive"; });
    const negative = constraints.edgeRelations.filter(function(clue) { return clue.relation === "notConsecutive"; });

    assert.equal(marked.length, 1);
    assert.equal(negative.length > 0, true);
    assert.equal(constraints.kropki.length, 0);
});

test("reads center and corner direction-arrow variants", function() {
    const centerPuzzle = {
        nx0: 13,
        activeSudokuVariant: "pointtonext",
        centerlist: [28, 29, 30, 41, 42, 43, 54, 55, 56],
        point: {},
        pu_q: { symbol: { 42: [5, "arrow_B_G", 2] } }
    };
    const centerClue = SudokuSolver.readConstraints(centerPuzzle).directionalMarks[0];
    assert.equal(centerClue.relation, "pointtonext");
    assert.deepEqual(centerClue.origin, { row: 1, col: 1, key: 42 });
    assert.deepEqual(centerClue.targets, Array.from({ length: 7 }, (_, index) => ({ row: 1, col: index + 2 })));

    const cornerPuzzle = {
        nx0: 13,
        activeSudokuVariant: "quadmax",
        centerlist: [28, 29, 41, 42],
        point: { 200: { neighbor: [28, 29, 41, 42] } },
        pu_q: { symbol: { 200: [4, "arrow_B_B", 2] } }
    };
    const cornerClue = SudokuSolver.readConstraints(cornerPuzzle).directionalMarks[0];
    assert.equal(cornerClue.relation, "quadmax");
    assert.deepEqual(cornerClue.target, { row: 0, col: 1, key: 29 });
});

test("recognizes spaced Search 9 names and Fat Gray arrows as supported", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariants: ["classic", "Search 9"],
        centerlist: [28, 29, 30, 41, 42, 43, 54, 55, 56],
        point: {},
        pu_q: { symbol: { 42: [5, "arrow_B_G", 2] } }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);

    assert.equal(constraints.supported.includes("search9"), true);
    assert.equal(constraints.directionalMarks[0].relation, "search9");
    assert.deepEqual(constraints.directionalMarks[0].targets, [{ row: 1, col: 2 }]);
});

test("keeps shared arrow marks assigned to every active directional variant", function() {
    const puzzle = {
        nx0: 13,
        activeSudokuVariants: ["classic", "eliminate", "search9", "quadmax"],
        centerlist: [28, 29, 30, 41, 42, 43, 54, 55, 56],
        point: { 200: { neighbor: [28, 29, 41, 42] } },
        pu_q: { symbol: {
            42: [5, "arrow_B_G", 2, "eliminate"],
            43: [1, "arrow_B_G", 2, "search9"],
            200: [4, "arrow_B_B", 2, "quadmax"]
        } }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);
    const relations = constraints.directionalMarks.map(function(clue) { return clue.relation; });

    assert.equal(constraints.supported.includes("eliminate"), true);
    assert.equal(constraints.supported.includes("search9"), true);
    assert.equal(constraints.supported.includes("quadmax"), true);
    assert.deepEqual(relations.sort(), ["eliminate", "quadmax", "search9"]);
});

test("reports detailed conflict cells for duplicate givens and variant clues", function() {
    const duplicates = emptyBoard();
    duplicates[0][0] = 5;
    duplicates[0][3] = 5;
    const duplicate = SudokuCSP.findConflict(duplicates, {});

    assert.match(duplicate.message, /digit 5.*row 1.*r1c1.*r1c4/i);
    assert.deepEqual(duplicate.cells, [{ row: 0, col: 0 }, { row: 0, col: 3 }]);

    const board = emptyBoard();
    board[0][0] = 5;
    board[0][1] = 5;
    const clueConflict = SudokuCSP.findConflict(board, {
        baseBoxes: false,
        directionalMarks: [{
            relation: "eliminate",
            origin: { row: 0, col: 0 },
            targets: [{ row: 0, col: 1 }]
        }]
    });

    // Row duplication is the earliest and most concrete conflict.
    assert.equal(clueConflict.kind, "duplicate");

    const nonDuplicateBoard = emptyBoard();
    nonDuplicateBoard[0][0] = 5;
    nonDuplicateBoard[1][1] = 5;
    const directional = SudokuCSP.findConflict(nonDuplicateBoard, {
        baseBoxes: false,
        directionalMarks: [{
            relation: "eliminate",
            origin: { row: 0, col: 0 },
            targets: [{ row: 1, col: 1 }]
        }]
    });
    assert.equal(directional.constraint, "directionalMarks");
    assert.deepEqual(directional.cells, [{ row: 0, col: 0 }, { row: 1, col: 1 }]);
});

test("validates all directional shape relations", function() {
    const solved = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );
    function accepted(clue) {
        return SudokuCSP.solve(solved, { directionalMarks: [clue] }).solved;
    }

    assert.equal(accepted({ relation: "biggestneighbours", targets: [{ row: 0, col: 5 }],
        neighbors: [{ row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }] }), true);
    assert.equal(accepted({ relation: "biggestneighbours", targets: [{ row: 0, col: 3 }],
        neighbors: [{ row: 0, col: 3 }, { row: 0, col: 4 }] }), false);
    assert.equal(accepted({ relation: "smallestneighbours", targets: [{ row: 0, col: 1 }],
        neighbors: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 3 }] }), true);
    assert.equal(accepted({ relation: "smallestneighbours", targets: [{ row: 0, col: 0 }],
        neighbors: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }), false);
    assert.equal(accepted({ relation: "eliminate", origin: { row: 0, col: 0 }, targets: [{ row: 0, col: 1 }] }), true);
    assert.equal(accepted({ relation: "eliminate", origin: { row: 0, col: 0 }, targets: [{ row: 1, col: 5 }] }), false);
    assert.equal(accepted({ relation: "pointtonext", origin: { row: 0, col: 0 }, targets: [{ row: 0, col: 1 }] }), false);
    assert.equal(accepted({ relation: "pointtonext", origin: { row: 0, col: 0 }, targets: [{ row: 0, col: 3 }] }), true);
    assert.equal(accepted({ relation: "pointtoprevious", origin: { row: 0, col: 0 }, targets: [{ row: 0, col: 2 }] }), true);
    assert.equal(accepted({ relation: "quadmax", target: { row: 1, col: 1 }, cells: [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
    ] }), true);
    assert.equal(accepted({ relation: "quadmin", target: { row: 0, col: 1 }, cells: [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
    ] }), true);
    assert.equal(accepted({ relation: "search6", origin: { row: 1, col: 3 }, searchDigit: 6,
        rays: [[{ row: 0, col: 3 }]] }), true);
    assert.equal(accepted({ relation: "search9", origin: { row: 0, col: 0 }, searchDigit: 9,
        rays: [[{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 },
            { row: 0, col: 5 }, { row: 0, col: 6 }]] }), false);
});

test("validates coded, pencilmark, cage, thermo, symmetry, and outside catalog variants", function() {
    const solved = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );
    const constraints = {
        codedGroups: [{ groups: [
            [{ row: 0, col: 0 }, { row: 1, col: 5 }],
            [{ row: 0, col: 3 }, { row: 1, col: 0 }]
        ] }],
        pencilmarkCells: [{ cell: { row: 0, col: 0 }, allowed: [2, 5, 8] }],
        symmetricUnequal: [[{ row: 0, col: 0 }, { row: 8, col: 8 }]],
        stretchedThermos: [[{ row: 0, col: 1 }, { row: 0, col: 0 }, { row: 0, col: 3 }]],
        productKillers: [{ cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], total: 15 }],
        soloKillerGroups: [[[{ row: 0, col: 0 }], [{ row: 1, col: 5 }]]],
        outsideRelations: [
            { relation: "bust", value: 5, cells: Array.from({ length: 9 }, (_, col) => ({ row: 0, col })) },
            { relation: "xsums", value: 25, cells: Array.from({ length: 9 }, (_, col) => ({ row: 0, col })) },
            { relation: "numberedrooms", value: 7, cells: Array.from({ length: 9 }, (_, col) => ({ row: 0, col })) },
            { relation: "sumframe", value: 12, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] }
        ]
    };

    assert.equal(SudokuCSP.solve(solved, constraints).solved, true);

    const invalid = { ...constraints, pencilmarkCells: [{ cell: { row: 0, col: 0 }, allowed: [1, 2] }] };
    assert.equal(SudokuCSP.solve(solved, invalid).solved, false);
});

test("normalizes the newly implemented catalog variants for the solver", function() {
    function puzzleFor(variant, additions = {}) {
        return {
            nx0: 13,
            ny0: 13,
            activeSudokuVariant: variant,
            centerlist: [28, 29, 30, 41, 42, 43, 54, 55, 56],
            point: {},
            pu_q: { number: {}, numberS: {}, symbol: {}, thermo: [], nobulbthermo: [], killercages: [] },
            ...additions
        };
    }

    ["mirror", "symmetricunequal", "coded", "pencilmarks", "solokiller"].forEach(function(variant) {
        assert.equal(SudokuSolver.readConstraints(puzzleFor(variant)).supported.includes(variant), true);
    });

    const smallest = puzzleFor("smallestneighbours", {
        pu_q: { number: {}, numberS: {}, symbol: { 42: [[0, 0, 0, 0, 1, 0, 0, 0], "arrow_eight", 2] },
            thermo: [], nobulbthermo: [], killercages: [] }
    });
    assert.equal(SudokuSolver.readConstraints(smallest).directionalMarks[0].relation, "smallestneighbours");

    const fullCenterList = Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (__, col) => (row + 2) * 13 + col + 2)).flat();
    ["eliminate", "pointtonext", "pointtoprevious"].forEach(function(variant) {
        const sightline = puzzleFor(variant, {
            centerlist: fullCenterList,
            pu_q: { number: {}, numberS: {}, symbol: {
                28: [[0, 0, 0, 0, 1, 0, 0, 0], "arrow_B_G", 2]
            }, thermo: [], nobulbthermo: [], killercages: [] }
        });
        const clue = SudokuSolver.readConstraints(sightline).directionalMarks[0];
        assert.equal(clue.targets.length, 8, `${variant} should inspect the complete arrow sightline`);
        assert.deepEqual(clue.targets[7], { row: 0, col: 8 });
    });

    const stretched = puzzleFor("stretchedthermo", {
        pu_q: { number: {}, numberS: {}, symbol: {}, thermo: [[28, 29, 30]], nobulbthermo: [], killercages: [] }
    });
    assert.equal(SudokuSolver.readConstraints(stretched).stretchedThermos.length, 1);

    ["bust", "xsums", "numberedrooms", "sumframe"].forEach(function(variant) {
        const outside = puzzleFor(variant, {
            pu_q: { number: { 15: [5, 1, "1"] }, numberS: {}, symbol: {}, thermo: [], nobulbthermo: [], killercages: [] }
        });
        const constraints = SudokuSolver.readConstraints(outside);
        assert.equal(constraints.supported.includes(variant), true);
        assert.equal(constraints.outsideRelations[0].relation, variant);
    });
});

test("reads Coded letters from the upper-left corner slot", function() {
    const puzzle = {
        nx0: 13,
        ny0: 13,
        activeSudokuVariant: "coded",
        centerlist: [28, 29, 42],
        point: {},
        pu_q: {
            number: {},
            symbol: {},
            numberS: {
                788: ["A", 1],
                789: ["wrong corner", 1],
                792: ["A", 1],
                844: ["B", 1]
            }
        }
    };

    const groups = SudokuSolver.readConstraints(puzzle).codedGroups[0].groups;
    assert.deepEqual(groups, [
        [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        [{ row: 1, col: 1 }]
    ]);
});

test("validates the new outside, edge, region, shape, and corner rules", function() {
    const solved = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );
    const row = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    const quad = [{ row: 0, col: 2 }, { row: 0, col: 3 }, { row: 1, col: 2 }, { row: 1, col: 3 }];
    const constraints = {
        outsideRelations: [
            { relation: "productframe", value: 60, cells: row },
            { relation: "edgedifference", value: 3, cells: row },
            { relation: "outsideparity", value: 2, cells: row },
            { relation: "parityparty", value: 12, cells: row },
            { relation: "serbianframe", value: 7, cells: row, axis: "row" },
            { relation: "median", value: 4, cells: row },
            { relation: "ascendingstarters", value: 5, cells: row }
        ],
        fullRankGroups: [[
            { rank: 1, cells: row },
            { rank: 2, cells: Array.from({ length: 9 }, (_, col) => ({ row: 1, col })) }
        ]],
        rossiniLines: [
            { direction: "ascending", cells: [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }] },
            { direction: "none", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] }
        ],
        edgeRelations: [
            { relation: "inequality", sign: ">", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
            { relation: "xydifference", reference: { row: 0, col: 8 }, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
            { relation: "perfectsquares", cells: [{ row: 2, col: 5 }, { row: 2, col: 6 }] },
            { relation: "notPerfectSquare", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }
        ],
        cellRelations: [
            { relation: "fortress", shaded: { row: 0, col: 3 }, unshaded: { row: 0, col: 2 } },
            { relation: "trio", cell: { row: 0, col: 0 }, minimum: 4, maximum: 6 },
            { relation: "average", center: { row: 0, col: 4 },
                ends: [{ row: 0, col: 3 }, { row: 0, col: 5 }], marked: true },
            { relation: "multipledivisor", groups: [[{ row: 0, col: 0 }], [{ row: 0, col: 7 }]] }
        ],
        quadRelations: [
            { relation: "exclusion", cells: quad, digits: [5, 8] },
            { relation: "groupsum", cells: quad, total: 13 },
            { relation: "clockfaces", cells: quad, kind: "white" }
        ]
    };

    assert.equal(SudokuCSP.solve(solved, constraints).solved, true);
    assert.equal(SudokuCSP.solve(solved, {
        rossiniLines: [{ direction: "none", cells: constraints.rossiniLines[0].cells }]
    }).solved, false, "Rossini applies its negative rule to an unmarked increasing line");
    assert.equal(SudokuCSP.solve(solved, {
        cellRelations: [{ ...constraints.cellRelations[2], marked: false }]
    }).solved, false, "Average applies its all-bars-marked converse");
    assert.equal(SudokuCSP.solve(solved, {
        edgeRelations: [{ relation: "notPerfectSquare", cells: constraints.edgeRelations[2].cells }]
    }).solved, false, "Perfect Squares applies its negative rule");
    assert.equal(SudokuCSP.solve(solved, {
        quadRelations: [{ ...constraints.quadRelations[2], kind: "none" }]
    }).solved, false, "Clock Faces applies its negative rule");
    assert.equal(SudokuCSP.solve(solved, {
        outsideRelations: [{ relation: "ascendingstarters", value: 6, cells: row }]
    }).solved, false, "Ascending Starters rejects invalid clue sum");

    assert.equal(SudokuCSP.solve(solved, {
        outsideRelations: [{ relation: "before9", value: 33, cells: row }]
    }).solved, true, "Before 9 accepts valid sum");
    assert.equal(SudokuCSP.solve(solved, {
        outsideRelations: [{ relation: "before9", value: 34, cells: row }]
    }).solved, false, "Before 9 rejects invalid sum");
});

test("normalizes the next catalog batch into concrete CSP constraints", function() {
    const centerlist = Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (__, col) => (row + 2) * 13 + col + 2)).flat();
    function puzzleFor(variant, pu_q = {}, point = {}) {
        return {
            nx0: 13,
            ny0: 13,
            space: [0, 0, 0, 0],
            activeSudokuVariant: variant,
            centerlist,
            point,
            pu_q: { number: {}, numberS: {}, symbol: {}, surface: {}, wall: {}, killercages: [], ...pu_q }
        };
    }

    ["productframe", "edgedifference", "fullrank", "outsideparity", "parityparty",
        "serbianframe", "median", "ascendingstarters"].forEach(function(variant) {
        const constraints = SudokuSolver.readConstraints(puzzleFor(variant, { number: { 15: [4, 1, "1"] } }));
        assert.equal(constraints.supported.includes(variant), true);
        assert.equal(variant === "fullrank" ? constraints.fullRankGroups.length : constraints.outsideRelations.length, 1);
        if (variant === "fullrank") assert.equal(constraints.fullRankGroups[0].length, 36);
    });

    const edgePoint = { 200: { neighbor: [28, 29] } };
    const inequality = SudokuSolver.readConstraints(puzzleFor("inequality", {
        number: { 200: [">", 6, "5"] }
    }, edgePoint));
    assert.equal(inequality.edgeRelations[0].sign, ">");

    const xy = SudokuSolver.readConstraints(puzzleFor("xydifference", {
        symbol: { 200: [1, "diamond_SS", 2] }
    }, edgePoint));
    assert.deepEqual(xy.edgeRelations[0].reference, { row: 0, col: 0 });

    const squares = SudokuSolver.readConstraints(puzzleFor("perfectsquares", {
        symbol: { 200: [1, "diamond_SS", 2] }
    }, edgePoint));
    assert.equal(squares.edgeRelations.some((clue) => clue.relation === "perfectsquares"), true);
    assert.equal(squares.edgeRelations.some((clue) => clue.relation === "notPerfectSquare"), true);

    const cornerPoint = { 300: { neighbor: [28, 29, 41, 42] } };
    const exclusion = SudokuSolver.readConstraints(puzzleFor("exclusion", {
        number: { 300: ["18", 1, "4"] }
    }, cornerPoint));
    assert.deepEqual(exclusion.quadRelations[0].digits, [1, 8]);

    const groupSum = SudokuSolver.readConstraints(puzzleFor("groupsum", {
        number: { 300: [21, 1, "4"] }
    }, cornerPoint));
    assert.equal(groupSum.quadRelations[0].total, 21);

    const trio = SudokuSolver.readConstraints(puzzleFor("trio", {
        symbol: { 28: [1, "circle_L", 2], 29: [1, "square_L", 2], 30: [1, "triup_L", 2] }
    }));
    assert.deepEqual(trio.cellRelations.map((clue) => [clue.minimum, clue.maximum]), [[1, 3], [4, 6], [7, 9]]);

    const divisors = SudokuSolver.readConstraints(puzzleFor("multipledivisor", {
        symbol: { 28: [1, "circle_L", 2], 29: [1, "circle_L", 2], 56: [1, "circle_L", 2] }
    }));
    assert.equal(divisors.supported.includes("multipledivisor"), false);
    assert.equal(divisors.cellRelations.some((clue) => clue.relation === "multipledivisor"), false);

    const rossini = SudokuSolver.readConstraints(puzzleFor("rossini", {
        symbol: { 15: [7, "arrow_N_B", 2] }
    }));
    assert.equal(rossini.rossiniLines.length, 36);
    assert.equal(rossini.rossiniLines[0].direction, "ascending");
    assert.equal(rossini.rossiniLines.filter((clue) => clue.direction === "none").length, 35);

    const clockFaces = SudokuSolver.readConstraints(puzzleFor("clockfaces", {
        symbol: { 300: [1, "circle_SS", 2] }
    }, cornerPoint));
    assert.equal(clockFaces.quadRelations.filter((clue) => clue.kind === "white").length, 1);
    assert.equal(clockFaces.quadRelations.filter((clue) => clue.kind === "none").length, 63);

    const fortress = SudokuSolver.readConstraints(puzzleFor("fortress", { surface: { 28: 1 } }));
    assert.equal(fortress.cellRelations.filter((clue) => clue.relation === "fortress").length, 2);
});

test("validates Little Killer, unordered outside, extrema, diagonal, and multiplication rules", function() {
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );
    const row = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    const constraints = {
        outsideRelations: [
            { relation: "little killer", value: 12, cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }] },
            { relation: "product little killer", value: 35, cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }] },
            { relation: "descriptivepairs", value: 51, cells: row },
            { relation: "outside", clues: [4, 5, 3], cells: row.slice(0, 3) },
            { relation: "outside234", clues: [6, 3, 4], cells: row.slice(1, 4) },
            { relation: "maximin", value: 2, cells: row },
            { relation: "minimax", value: 8, cells: row }
        ],
        catalogLines: [{ relation: "creasing", path: [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }] }],
        edgeRelations: [
            { relation: "diagonalConsecutive", cells: [{ row: 0, col: 1 }, { row: 1, col: 2 }] },
            { relation: "notDiagonalConsecutive", cells: [{ row: 0, col: 2 }, { row: 1, col: 3 }] }
        ],
        cellRelations: [{ relation: "multiplication",
            top: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            bottom: [{ row: 1, col: 3 }, { row: 1, col: 5 }] }]
    };

    assert.equal(SudokuCSP.solve(solved, constraints).solved, true);
    assert.equal(SudokuCSP.solve(solved, {
        outsideRelations: [{ relation: "descriptivepairs", value: 52, cells: row }]
    }).solved, false);
    assert.equal(SudokuCSP.solve(solved, {
        edgeRelations: [{ relation: "notDiagonalConsecutive", cells: constraints.edgeRelations[0].cells }]
    }).solved, false);
});

test("normalizes the new outside, no-bulb, intersection, and cage inputs", function() {
    function puzzle(variant, options = {}) {
        const nx0 = options.nx0 || 13;
        const inset = options.inset === undefined ? 2 : options.inset;
        return {
            nx0, ny0: nx0, space: options.space || [0, 0, 0, 0],
            activeSudokuVariant: variant,
            centerlist: Array.from({ length: 9 }, (_, row) =>
                Array.from({ length: 9 }, (__, col) => (row + inset) * nx0 + col + inset)).flat(),
            point: options.point || {},
            pu_q: { number: {}, numberS: {}, symbol: {}, wall: {}, thermo: [], nobulbthermo: [],
                killercages: [], ...(options.pu_q || {}) }
        };
    }

    ["descriptivepairs", "maximin", "minimax"].forEach(function(variant) {
        const constraints = SudokuSolver.readConstraints(puzzle(variant, { pu_q: { number: { 15: [51, 1, "1"] } } }));
        assert.equal(constraints.outsideRelations[0].relation, variant);
    });

    ["outside", "outside234"].forEach(function(variant) {
        const constraints = SudokuSolver.readConstraints(puzzle(variant, {
            nx0: 19, inset: 5, space: [3, 3, 3, 3],
            pu_q: { number: { 81: [5, 1, "1"], 62: [3, 1, "1"], 43: [4, 1, "1"] } }
        }));
        assert.deepEqual(constraints.outsideRelations[0].clues, [5, 3, 4]);
        assert.equal(constraints.outsideRelations[0].cells.length, 3);
    });

    ["little killer", "product little killer"].forEach(function(variant) {
        [
            [6, "arrow_B_G", 2],
            [[0, 0, 0, 0, 0, 1, 0, 0], "arrow_eight", 2]
        ].forEach(function(arrow) {
            const constraints = SudokuSolver.readConstraints(puzzle(variant, { pu_q: {
                number: { 14: [50, 1, "1"] }, symbol: { 14: arrow }
            } }));
            assert.equal(constraints.outsideRelations[0].relation, variant);
            assert.deepEqual(constraints.outsideRelations[0].cells.slice(0, 2),
                [{ row: 0, col: 0 }, { row: 1, col: 1 }]);
        });
    });

    const creasing = SudokuSolver.readConstraints(puzzle("creasing", {
        pu_q: { nobulbthermo: [[28, 29, 30]] }
    }));
    assert.equal(creasing.catalogLines[0].relation, "creasing");
    assert.equal(creasing.thermos.length, 0);

    const cornerPoint = { 300: { neighbor: [28, 29, 41, 42] } };
    const diagonal = SudokuSolver.readConstraints(puzzle("diagonallyconsecutive", {
        point: cornerPoint, pu_q: { symbol: { 300: [[1, 1], "diagonal_consecutive", 2] } }
    }));
    assert.equal(diagonal.edgeRelations.filter((clue) => clue.relation === "diagonalConsecutive").length, 2);
    assert.equal(diagonal.edgeRelations.filter((clue) => clue.relation === "notDiagonalConsecutive").length, 126);

    const multiplication = SudokuSolver.readConstraints(puzzle("multiplication", {
        pu_q: { killercages: [[28, 29, 41, 42]] }
    }));
    assert.equal(multiplication.cellRelations[0].relation, "multiplication");
    assert.deepEqual(multiplication.cellRelations[0].top.map((cell) => ({ row: cell.row, col: cell.col })),
        [{ row: 0, col: 0 }, { row: 0, col: 1 }]);
});

test("validates parity sandwiches, clocks, XIVI, slots, wheels, Pinnochio, and Sum Detector", function() {
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );
    const firstRow = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    const firstColumn = Array.from({ length: 9 }, (_, row) => ({ row, col: 0 }));
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "evensandwich", cells: firstRow, clues: [7] },
        { relation: "oddsandwich", cells: firstRow, clues: [8] }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "evensandwich", cells: firstRow, clues: [] }
    ] }).solved, false, "a blank margin forbids sandwiched digits");
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "before1", value: 42, cells: firstRow },
        { relation: "after9", value: 3, cells: firstRow }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "after9", value: 4, cells: firstRow }
    ] }).solved, false);

    assert.equal(SudokuCSP.solve(solved, { cellRelations: [
        { relation: "clock", cells: [3, 4, 5, 6].map((col) => ({ row: 1, col })) },
        { relation: "slotmachine", columns: [firstColumn, firstColumn] },
        { relation: "wheel", cells: [0, 1, 2, 3].map((col) => ({ row: 0, col })), digits: [4, 6, 5, 3] },
        { relation: "pinnochio", clues: [
            { cell: { row: 0, col: 0 }, value: 5 }, { cell: { row: 0, col: 1 }, value: 9 }
        ] }
    ] }).solved, true);

    assert.equal(SudokuCSP.solve(solved, { xv: [
        { cells: [{ row: 0, col: 2 }, { row: 1, col: 2 }], kind: "VI", family: "xivi" },
        { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }], kind: "XI", family: "xivi" },
        { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], kind: "none", family: "xivi" }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { directionalMarks: [{
        relation: "sumdetector", origin: { row: 0, col: 5 },
        rays: [[{ row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }]]
    }] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { sumDetectorGroups: [{ clues: [
        { origin: { row: 0, col: 5 }, rays: [[{ row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }]] },
        { origin: { row: 0, col: 6 }, rays: [[{ row: 1, col: 5 }, { row: 2, col: 4 }]] }
    ] }] }).solved, false, "Sum Detector rejects arrows that individually require n=3 and n=2");
});

test("normalizes supplied and blank Even Sandwich sightlines", function() {
    const nx0 = 16;
    const start = 5;
    const centerlist = Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (__, col) => start + col + (start + row) * nx0)).flat();
    const puzzle = {
        nx: 12, ny: 12, nx0, ny0: 16, space: [3, 0, 3, 0],
        activeSudokuVariant: "evensandwich", centerlist, point: {},
        pu_q: { number: {
            84: [4, 1, "1"], 85: [2, 1, "1"], 86: [4, 1, "1"], 87: [6, 1, "1"]
        }, numberS: {}, symbol: {}, surface: {}, killercages: [] }
    };
    const constraints = SudokuSolver.readConstraints(puzzle);
    assert.equal(constraints.outsideRelations.length, 18);
    assert.deepEqual(constraints.outsideRelations.filter((clue) => clue.clues.length).map((clue) => clue.clues), [[4]]);
});

test("reads Fortress shading and the two Before 1 After 9 margin layers", function() {
    const nx0 = 15;
    const centerlist = Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (__, col) => 4 + col + (4 + row) * nx0)).flat();
    const fortress = SudokuSolver.readConstraints({
        nx0, ny0: 15, space: [2, 0, 2, 0], activeSudokuVariant: "fortress", centerlist, point: {},
        pu_q: { number: {}, numberS: {}, symbol: {}, surface: { 64: 1 }, killercages: [] }
    });
    assert.equal(fortress.cellRelations.filter((clue) => clue.relation === "fortress").length, 2);
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );
    assert.equal(SudokuCSP.solve(solved, fortress).solved, false,
        "the shaded r1c1 is not larger than its unshaded r2c1 neighbor");

    const outside = SudokuSolver.readConstraints({
        nx0, ny0: 15, space: [2, 0, 2, 0], activeSudokuVariant: "before1after9", centerlist, point: {},
        pu_q: { number: {
            49: [3, 1, "1"], 63: [3, 1, "1"],
            34: [42, 1, "1"], 62: [42, 1, "1"]
        }, numberS: {}, symbol: {}, surface: {}, killercages: [] }
    });
    assert.deepEqual(outside.outsideRelations.map((clue) => [clue.relation, clue.value]),
        [["after9", 3], ["after9", 3], ["before1", 42], ["before1", 42]]);
});

test("Extra Region reads orthogonally connected shading and ignores cages", function() {
    const puzzle = {
        nx: 9, ny: 9, nx0: 13, space: [0, 0, 0, 0],
        activeSudokuVariants: ["classic", "extraregions"],
        centerlist: [28, 29, 56], point: {},
        refreshKillerCages: function() { return [[28, 29, 56]]; },
        pu_q: { line: {}, number: {}, numberS: {}, symbol: {}, surface: { 28: 1, 29: 1, 56: 1 } }
    };

    const constraints = SudokuSolver.readConstraints(puzzle);
    assert.deepEqual(constraints.regionAllDifferent.map(function(region) {
        return region.map(function(cell) { return [cell.row, cell.col]; });
    }), [[[0, 0], [0, 1]], [[2, 2]]]);
    assert.equal(constraints.killers.length, 0);
});

test("validates the new line, pair, cross, detector, and edge relations", function() {
    const solution = boardFromString(
        "534678912" +
        "672195348" +
        "198342567" +
        "859761423" +
        "426853791" +
        "713924856" +
        "961537284" +
        "287419635" +
        "345286179"
    );
    const cell = function(row, col) { return { row: row, col: col }; };
    const crossCells = [cell(0, 0), cell(0, 1), cell(1, 0), cell(0, 2)];
    const constraints = {
        catalogLines: [
            { relation: "alternatingstripes", path: [cell(0, 0), cell(0, 1), cell(0, 2)] },
            { relation: "between", path: [cell(0, 0), cell(0, 2), cell(0, 1)] }
        ],
        cellRelations: [
            { relation: "clonedstrands", strands: [[cell(0, 0), cell(0, 1)], [cell(1, 5), cell(1, 6)]] },
            { relation: "codedpairs", pairs: [[cell(0, 0), cell(0, 1)], [cell(1, 5), cell(1, 6)]] }
        ],
        quadRelations: [
            { relation: "crosssums", cells: crossCells },
            { relation: "determinant", cells: crossCells, total: 2 }
        ],
        directionalMarks: [{
            relation: "detection", origin: cell(0, 0),
            rays: [[cell(1, 5)]],
            allDiagonalRays: [[cell(1, 5)], [cell(0, 1)]]
        }],
        edgeRelations: [
            { relation: "divisor", cells: [cell(0, 0), cell(0, 1)], target: 53 },
            { relation: "eitheror", cells: [cell(0, 0), cell(0, 1)], target: 3 },
            { relation: "blocksumrelations", groups: [[cell(0, 0), cell(0, 1)], [cell(1, 0), cell(1, 1)]], sign: "<", cells: [cell(0, 0), cell(0, 1)] }
        ]
    };

    assert.equal(SudokuCSP.solve(solution, constraints).solved, true);
    assert.equal(SudokuCSP.solve(solution, {
        catalogLines: [{ relation: "alternatingstripes", path: [cell(0, 0), cell(0, 1), cell(0, 7)] }]
    }).solved, false);
    assert.equal(SudokuCSP.solve(solution, {
        edgeRelations: [{ relation: "eitheror", cells: [cell(0, 0), cell(0, 1)], target: 9 }]
    }).solved, false);
});

test("Full Rank compares complete n-digit row and column numbers", function() {
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );
    const first = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    const second = Array.from({ length: 9 }, (_, col) => ({ row: 1, col }));
    assert.equal(SudokuCSP.solve(solved, { fullRankGroups: [[
        { rank: 1, cells: first }, { rank: 2, cells: second }
    ]] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { fullRankGroups: [[
        { rank: 2, cells: first }, { rank: 1, cells: second }
    ]] }).solved, false);
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

test("validates new variants: bouncing x-sums, czech outsider, diagonal sum is nine, diagonal tens, disparity, distances", function() {
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );

    // 1. bouncing x-sums
    // First cell is r0c0 = 5. The bouncing diagonal path of length 5 starting at r0c0 going (1,1):
    // r0c0 (5) -> r1c1 (7) -> r2c2 (8) -> r3c3 (7) -> r4c4 (5).
    // Sum is 5+7+8+7+5 = 32.
    // If we specify a bouncing x-sums clue of 32 at r0c0 going (1,1):
    const bouncingClue = { relation: "bouncing x-sums", value: 32, cells: [
        { row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }, { row: 4, col: 4 }
    ] };
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [bouncingClue] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [{ ...bouncingClue, value: 33 }] }).solved, false);

    // 2. czech outsider
    // The diagonal has cells: r0c0 (5), r1c1 (7), r2c2 (8).
    // If the outside clue is 578:
    const czechClue = { relation: "czech outsider", value: 578, cells: [
        { row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }
    ] };
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [czechClue] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [{ ...czechClue, value: 55 }] }).solved, false); // needs two 5s

    // 3. diagonal sum is nine / diagonal tens
    // Diagonal pair: r0c1 (3) and r1c2 (2) -> sum is 5 (not 9 or 10).
    // Diagonal pair: r0c1 (3) and r1c0 (6) -> sum is 9.
    // Diagonal pair: r1c1 (7) and r2c0 (1) -> sum is 8 (not 9 or 10).
    assert.equal(SudokuCSP.solve(solved, { edgeRelations: [
        { relation: "notDiagonalSumIsNine", cells: [{ row: 0, col: 1 }, { row: 1, col: 2 }] },
        { relation: "diagonalSumIsNine", cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }] }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { edgeRelations: [
        { relation: "diagonalSumIsNine", cells: [{ row: 0, col: 1 }, { row: 1, col: 2 }] }
    ] }).solved, false);

    assert.equal(SudokuCSP.solve(solved, { edgeRelations: [
        { relation: "notDiagonalTens", cells: [{ row: 0, col: 1 }, { row: 1, col: 2 }] }
    ] }).solved, true);
    // r0c0 (5) and r1c1 (7) -> sum is 12 (not 10).
    // r1c1 (7) and r2c2 (8) -> sum is 15 (not 10).
    // Let's find a pair summing to 10: r0c4 (7) and r1c5 (3) -> sum is 10.
    assert.equal(SudokuCSP.solve(solved, { edgeRelations: [
        { relation: "diagonalTens", cells: [{ row: 0, col: 4 }, { row: 1, col: 5 }] }
    ] }).solved, true);

    // 4. disparity
    // Check if disparity works
    assert.equal(SudokuCSP.registeredConstraints().includes("disparity"), true);
    // If we place 1 and 2 (opposite parity):
    assert.equal(SudokuCSP.solve([[1, 2, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]], {
        disparity: [[{ row: 0, col: 0 }, { row: 0, col: 1 }]]
    }).solved, true);
    // If we place 1 and 3 (same parity):
    assert.equal(SudokuCSP.solve([[1, 3, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]], {
        disparity: [[{ row: 0, col: 0 }, { row: 0, col: 1 }]]
    }).solved, false);

    // 5. distances
    // First row: 5 3 4 6 7 8 9 1 2.
    // Clue "3-7:2" (3 is at index 1, 7 is at index 4, distance is 4-1 = 3).
    // Clue "5-9:6" (5 is at index 0, 9 is at index 6, distance is 6-0 = 6).
    const row = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    const distanceClue = { relation: "distances", value: { x: 5, y: 9, z: 6 }, cells: row };
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [distanceClue] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [{ ...distanceClue, value: { x: 5, y: 9, z: 5 } }] }).solved, false);
});

test("validates new variants: faded kropki, first seen odd/even, max ascending, fives, frame-diagonal, odd labyrinth, even passage, equal sum line, german whispers, factor lines", function() {
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );

    // 1. faded kropki
    // r0c0 (5) and r0c1 (3): not consecutive and not 1:2 ratio.
    // r0c1 (3) and r0c2 (4): consecutive.
    // r0c2 (4) and r0c3 (6): not consecutive, but 1:2 ratio? No (4 and 6). Wait, r1c2 (2) and r2c2 (8)? No.
    // Let's find 1:2 ratio: r0c1 (3) and r0c5 (8)? No. r0c1 (3) and r1c1 (7)? No.
    // Let's find any 1:2 ratio in solved: r0c0 (5), r0c3 (6), r0c7 (1), r0c8 (2) -> r0c7 (1) and r0c8 (2) have 1:2 ratio.
    assert.equal(SudokuCSP.solve(solved, { fadedKropki: [
        { cells: [{ row: 0, col: 1 }, { row: 0, col: 2 }], kind: "white" },
        { cells: [{ row: 0, col: 7 }, { row: 0, col: 8 }], kind: "white" }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { fadedKropki: [
        { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], kind: "white" }
    ] }).solved, false);

    // 2. first seen odd/even
    // Row 0: 5 3 4 6 7 8 9 1 2.
    // First odd is 5 (at index 0). Clue is 5.
    // First even is 4 (at index 2). Clue is 4.
    const row0 = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "firstseenoddeven", value: 5, cells: row0 },
        { relation: "firstseenoddeven", value: 4, cells: row0 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "firstseenoddeven", value: 3, cells: row0 }
    ] }).solved, false);

    // 3. max ascending
    // Row 0: 5 3 4 6 7 8 9 1 2.
    // Strictly increasing runs:
    // [5], [3, 4, 6, 7, 8, 9] (length 6), [1, 2] (length 2).
    // Longest is 6.
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "maxascending", value: 6, cells: row0 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "maxascending", value: 5, cells: row0 }
    ] }).solved, false);

    // 4. fives
    // r0c0 (5) and r0c1 (3): sum = 8, diff = 2.
    // r0c1 (3) and r0c2 (4): sum = 7, diff = 1.
    // Let's find a pair summing to 5 or differing by 5:
    // r0c0 (5) and r1c0 (6): diff = 1, sum = 11.
    // r0c1 (3) and r0c2 (4): sum = 7.
    // r0c1 (3) and r1c1 (7): diff = 4.
    // r0c2 (4) and r0c8 (2) -> not adjacent.
    // r0c6 (9) and r0c7 (1) -> diff = 8.
    // Let's find a sum/diff 5 pair: r0c0 (5) and r0c2 (4) -> not adjacent.
    // r0c1 (3) and r0c0 (5) -> diff 2.
    // What about r0c1 (3) and r0c2 (4)?
    // What about r0c6 (9) and r1c6 (3)? No.
    // What about r0c0 (5) and r0c7 (1) -> no.
    // Let's look at r0c8 (2) and r1c8 (8) -> diff 6.
    // Let's find a pair manually:
    // r0c1 is 3, r1c1 is 7.
    // r0c2 is 4, r0c3 is 6.
    // r0c3 is 6, r0c4 is 7.
    // r0c4 is 7, r0c5 is 8.
    // r0c5 is 8, r0c6 is 9.
    // r0c7 is 1, r0c8 is 2.
    // r1c0 is 6, r1c1 is 7.
    // r1c1 is 7, r1c2 is 2 -> diff is 5! Yes!
    assert.equal(SudokuCSP.solve(solved, { edgeRelations: [
        { relation: "fives", cells: [{ row: 1, col: 1 }, { row: 1, col: 2 }], marked: true }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { edgeRelations: [
        { relation: "fives", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], marked: true }
    ] }).solved, false);

    // 5. frame-diagonal
    // cells: r0c0 (5), r1c1 (7), r2c2 (8) -> sum of first 3 is 20.
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "framediagonal", value: 20, cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }] }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "framediagonal", value: 21, cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }] }
    ] }).solved, false);

    // 6. odd labyrinth & even passage
    // oddLabyrinth connectivity check.
    // Let's use a 3x3 board where we have odd path:
    // [ [1, 2, 3],
    //   [4, 5, 6],
    //   [7, 8, 9] ]
    // odd cells path from (0,0) to (2,2):
    // 1 (0,0) -> 5 (1,1)? No, path must be orthogonal.
    // Orthogonal: 1 (0,0) -> no adjacent odd cell because (0,1) is 2, (1,0) is 4.
    // So no orthogonal odd path.
    // Let's construct a small valid 2x2 board:
    // [ [1, 3],
    //   [2, 5] ]
    // Odd path from (0,0) to (1,1): 1 -> 3 -> 5. Valid.
    assert.equal(SudokuCSP.solve([[1, 3], [2, 5]], { oddLabyrinth: [true], baseBoxes: false }).solved, true);
    assert.equal(SudokuCSP.solve([[1, 2], [4, 5]], { oddLabyrinth: [true], baseBoxes: false }).solved, false);

    // even passage
    // [ [2, 1],
    //   [4, 3] ] -> even path from (0,0) to (1,1): 2 -> 4? Wait, (1,1) is 3 (odd). So invalid.
    // [ [2, 4],
    //   [1, 6] ] -> even path from (0,0) to (1,1): 2 -> 4 -> 6. Valid.
    assert.equal(SudokuCSP.solve([[2, 4], [1, 6]], { evenPassage: [true], baseBoxes: false }).solved, true);
    assert.equal(SudokuCSP.solve([[2, 1], [1, 6]], { evenPassage: [true], baseBoxes: false }).solved, false);

    // 7. equal sum line
    // path: (0,0) [5] and (0,1) [3] (in box 0, sum 8) and (0,3) [6] and (0,4) [7]? No.
    // Let's check 3x3 boxes in solved:
    // Box 0: r0c0 (5), r0c1 (3) -> sum 8.
    // Box 1: r0c3 (6), r0c4 (7) -> sum 13.
    // Let's find segments that sum to the same total:
    // Box 0: r0c0 (5), r0c1 (3) -> sum 8.
    // Box 1: r0c3 (6), r0c7 (1)? No, (0,7) is in Box 2.
    // Box 1: r0c3 (6), r1c3 (1), r1c4 (9)? No.
    // Let's construct a simple 4x4 board test. Box size is 2x2.
    // [ [1, 2, 3, 4],
    //   [3, 4, 1, 2],
    //   [2, 1, 4, 3],
    //   [4, 3, 2, 1] ]
    // Path: (0,0) [1] and (0,1) [2] (in Box 0, sum 3) and (0,2) [3] (in Box 1, sum 3).
    // Sums: Box 0 segment = 1+2 = 3, Box 1 segment = 3. Both sum to 3. Valid!
    const board4 = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
    assert.equal(SudokuCSP.solve(board4, { catalogLines: [
        { relation: "equalsumline", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] }
    ], baseBoxes: false }).solved, true);
    // If we make path (0,0) and (0,1) and (0,3) [4]: Box 0 sum = 3, Box 1 sum = 4. Invalid!
    assert.equal(SudokuCSP.solve(board4, { catalogLines: [
        { relation: "equalsumline", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 3 }] }
    ], baseBoxes: false }).solved, false);

    // 8. german whispers
    // diff >= 5
    // path: r0c0 (5) and r0c7 (1) -> not adjacent.
    // r0c0 (5) and r1c0 (6) -> diff 1.
    // Let's find adjacent cells with diff >= 5:
    // r0c7 (1) and r0c6 (9) -> diff 8. Valid.
    assert.equal(SudokuCSP.solve(solved, { catalogLines: [
        { relation: "germanwhispers", path: [{ row: 0, col: 6 }, { row: 0, col: 7 }] }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { catalogLines: [
        { relation: "germanwhispers", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }
    ] }).solved, false);

    // 9. factor lines
    // factor or multiple
    // r0c1 (3) and r0c2 (4) -> not.
    // r0c1 (3) and r0c6 (9) -> not adjacent.
    // r0c6 (9) and r0c7 (1) -> 9 is multiple of 1. Valid.
    // r0c7 (1) and r0c8 (2) -> 2 is multiple of 1. Valid.
    assert.equal(SudokuCSP.solve(solved, { catalogLines: [
        { relation: "factorlines", path: [{ row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }] }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { catalogLines: [
        { relation: "factorlines", path: [{ row: 0, col: 0 }, { row: 0, col: 1 }] }
    ] }).solved, false);
});

test("validates new variants: inner frame sum, missing digit, next to 9, outside consecutive, outside greater than, outside killer, parity skyscrapers, pointing differents", function() {
    const solved = boardFromString(
        "534678912" + "672195348" + "198342567" +
        "859761423" + "426853791" + "713924856" +
        "961537284" + "287419635" + "345286179"
    );
    const firstRow = Array.from({ length: 9 }, (_, col) => ({ row: 0, col }));
    const secondRow = Array.from({ length: 9 }, (_, col) => ({ row: 1, col }));
    
    // 1. inner frame sum: cells 2,3,4 of firstRow (3, 4, 6) sum to 13
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "innerframesum", cells: firstRow, value: 13 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "innerframesum", cells: firstRow, value: 14 }
    ] }).solved, false);
    
    // 2. missing digit: 7 and 8 are missing from first three cells of firstRow (5, 3, 4)
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "missingdigit", cells: firstRow, value: 78 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "missingdigit", cells: firstRow, value: 75 }
    ] }).solved, false);
    
    // 3. next to 9: in firstRow, 9 is at index 6. Immediate neighbors are 8 and 1.
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "nextto9", cells: firstRow, value: 18 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "nextto9", cells: firstRow, value: 19 }
    ] }).solved, false);
    
    // 4. outside consecutive: in secondRow (6,7,2,1,9,5,3,4,8), consecutive adjacent pairs are (6,7), (2,1), (3,4). Count = 3.
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "outsideconsecutive", cells: secondRow, value: 3 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "outsideconsecutive", cells: secondRow, value: 4 }
    ] }).solved, false);
    
    // 5. outside greater than: in secondRow (6,7,2,1,9,5,3,4,8), pairs where cells[i] > cells[i+1] are (7,2), (2,1), (9,5), (5,3). Count = 4.
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "outsidegreaterthan", cells: secondRow, value: 4 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "outsidegreaterthan", cells: secondRow, value: 3 }
    ] }).solved, false);
    
    // 6. outside killer: in secondRow, adjacent pairs sum to 13 (6+7), 9 (7+2), 3 (2+1), 10 (1+9), 14 (9+5), 8 (5+3), 7 (3+4), 12 (4+8).
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "outsidekiller", cells: secondRow, value: 13 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "outsidekiller", cells: secondRow, value: 20 }
    ] }).solved, false);
    
    // 7. parity skyscrapers: in secondRow (6,7,2,1,9,5,3,4,8), visible skyscrapers from left are 6, 7, 9. Odd visible = 2 (7, 9). Even visible = 1 (6).
    // Clue can be either 2 (odd visible count) or 1 (even visible count)
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "parityskyscrapers", cells: secondRow, value: 2 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "parityskyscrapers", cells: secondRow, value: 1 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "parityskyscrapers", cells: secondRow, value: 3 }
    ] }).solved, false);
    
    // 8. pointing differents: distinct values in firstRow = 9.
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "pointingdifferents", cells: firstRow, value: 9 }
    ] }).solved, true);
    assert.equal(SudokuCSP.solve(solved, { outsideRelations: [
        { relation: "pointingdifferents", cells: firstRow, value: 8 }
    ] }).solved, false);
});
