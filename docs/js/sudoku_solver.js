var SudokuCSPRuntime = typeof SudokuCSP !== "undefined" ? SudokuCSP :
    (typeof require === "function" ? require("./sudoku_csp.js") : null);

var SudokuSolver = (function() {
    var SIZE = 9;
    var TEST_BOARD_URL = "https://swaroopg92.github.io/penpa-edit/#m=edit&p=7Vbvb+I4EP3OX3Hy17W0sU2cH9J+oL9WqtpeuW231yJUpRAKbSC7IbRVKv73nZmYi2Ponm6lk3rSCTCP5/i9mbEzYbka548rHsFLhdzjAl4q9OgTdvHtmdfFrMzS+DfeW5XTvADA+e9HR3ySZMuUH18/7B089p4Pe39+9G+UujybfHg46F8+jK++ir43+1h4Z1m4OD0/2Ms+fK5uTqe9p/Qw1efLfDTN0mScVDdXxy/Z4ii8n07E/vF0P5wkC2/5PbyInvb6nz51BiaQYee1iuKqz6vP8YAJxpmEj2BDXvXj1+o0ZnVOjFdf4ALGxZCz+SorZ6M8ywu24aqTerkEeNjAK5pHtF+TwgN8ZjDAa4CjWTHK0tuTmjmPB9UFZxjBHq1GyOb5U4pmGCH+HuXzuxkSd0kJlVxOZ98YVzBhwt04rHnV+5U8QGqTB8I6D0Q78sD0/t08ouF6DRv1B2RyGw8wqcsGhg38Er/CeBa/MhltSlDvJlMCCdjcvwgfCdUQXboisgiNhG8RARKhRZBLtyF8ErUJV8N3A9OeY6tDJzBNS6zQA3Kx4oiU4xLREt0QwiMbKzLhkU9gM7TK0hVCOtZCuFZCuEUQkippu0vSsVdJqqWVtlBbyoqusSNU7QhhswVt+TWNF3AKeKVoPKDRo9Gn8YSuOYTDIULNBZZIgkoUcYlpAoZvLiUUF7H0uVRQIsTQzKQPSSH2BZe6W2Pd5TKAIBEHAZcRFBlxBC3Pg3RQPwR9z+h7oC+MvgB9afQl6OPxQ9wFfd/o+6Cvjb4G/dDoQzuVuOfkpcALThnpYPyGlwqw0ZGgY+clN9drwEZfgr4dD95BhCF+ZXwV+OKNRPFgHUxeGny18dXga9dHG18Nvtr4avC188IjTxh88bQTBt8AfWHTrmjr9mns0qhpSwO87f9RY/i1E/O3IQygYviws1/++2KGnQE87Ngyz26Xq2KSjNLb9CUZlSyuH7r2TItbrOZ3KTwhLCrL82/ZbLFLYTPVImf3i7xId04hmY7v35LCqR1Sd3kxdmJ6TrKsncv3VVK0F9dPqBZVFvD4sX4nRZE/t5h5Uk5bhPWoaimlC6eYZdIOMXlMHLd5U451h70w+gzgDuLB//9M/jP/THDTvPfQht5DCHSu8+InTaaZdOkdrQbYn3Qba3YX/0ZjsWZdfquLYLDbjQTYHb0EWLedALXdUYDcairAvdFXUNVtLRiV213QaqvBoJXdYwbDzg8=";
    var candidateCache = {
        signature: null,
        result: null,
        pendingSignature: null,
        generation: 0
    };
    var analysisTimer = null;

    function solverLogElements() {
        return {
            status: document.getElementById("sudoku-solver-status"),
            inlineStatus: document.getElementById("sudoku-auto-inline-status"),
            progress: document.getElementById("sudoku-solver-progress"),
            output: document.getElementById("sudoku-solver-log-output"),
            panel: document.getElementById("sudoku-solver-log")
        };
    }

    function setSolverStatus(elements, value) {
        if (elements.status) {
            elements.status.textContent = value;
        }
        if (elements.inlineStatus) {
            elements.inlineStatus.textContent = value;
        }
    }

    function resetSolverLog(message) {
        var elements = solverLogElements();
        setSolverStatus(elements, "Running");
        if (elements.progress) {
            elements.progress.max = 1;
            elements.progress.value = 0;
        }
        if (elements.output) {
            elements.output.textContent = "[" + new Date().toLocaleTimeString() + "] " + message + "\n";
        }
    }

    function appendSolverLog(event) {
        var elements = solverLogElements();
        if (elements.progress && event.total) {
            elements.progress.max = event.total;
            elements.progress.value = event.tested || 0;
        }
        if (event.type === "done") {
            setSolverStatus(elements, event.unique ? "Complete · unique" : "Complete · multiple solutions");
        } else if (event.type === "invalid" || event.type === "unsatisfiable") {
            setSolverStatus(elements, "No solution");
        } else if (event.type === "cancelled") {
            setSolverStatus(elements, "Restarting");
        }
        if (elements.output && event.message) {
            var line = "[" + new Date().toLocaleTimeString() + "] " + event.message;
            var lines = (elements.output.textContent + line + "\n").split("\n");
            elements.output.textContent = lines.slice(Math.max(0, lines.length - 121)).join("\n");
            elements.output.scrollTop = elements.output.scrollHeight;
        }
    }

    function requestCandidateAnalysis(puzzle, board, constraints, signature) {
        var generation = ++candidateCache.generation;
        var startedAt = Date.now();
        candidateCache.pendingSignature = signature;
        resetSolverLog("Starting exact candidate analysis. This does not trust local pencil marks.");
        SudokuCSPRuntime.getCandidatesAsync(board, constraints, {
            isCancelled: function() {
                return generation !== candidateCache.generation || !window.SudokuTools.autoEnabled;
            },
            onProgress: function(event) {
                if (generation === candidateCache.generation) {
                    var elements = solverLogElements();
                    if (elements.progress && event.total) {
                        elements.progress.max = event.total;
                        elements.progress.value = event.tested || 0;
                    }
                    if (event.type === "done" || event.type === "invalid" ||
                        event.type === "unsatisfiable" || event.type === "cancelled") {
                        appendSolverLog(Object.assign({}, event, {
                            message: event.message + " Total runtime: " +
                                ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
                        }));
                    }
                }
            }
        }).then(function(result) {
            if (generation !== candidateCache.generation || result.cancelled) {
                return;
            }
            candidateCache.pendingSignature = null;
            candidateCache.signature = signature;
            candidateCache.result = result;
            puzzle.redraw();
        }).catch(function(error) {
            if (generation !== candidateCache.generation) {
                return;
            }
            candidateCache.pendingSignature = null;
            appendSolverLog({
                type: "invalid",
                message: "Solver stopped: " + error.message + " Total runtime: " +
                    ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
            });
        });
    }

    function cancelCandidateAnalysis() {
        candidateCache.generation++;
        candidateCache.pendingSignature = null;
        if (analysisTimer !== null) {
            clearTimeout(analysisTimer);
            analysisTimer = null;
        }
        var elements = solverLogElements();
        setSolverStatus(elements, "Idle");
    }

    function isClassicSudoku(puzzle) {
        var supportedGrid = puzzle && (puzzle.gridtype === "sudoku" || puzzle.gridtype === "square");
        var noWhitespace = !puzzle || !puzzle.space || puzzle.space.slice(0, 4).every(function(value) {
            return Number(value) === 0;
        });
        return supportedGrid && puzzle.nx === SIZE && puzzle.ny === SIZE && noWhitespace;
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

    function readBoard(puzzle, includeSolution) {
        includeSolution = includeSolution !== false;
        var board = [];
        for (var row = 0; row < SIZE; row++) {
            board[row] = [];
            for (var col = 0; col < SIZE; col++) {
                var key = cellKey(puzzle, row, col);
                board[row][col] = digitFromEntry(puzzle.pu_q.number[key]) ||
                    (includeSolution ? digitFromEntry(puzzle.pu_a.number[key]) : 0) || 0;
            }
        }
        return board;
    }

    function keyToCell(puzzle, key) {
        var col = (key % puzzle.nx0) - 2;
        var row = ((key / puzzle.nx0) | 0) - 2;
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) {
            return null;
        }
        return { row: row, col: col, key: key };
    }

    function pathToCells(puzzle, path) {
        var cells = [];
        if (!Array.isArray(path)) {
            return cells;
        }
        for (var i = 0; i < path.length; i++) {
            var cell = keyToCell(puzzle, path[i]);
            if (cell) {
                cells.push(cell);
            }
        }
        return cells;
    }

    function readKillerTotal(puzzle, cage) {
        for (var i = 0; i < cage.length; i++) {
            var base = cage[i] + puzzle.nx0 * puzzle.ny0;
            for (var corner = 0; corner < 4; corner++) {
                var entry = puzzle.pu_q.numberS[4 * base + corner];
                if (entry && entry[0] !== undefined && entry[0] !== null) {
                    var total = parseInt(entry[0].toString().replace(/\s+/g, ""), 10);
                    if (total > 0) {
                        return total;
                    }
                }
            }
        }
        return 0;
    }

    function readConstraints(puzzle) {
        var constraints = {
            thermos: [],
            arrows: [],
            killers: [],
            kropki: [],
            supported: ["classic"]
        };
        if (!puzzle || !puzzle.pu_q) {
            return constraints;
        }

        [["thermo", "thermos"], ["nobulbthermo", "thermos"]].forEach(function(names) {
            var source = puzzle.pu_q[names[0]] || [];
            for (var i = 0; i < source.length; i++) {
                var cells = pathToCells(puzzle, source[i]);
                if (cells.length > 1) {
                    constraints[names[1]].push(cells);
                }
            }
        });
        if (constraints.thermos.length) {
            constraints.supported.push("thermo");
        }

        var arrows = puzzle.pu_q.arrows || [];
        for (var a = 0; a < arrows.length; a++) {
            var arrowCells = pathToCells(puzzle, arrows[a]);
            if (arrowCells.length > 1) {
                constraints.arrows.push({ circle: arrowCells[0], shaft: arrowCells.slice(1) });
            }
        }
        if (constraints.arrows.length) {
            constraints.supported.push("arrow");
        }

        var cages = puzzle.pu_q.killercages || [];
        for (var k = 0; k < cages.length; k++) {
            var cageCells = pathToCells(puzzle, cages[k]);
            if (cageCells.length) {
                constraints.killers.push({ cells: cageCells, total: readKillerTotal(puzzle, cages[k]) });
            }
        }
        if (constraints.killers.length) {
            constraints.supported.push("killer");
        }

        var symbols = puzzle.pu_q.symbol || {};
        var activeCells = {};
        (puzzle.centerlist || []).forEach(function(key) {
            activeCells[key] = true;
        });
        Object.keys(symbols).forEach(function(key) {
            var entry = symbols[key];
            var point = puzzle.point && puzzle.point[key];
            if (!entry || entry[1] !== "circle_SS" || (entry[0] !== 1 && entry[0] !== 2) || !point) {
                return;
            }
            var cells = (point.neighbor || []).filter(function(neighbor) {
                return activeCells[neighbor];
            }).map(function(neighbor) {
                return keyToCell(puzzle, neighbor);
            }).filter(Boolean);
            if (cells.length === 2) {
                constraints.kropki.push({
                    cells: cells,
                    kind: entry[0] === 2 ? "black" : "white"
                });
            }
        });
        if (constraints.kropki.length) {
            constraints.supported.push("kropki");
        }

        // The optional negative Kropki rule makes every undotted orthogonal pair
        // neither consecutive nor double. Explicit dots apply independently.
        if (puzzle.activeSudokuVariant === "kropki" && puzzle.kropkiNegativeConstraint === true) {
            var dottedEdges = {};
            constraints.kropki.forEach(function(dot) {
                var first = dot.cells[0].row * SIZE + dot.cells[0].col;
                var second = dot.cells[1].row * SIZE + dot.cells[1].col;
                dottedEdges[Math.min(first, second) + ":" + Math.max(first, second)] = true;
            });
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    [[row + 1, col], [row, col + 1]].forEach(function(neighbor) {
                        if (neighbor[0] >= SIZE || neighbor[1] >= SIZE) {
                            return;
                        }
                        var first = row * SIZE + col;
                        var second = neighbor[0] * SIZE + neighbor[1];
                        var edge = Math.min(first, second) + ":" + Math.max(first, second);
                        if (!dottedEdges[edge]) {
                            constraints.kropki.push({
                                cells: [
                                    { row: row, col: col },
                                    { row: neighbor[0], col: neighbor[1] }
                                ],
                                kind: "none"
                            });
                        }
                    });
                }
            }
        }
        return constraints;
    }

    function getCandidates(board, constraints) {
        return SudokuCSPRuntime.getCandidates(board, constraints);
    }

    function solve(board, constraints) {
        return SudokuCSPRuntime.solve(board, constraints);
    }

    function currentDigit(puzzle, key) {
        if (puzzle.mode.qa === "pu_a" && digitFromEntry(puzzle.pu_q.number[key])) {
            return digitFromEntry(puzzle.pu_q.number[key]);
        }
        return digitFromEntry(puzzle[puzzle.mode.qa].number[key]);
    }

    function enterSolutionSudokuMode(puzzle) {
        puzzle.mode.pu_a.edit_mode = "sudoku";
        puzzle.mode.pu_a.sudoku[0] = "1";
        puzzle.mode.pu_a.sudoku[1] = 9;
        if (puzzle.mode.qa !== "pu_a") {
            puzzle.mode_qa("pu_a");
        } else {
            puzzle.mode_set("sudoku", "new", true);
        }
    }

    function applySolution(puzzle, solvedBoard) {
        var changes = [];
        var oldQa = puzzle.mode.qa;
        puzzle.mode.qa = "pu_a";
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var key = cellKey(puzzle, row, col);
                var digit = solvedBoard[row][col];
                if (digit && currentDigit(puzzle, key) !== digit) {
                    changes.push({ key: key, value: [digit.toString(), 9, "1"] });
                }
            }
        }
        puzzle.mode.qa = oldQa;
        if (!changes.length) {
            enterSolutionSudokuMode(puzzle);
            puzzle.redraw();
            return 0;
        }
        enterSolutionSudokuMode(puzzle);
        puzzle.undoredo_counter++;
        for (var i = 0; i < changes.length; i++) {
            puzzle.set_value("number", changes[i].key, changes[i].value);
        }
        puzzle.redraw();
        return changes.length;
    }

    function clearAutoSolution(puzzle) {
        if (!puzzle || !puzzle.pu_a || !puzzle.pu_a.number) {
            return 0;
        }
        var keys = Object.keys(puzzle.pu_a.number).filter(function(key) {
            var entry = puzzle.pu_a.number[key];
            return entry && entry[1] === 9 && entry[2] === "1";
        });
        if (!keys.length) {
            return 0;
        }
        enterSolutionSudokuMode(puzzle);
        puzzle.undoredo_counter++;
        for (var i = 0; i < keys.length; i++) {
            puzzle.remove_value("number", keys[i]);
        }
        puzzle.redraw();
        return keys.length;
    }

    function drawAutoCandidates(puzzle) {
        if (!window.SudokuTools || !window.SudokuTools.autoEnabled) {
            return;
        }
        if (!isClassicSudoku(puzzle)) {
            var incompatible = solverLogElements();
            setSolverStatus(incompatible, "Unsupported grid");
            if (incompatible.output && incompatible.output.textContent.indexOf("requires a 9x9") === -1) {
                incompatible.output.textContent += "Auto Solver requires a 9x9 Sudoku or square grid without outside whitespace.\n";
            }
            return;
        }
        var board = readBoard(puzzle, puzzle.mode && puzzle.mode.qa === "pu_a");
        var constraints = readConstraints(puzzle);
        var signature = JSON.stringify([board, constraints]);
        if (candidateCache.signature !== signature) {
            return;
        }
        var result = candidateCache.result;
        if (!result.valid || !result.satisfiable) {
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
                if (values.length === 1) {
                    set_font_style(puzzle.ctx, 0.72 * puzzle.size.toString(10), 3);
                    puzzle.ctx.text(values[0].toString(), point.x, point.y + (0.02 * puzzle.size));
                    set_font_style(puzzle.ctx, 0.3 * puzzle.size.toString(10), 3);
                    continue;
                }
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

    function scheduleAutoAnalysis(puzzle) {
        if (!window.SudokuTools || !window.SudokuTools.autoEnabled || !puzzle) {
            return;
        }
        if (analysisTimer !== null) {
            clearTimeout(analysisTimer);
        }
        analysisTimer = setTimeout(function() {
            analysisTimer = null;
            startAutoAnalysis(puzzle);
        }, 0);
    }

    function onPuzzleRedraw(puzzle) {
        scheduleAutoAnalysis(puzzle);
    }

    function startAutoAnalysis(puzzle) {
        if (!isClassicSudoku(puzzle)) {
            drawAutoCandidates(puzzle);
            return false;
        }
        var board = readBoard(puzzle, puzzle.mode && puzzle.mode.qa === "pu_a");
        var constraints = readConstraints(puzzle);
        var signature = JSON.stringify([board, constraints]);
        if (candidateCache.signature === signature) {
            return true;
        }
        if (candidateCache.pendingSignature !== signature) {
            requestCandidateAnalysis(puzzle, board, constraints, signature);
        }
        return true;
    }

    return {
        SIZE: SIZE,
        TEST_BOARD_URL: TEST_BOARD_URL,
        isClassicSudoku: isClassicSudoku,
        cellKey: cellKey,
        digitFromEntry: digitFromEntry,
        readBoard: readBoard,
        readConstraints: readConstraints,
        getCandidates: getCandidates,
        solve: solve,
        applySolution: applySolution,
        clearAutoSolution: clearAutoSolution,
        startAutoAnalysis: startAutoAnalysis,
        scheduleAutoAnalysis: scheduleAutoAnalysis,
        onPuzzleRedraw: onPuzzleRedraw,
        drawAutoCandidates: drawAutoCandidates
    };
})();

