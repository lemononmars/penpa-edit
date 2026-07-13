var SudokuSolver = (function() {
    var SIZE = 9;
    var ALL = 0x3FE;

    function isClassicSudoku(puzzle) {
        return puzzle && puzzle.gridtype === "sudoku" && puzzle.nx === SIZE && puzzle.ny === SIZE &&
            puzzle.space && puzzle.space[0] === 0 && puzzle.space[1] === 0 &&
            puzzle.space[2] === 0 && puzzle.space[3] === 0;
    }

    function cellKey(puzzle, row, col) {
        return (col + 2) + ((row + 2) * puzzle.nx0);
    }

    function digitFromEntry(entry) {
        if (!entry) {
            return 0;
        }
        if (entry[2] === "1") {
            var value = parseInt(entry[0], 10);
            return value >= 1 && value <= 9 ? value : 0;
        }
        if (entry[2] === "7" && Array.isArray(entry[0])) {
            var digit = 0;
            var count = 0;
            for (var i = 0; i < SIZE; i++) {
                if (entry[0][i] === 1) {
                    digit = i + 1;
                    count++;
                }
            }
            return count === 1 ? digit : 0;
        }
        return 0;
    }

    function readBoard(puzzle) {
        var board = [];
        for (var row = 0; row < SIZE; row++) {
            board[row] = [];
            for (var col = 0; col < SIZE; col++) {
                var key = cellKey(puzzle, row, col);
                board[row][col] = digitFromEntry(puzzle.pu_q.number[key]) ||
                    digitFromEntry(puzzle.pu_a.number[key]) || 0;
            }
        }
        return board;
    }

    function masksFromBoard(board) {
        var rows = new Array(SIZE).fill(0);
        var cols = new Array(SIZE).fill(0);
        var boxes = new Array(SIZE).fill(0);
        var valid = true;

        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var digit = board[row][col];
                if (digit < 1 || digit > 9) {
                    continue;
                }
                var bit = 1 << digit;
                var box = ((row / 3) | 0) * 3 + ((col / 3) | 0);
                if ((rows[row] & bit) || (cols[col] & bit) || (boxes[box] & bit)) {
                    valid = false;
                }
                rows[row] |= bit;
                cols[col] |= bit;
                boxes[box] |= bit;
            }
        }
        return { rows: rows, cols: cols, boxes: boxes, valid: valid };
    }

    function maskToDigits(mask) {
        var digits = [];
        for (var digit = 1; digit <= SIZE; digit++) {
            if (mask & (1 << digit)) {
                digits.push(digit);
            }
        }
        return digits;
    }

    function countBits(mask) {
        var count = 0;
        while (mask) {
            mask &= mask - 1;
            count++;
        }
        return count;
    }

    function candidateMask(masks, row, col) {
        var box = ((row / 3) | 0) * 3 + ((col / 3) | 0);
        return ALL & ~(masks.rows[row] | masks.cols[col] | masks.boxes[box]);
    }

    function getCandidates(board) {
        var masks = masksFromBoard(board);
        var candidates = [];
        if (!masks.valid) {
            return { valid: false, candidates: candidates };
        }
        for (var row = 0; row < SIZE; row++) {
            candidates[row] = [];
            for (var col = 0; col < SIZE; col++) {
                candidates[row][col] = board[row][col] ? [] : maskToDigits(candidateMask(masks, row, col));
            }
        }
        return { valid: true, candidates: candidates };
    }

    function solve(board) {
        var work = board.map(function(row) { return row.slice(); });
        var masks = masksFromBoard(work);
        if (!masks.valid) {
            return { solved: false, reason: "The grid has conflicting givens." };
        }

        function search() {
            var bestRow = -1;
            var bestCol = -1;
            var bestMask = 0;
            var bestCount = 10;

            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    if (work[row][col]) {
                        continue;
                    }
                    var mask = candidateMask(masks, row, col);
                    var count = countBits(mask);
                    if (count === 0) {
                        return false;
                    }
                    if (count < bestCount) {
                        bestRow = row;
                        bestCol = col;
                        bestMask = mask;
                        bestCount = count;
                    }
                }
            }

            if (bestRow === -1) {
                return true;
            }

            var box = ((bestRow / 3) | 0) * 3 + ((bestCol / 3) | 0);
            for (var digit = 1; digit <= SIZE; digit++) {
                var bit = 1 << digit;
                if (!(bestMask & bit)) {
                    continue;
                }
                work[bestRow][bestCol] = digit;
                masks.rows[bestRow] |= bit;
                masks.cols[bestCol] |= bit;
                masks.boxes[box] |= bit;
                if (search()) {
                    return true;
                }
                work[bestRow][bestCol] = 0;
                masks.rows[bestRow] &= ~bit;
                masks.cols[bestCol] &= ~bit;
                masks.boxes[box] &= ~bit;
            }
            return false;
        }

        return search() ? { solved: true, board: work } : { solved: false, reason: "No classic Sudoku solution exists." };
    }

    function currentDigit(puzzle, key) {
        if (puzzle.mode.qa === "pu_a" && digitFromEntry(puzzle.pu_q.number[key])) {
            return digitFromEntry(puzzle.pu_q.number[key]);
        }
        return digitFromEntry(puzzle[puzzle.mode.qa].number[key]);
    }

    function applySolution(puzzle, solvedBoard) {
        var changed = 0;
        puzzle.undoredo_counter++;
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var key = cellKey(puzzle, row, col);
                var digit = solvedBoard[row][col];
                if (digit && currentDigit(puzzle, key) !== digit) {
                    puzzle.set_value("number", key, [digit.toString(), 1, "1"]);
                    changed++;
                }
            }
        }
        puzzle.redraw();
        return changed;
    }

    function drawAutoCandidates(puzzle) {
        if (!window.SudokuTools || !window.SudokuTools.autoEnabled || !isClassicSudoku(puzzle)) {
            return;
        }
        var board = readBoard(puzzle);
        var result = getCandidates(board);
        if (!result.valid) {
            return;
        }
        set_font_style(puzzle.ctx, 0.3 * puzzle.size.toString(10), 3);
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (board[row][col]) {
                    continue;
                }
                var key = cellKey(puzzle, row, col);
                var point = puzzle.point[key];
                var values = result.candidates[row][col];
                for (var i = 0; i < values.length; i++) {
                    var digit = values[i];
                    var index = digit - 1;
                    puzzle.ctx.text(
                        digit.toString(),
                        point.x + ((index % 3 - 1) * 0.28) * puzzle.size,
                        point.y + ((((index / 3) | 0) - 1) * 0.28 + 0.02) * puzzle.size
                    );
                }
            }
        }
    }

    return {
        SIZE: SIZE,
        isClassicSudoku: isClassicSudoku,
        cellKey: cellKey,
        digitFromEntry: digitFromEntry,
        readBoard: readBoard,
        getCandidates: getCandidates,
        solve: solve,
        applySolution: applySolution,
        drawAutoCandidates: drawAutoCandidates
    };
})();