var SudokuTools = (function() {
    var initialized = false;

    function byId(id) {
        return document.getElementById(id);
    }

    function setToolbarState() {
        var autoButton = byId("sudoku_auto_solver");
        var logPanel = byId("sudoku-solver-log");
        var inlineStatus = byId("sudoku-auto-inline-status");
        if (autoButton) {
            autoButton.classList.toggle("active", SudokuTools.autoEnabled);
            autoButton.classList.toggle("auto-solver-active", SudokuTools.autoEnabled);
            autoButton.setAttribute("aria-pressed", SudokuTools.autoEnabled ? "true" : "false");
        }
        if (logPanel) {
            logPanel.style.display = "block";
        }
        if (inlineStatus) {
            inlineStatus.style.display = SudokuTools.autoEnabled ? "inline-block" : "none";
        }
        document.body.classList.toggle("sudoku-solver-mode", SudokuTools.autoEnabled);
        renderVariantTools();
    }

    function toggleAuto() {
        SudokuTools.autoEnabled = !SudokuTools.autoEnabled;
        if (!SudokuTools.autoEnabled) {
            cancelCandidateAnalysis();
        } else {
            candidateCache.signature = null;
        }
        setToolbarState();
        if (SudokuTools.autoEnabled && pu) {
            SudokuSolver.scheduleAutoAnalysis(pu);
        }
        if (pu) {
            pu.redraw();
        }
    }

    function loadTestBoard() {
        var input = byId("urlstring");
        if (input) {
            input.value = SudokuSolver.TEST_BOARD_URL;
        }
        if (typeof import_url === "function") {
            import_url(SudokuSolver.TEST_BOARD_URL);
        }
    }

    function modeLabel(mode, submode) {
        var labels = {
            sudoku: "Sudoku",
            symbol: submode === "circle_SS" ? "Kropki Dot" : "Mark",
            special: submode === "arrows" ? "Arrow" : submode === "thermo" ? "Thermo" : "Special",
            line: "Line",
            lineE: "Edge",
            cage: "Cage",
            number: submode === "11" ? "Killer Sum" : "Clue",
            surface: "Cell",
            combi: "Composite"
        };
        return labels[mode] || mode;
    }

    function selectedVariant() {
        var select = byId("constraints_settings_opt");
        return select && select.value ? select.value : "classic";
    }

    function updateVariantActive() {
        var toolbar = byId("sudoku-variant-tools");
        if (!toolbar || !pu || !pu.mode || !pu.mode[pu.mode.qa]) {
            return;
        }
        Array.prototype.forEach.call(toolbar.querySelectorAll(".sudoku-variant-mode"), function(button) {
            var mode = pu.mode[pu.mode.qa].edit_mode;
            var submode = pu.mode[pu.mode.qa][mode] ? pu.mode[pu.mode.qa][mode][0] : "";
            button.classList.toggle("active", button.dataset.mode === mode &&
                (button.dataset.submode === "" || button.dataset.submode === submode));
        });
    }

    function updateKropkiNegativeControl() {
        var button = byId("sudoku_kropki_negative");
        if (!button) {
            return;
        }
        var currentMode = pu && pu.mode && pu.mode[pu.mode.qa];
        var isKropki = selectedVariant() === "kropki" && currentMode &&
            currentMode.edit_mode === "symbol" && currentMode.symbol[0] === "circle_SS";
        var enabled = !!(pu && pu.kropkiNegativeConstraint === true);
        button.hidden = !isKropki;
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Kropki: " + (enabled ? "ON" : "OFF");
    }

    function toggleKropkiNegative() {
        var currentMode = pu && pu.mode && pu.mode[pu.mode.qa];
        if (!currentMode || selectedVariant() !== "kropki" ||
            currentMode.edit_mode !== "symbol" || currentMode.symbol[0] !== "circle_SS") {
            return;
        }
        pu.kropkiNegativeConstraint = pu.kropkiNegativeConstraint !== true;
        candidateCache.generation++;
        candidateCache.signature = null;
        candidateCache.pendingSignature = null;
        updateKropkiNegativeControl();
        pu.redraw();
    }

    function applyMode(mode, submode, style) {
        if (!pu || !pu.mode || !pu.mode[pu.mode.qa] || !pu.mode[pu.mode.qa][mode]) {
            return;
        }
        if (submode !== "") {
            pu.mode[pu.mode.qa][mode][0] = submode;
        }
        if (mode === "symbol") {
            // Variant symbols are foreground clues by default.
            pu.mode[pu.mode.qa][mode][1] = 2;
        } else if (style !== "") {
            pu.mode[pu.mode.qa][mode][1] = style;
        }
        pu.activeSudokuVariant = selectedVariant();
        pu.kropki_mode = pu.activeSudokuVariant === "kropki";
        pu.mode_set(mode);
        if (mode !== "sudoku") {
            // Compact variant tools should not open Penpa's input panel automatically.
            UserSettings.panel_shown = false;
        }
        pu.type = pu.type_set();
        updateVariantActive();
        updateKropkiNegativeControl();
    }

    function renderVariantTools() {
        var toolbar = byId("sudoku-variant-tools");
        if (!toolbar || typeof penpa_constraints === "undefined") {
            return;
        }
        var variant = selectedVariant();
        var setting = penpa_constraints.setting[variant] || penpa_constraints.setting.classic;
        var modes = [{ mode: "sudoku", submode: "1", style: "" }];
        for (var i = 0; i < setting.modeset.length; i++) {
            if (setting.modeset[i] !== "sudoku") {
                modes.push({
                    mode: setting.modeset[i],
                    submode: setting.submodeset[i],
                    style: setting.styleset[i]
                });
            }
        }
        toolbar.innerHTML = "";
        modes.forEach(function(tool) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "button sudoku-tool-button sudoku-variant-mode";
            button.dataset.mode = tool.mode;
            button.dataset.submode = tool.submode;
            button.textContent = modeLabel(tool.mode, tool.submode);
            button.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                applyMode(tool.mode, tool.submode, tool.style);
            });
            toolbar.appendChild(button);
        });
        if (pu) {
            pu.activeSudokuVariant = variant;
            pu.kropki_mode = variant === "kropki";
            if (typeof pu.kropkiNegativeConstraint !== "boolean") {
                pu.kropkiNegativeConstraint = false;
            }
            pu.type = pu.type_set();
        }
        updateVariantActive();
        updateKropkiNegativeControl();
    }

    function variantChanged() {
        renderVariantTools();
        applyMode("sudoku", "1", "");
    }

    function init() {
        if (initialized) {
            setToolbarState();
            return;
        }
        initialized = true;
        var actions = {
            sudoku_undo: function() { pu.undo(); },
            sudoku_redo: function() { pu.redo(); },
            sudoku_keypad: function() {
                UserSettings.panel_shown = !UserSettings.panel_shown;
            },
            sudoku_auto_solver: toggleAuto,
            sudoku_load_test_board: loadTestBoard,
            sudoku_kropki_negative: toggleKropkiNegative
        };
        Object.keys(actions).forEach(function(id) {
            var element = byId(id);
            if (element) {
                element.addEventListener("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    actions[id]();
                });
            }
        });
        setToolbarState();
    }

    return {
        autoEnabled: false,
        init: init,
        setToolbarState: setToolbarState,
        renderVariantTools: renderVariantTools,
        variantChanged: variantChanged
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuSolver;
}