var SudokuTools = (function() {
    var initialized = false;

    function byId(id) {
        return document.getElementById(id);
    }

    function clickExisting(id) {
        var element = byId(id);
        if (element) {
            element.click();
        }
    }

    function setToolbarState() {
        var toolbar = byId("sudoku-toolbar");
        var autoButton = byId("sudoku_auto_solver");
        if (toolbar) {
            toolbar.style.display = pu && pu.gridtype === "sudoku" ? "flex" : "none";
        }
        if (autoButton) {
            autoButton.classList.toggle("active", SudokuTools.autoEnabled);
            autoButton.setAttribute("aria-pressed", SudokuTools.autoEnabled ? "true" : "false");
        }
    }

    function zoom(delta) {
        if (!pu) {
            return;
        }
        var next = Math.max(12, Math.min(90, parseInt(UserSettings.displaysize, 10) + delta));
        UserSettings.displaysize = next;
        if (byId("nb_size3")) {
            byId("nb_size3").value = next;
        }
        if (byId("nb_size3_r")) {
            byId("nb_size3_r").value = next;
        }
        pu.size = next;
        pu.canvasxy_update();
        pu.canvas_size_setting();
        pu.point_move((pu.canvasx * 0.5 - pu.point[pu.center_n].x + 0.5), (pu.canvasy * 0.5 - pu.point[pu.center_n].y + 0.5), pu.theta);
        pu.redraw();
    }

    function solveCurrent() {
        if (!SudokuSolver.isClassicSudoku(pu)) {
            infoMsg("Classic Sudoku solver supports the default 9x9 Sudoku grid.");
            return;
        }
        var result = SudokuSolver.solve(SudokuSolver.readBoard(pu));
        if (!result.solved) {
            errorMsg(result.reason);
            return;
        }
        SudokuSolver.applySolution(pu, result.board);
    }

    function toggleAuto() {
        SudokuTools.autoEnabled = !SudokuTools.autoEnabled;
        setToolbarState();
        if (pu) {
            pu.redraw();
        }
    }

    function init() {
        if (initialized) {
            setToolbarState();
            return;
        }
        initialized = true;
        var actions = {
            sudoku_new: function() { clickExisting("newboard"); },
            sudoku_load: function() { clickExisting("input_url"); },
            sudoku_save: function() { clickExisting("savetext"); },
            sudoku_export: function() { clickExisting("saveimage"); },
            sudoku_undo: function() { clickExisting("tb_undo"); },
            sudoku_redo: function() { clickExisting("tb_redo"); },
            sudoku_zoom_in: function() { zoom(4); },
            sudoku_zoom_out: function() { zoom(-4); },
            sudoku_keypad: function() {
                panel_toggle();
                panel_onoff();
            },
            sudoku_solve: solveCurrent,
            sudoku_auto_solver: toggleAuto
        };
        Object.keys(actions).forEach(function(id) {
            var element = byId(id);
            if (element) {
                element.addEventListener("click", function(event) {
                    event.preventDefault();
                    actions[id]();
                });
            }
        });
        setToolbarState();
    }

    return {
        autoEnabled: false,
        init: init,
        setToolbarState: setToolbarState
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuSolver;
}
