var SudokuCSPRuntime = typeof SudokuCSP !== "undefined" ? SudokuCSP :
    (typeof require === "function" ? require("./sudoku_csp.js") : null);

var SudokuSolver = (function() {
    var SIZE = 9;
    var AUTO_RUN_LIMIT_MS = 60000;
    var TEST_BOARD_URL = "https://swaroopg92.github.io/penpa-edit/#m=edit&p=7Vbvb+I4EP3OX3Hy17W0sU2cH9J+oL9WqtpeuW231yJUpRAKbSC7IbRVKv73nZmYi2Ponm6lk3rSCTCP5/i9mbEzYbka548rHsFLhdzjAl4q9OgTdvHtmdfFrMzS+DfeW5XTvADA+e9HR3ySZMuUH18/7B089p4Pe39+9G+UujybfHg46F8+jK++ir43+1h4Z1m4OD0/2Ms+fK5uTqe9p/Qw1efLfDTN0mScVDdXxy/Z4ii8n07E/vF0P5wkC2/5PbyInvb6nz51BiaQYee1iuKqz6vP8YAJxpmEj2BDXvXj1+o0ZnVOjFdf4ALGxZCz+SorZ6M8ywu24aqTerkEeNjAK5pHtF+TwgN8ZjDAa4CjWTHK0tuTmjmPB9UFZxjBHq1GyOb5U4pmGCH+HuXzuxkSd0kJlVxOZ98YVzBhwt04rHnV+5U8QGqTB8I6D0Q78sD0/t08ouF6DRv1B2RyGw8wqcsGhg38Er/CeBa/MhltSlDvJlMCCdjcvwgfCdUQXboisgiNhG8RARKhRZBLtyF8ErUJV8N3A9OeY6tDJzBNS6zQA3Kx4oiU4xLREt0QwiMbKzLhkU9gM7TK0hVCOtZCuFZCuEUQkippu0vSsVdJqqWVtlBbyoqusSNU7QhhswVt+TWNF3AKeKVoPKDRo9Gn8YSuOYTDIULNBZZIgkoUcYlpAoZvLiUUF7H0uVRQIsTQzKQPSSH2BZe6W2Pd5TKAIBEHAZcRFBlxBC3Pg3RQPwR9z+h7oC+MvgB9afQl6OPxQ9wFfd/o+6Cvjb4G/dDoQzuVuOfkpcALThnpYPyGlwqw0ZGgY+clN9drwEZfgr4dD95BhCF+ZXwV+OKNRPFgHUxeGny18dXga9dHG18Nvtr4avC188IjTxh88bQTBt8AfWHTrmjr9mns0qhpSwO87f9RY/i1E/O3IQygYviws1/++2KGnQE87Ngyz26Xq2KSjNLb9CUZlSyuH7r2TItbrOZ3KTwhLCrL82/ZbLFLYTPVImf3i7xId04hmY7v35LCqR1Sd3kxdmJ6TrKsncv3VVK0F9dPqBZVFvD4sX4nRZE/t5h5Uk5bhPWoaimlC6eYZdIOMXlMHLd5U451h70w+gzgDuLB//9M/jP/THDTvPfQht5DCHSu8+InTaaZdOkdrQbYn3Qba3YX/0ZjsWZdfquLYLDbjQTYHb0EWLedALXdUYDcairAvdFXUNVtLRiV213QaqvBoJXdYwbDzg8=";
    var candidateCache = {
        signature: null,
        result: null,
        pendingSignature: null,
        generation: 0,
        board: null,
        constraintsSignature: null,
        witnesses: []
    };
    var analysisTimer = null;
    var activeAnalysisAbort = null;

    function setSolverRunning(running) {
        if (typeof document === "undefined") return;
        document.body.classList.toggle("sudoku-solver-running", running);
        var button = document.getElementById("sudoku_auto_solver");
        if (button) {
            button.title = running ? "Abort Auto Solver" : "Auto Solver";
            button.setAttribute("aria-label", button.title);
            var icon = button.querySelector("i");
            if (icon) icon.className = running ? "fa fa-stop" : "fa fa-magic";
        }
    }

    function puzzleSize(puzzle) {
        if (!puzzle) return SIZE;
        var horizontalSpace = Number(puzzle.space && puzzle.space[2] || 0) +
            Number(puzzle.space && puzzle.space[3] || 0);
        var verticalSpace = Number(puzzle.space && puzzle.space[0] || 0) +
            Number(puzzle.space && puzzle.space[1] || 0);
        var width = Number(puzzle.nx) - horizontalSpace;
        var height = Number(puzzle.ny) - verticalSpace;
        return width === height && (width === 6 || width === 9) ? width : 0;
    }

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
        setSolverRunning(true);
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
        } else if (event.type === "timeout") {
            setSolverStatus(elements, "Stopped · 60 s limit");
        }
        if (elements.output && event.message) {
            var line = "[" + new Date().toLocaleTimeString() + "] " + event.message;
            var lines = (elements.output.textContent + line + "\n").split("\n");
            elements.output.textContent = lines.slice(Math.max(0, lines.length - 121)).join("\n");
            elements.output.scrollTop = elements.output.scrollHeight;
        }
    }

    function requestCandidateAnalysis(puzzle, board, constraints, signature, constraintsSignature, seedSolutions) {
        if (activeAnalysisAbort) activeAnalysisAbort();
        var generation = ++candidateCache.generation;
        var startedAt = Date.now();
        var timedOut = false;
        var timeoutId = null;
        candidateCache.pendingSignature = signature;
        resetSolverLog(seedSolutions.length ?
            "Continuing exact candidate analysis from " + seedSolutions.length +
                " compatible cached witness" + (seedSolutions.length === 1 ? "." : "es.") :
            "Starting exact candidate analysis. This does not trust local pencil marks.");
        var analysisOptions = {
            seedSolutions: seedSolutions,
            isCancelled: function() {
                if (Date.now() - startedAt >= AUTO_RUN_LIMIT_MS) {
                    timedOut = true;
                }
                return generation !== candidateCache.generation ||
                    !window.SudokuTools.autoEnabled || timedOut;
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
                        setSolverRunning(false);
                        var terminalEvent = timedOut && event.type === "cancelled" ? "timeout" : event.type;
                        appendSolverLog(Object.assign({}, event, {
                            type: terminalEvent,
                            message: (timedOut ? "Solver stopped at the 60-second limit." : event.message) +
                                " Total runtime: " +
                                ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
                        }));
                    }
                }
            }
        };

        function runAnalysis() {
            if (typeof Worker === "undefined") {
                return SudokuCSPRuntime.getCandidatesAsync(board, constraints, analysisOptions);
            }
            return new Promise(function(resolve, reject) {
                var worker = new Worker("./js/sudoku_solver_worker.js?v=3.3.15");
                var settled = false;
                function finish(result, error) {
                    if (settled) return;
                    settled = true;
                    worker.terminate();
                    if (activeAnalysisAbort === abort) activeAnalysisAbort = null;
                    if (error) reject(error);
                    else resolve(result);
                }
                function abort() {
                    finish({ cancelled: true });
                }
                activeAnalysisAbort = abort;
                worker.onmessage = function(event) {
                    if (event.data.type === "progress") {
                        analysisOptions.onProgress(event.data.progress);
                    } else if (event.data.type === "result") {
                        finish(event.data.result);
                    } else if (event.data.type === "error") {
                        finish(null, new Error(event.data.message));
                    }
                };
                worker.onerror = function(event) {
                    finish(null, new Error(event.message || "CSP worker failed."));
                };
                worker.postMessage({
                    type: "analyze",
                    board: board,
                    constraints: constraints,
                    seedSolutions: seedSolutions
                });
            });
        }

        timeoutId = setTimeout(function() {
            if (generation !== candidateCache.generation) return;
            timedOut = true;
            if (activeAnalysisAbort) activeAnalysisAbort();
            setSolverRunning(false);
            appendSolverLog({
                type: "timeout",
                message: "Solver stopped at the 60-second limit. Total runtime: " +
                    ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
            });
        }, AUTO_RUN_LIMIT_MS);

        runAnalysis().then(function(result) {
            clearTimeout(timeoutId);
            if (generation !== candidateCache.generation) {
                return;
            }
            if (result.cancelled) {
                candidateCache.pendingSignature = null;
                if (timedOut && window.SudokuTools) {
                    window.SudokuTools.autoEnabled = false;
                    window.SudokuTools.setToolbarState();
                    puzzle.redraw();
                }
                return;
            }
            candidateCache.pendingSignature = null;
            candidateCache.signature = signature;
            candidateCache.result = result;
            candidateCache.board = board.map(function(row) { return row.slice(); });
            candidateCache.constraintsSignature = constraintsSignature;
            candidateCache.witnesses = result.witnessSolutions || [];
            setSolverRunning(false);
            puzzle.redraw();
        }).catch(function(error) {
            clearTimeout(timeoutId);
            if (generation !== candidateCache.generation) {
                return;
            }
            candidateCache.pendingSignature = null;
            setSolverRunning(false);
            appendSolverLog({
                type: "invalid",
                message: "Solver stopped: " + error.message + " Total runtime: " +
                    ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
            });
        });
    }

    function cancelCandidateAnalysis() {
        candidateCache.generation++;
        if (activeAnalysisAbort) activeAnalysisAbort();
        activeAnalysisAbort = null;
        candidateCache.pendingSignature = null;
        if (analysisTimer !== null) {
            clearTimeout(analysisTimer);
            analysisTimer = null;
        }
        var elements = solverLogElements();
        setSolverStatus(elements, "Idle");
        setSolverRunning(false);
    }

    function invalidateCandidateAnalysis() {
        candidateCache.generation++;
        candidateCache.signature = null;
        candidateCache.pendingSignature = null;
        candidateCache.result = null;
        candidateCache.board = null;
        candidateCache.constraintsSignature = null;
        candidateCache.witnesses = [];
        setSolverRunning(false);
    }

    function isClassicSudoku(puzzle) {
        var supportedGrid = puzzle && (puzzle.gridtype === "sudoku" || puzzle.gridtype === "square");
        return supportedGrid && !!puzzleSize(puzzle);
    }

    function cellKey(puzzle, row, col) {
        var top = Number(puzzle.space && puzzle.space[0] || 0);
        var left = Number(puzzle.space && puzzle.space[2] || 0);
        return (col + 2 + left) + ((row + 2 + top) * puzzle.nx0);
    }

    function digitFromEntry(entry) {
        if (!entry) {
            return 0;
        }
        if (entry[2] === "1") {
            var value = parseInt(entry[0], 10);
            return value >= 1 && value <= SIZE ? value : 0;
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

    function outsideClueFromEntry(entry) {
        if (!entry || entry[2] !== "1") return null;
        var value = parseInt(entry[0], 10);
        return Number.isFinite(value) && value >= 0 ? value : null;
    }

    function readBoard(puzzle, includeSolution) {
        SIZE = puzzleSize(puzzle) || SIZE;
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
        var top = Number(puzzle.space && puzzle.space[0] || 0);
        var left = Number(puzzle.space && puzzle.space[2] || 0);
        var col = (key % puzzle.nx0) - 2 - left;
        var row = ((key / puzzle.nx0) | 0) - 2 - top;
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

    function variantEnabled(puzzle, name) {
        if (!puzzle) {
            return false;
        }
        if (Array.isArray(puzzle.activeSudokuVariants)) {
            return puzzle.activeSudokuVariants.indexOf(name) !== -1;
        }
        return puzzle.activeSudokuVariant === name;
    }

    function readConstraints(puzzle) {
        SIZE = puzzleSize(puzzle) || SIZE;
        var constraints = {
            thermos: [],
            arrows: [],
            killers: [],
            oddEven: [],
            diagonalAllDifferent: [],
            antiDiagonals: [],
            antiKing: [],
            antiKnight: [],
            nonConsecutive: [],
            palindromes: [],
            kropki: [],
            xv: [],
            battenburg: [],
            skyscrapers: [],
            sandwiches: [],
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

        var cages = typeof puzzle.refreshKillerCages === "function" ?
            puzzle.refreshKillerCages("pu_q") : (puzzle.pu_q.killercages || []);
        for (var k = 0; k < cages.length; k++) {
            var cageCells = pathToCells(puzzle, cages[k]);
            if (cageCells.length) {
                constraints.killers.push({ cells: cageCells, total: readKillerTotal(puzzle, cages[k]) });
            }
        }
        if (constraints.killers.length) {
            constraints.supported.push("killer");
        }

        var mainDiagonal = [];
        var reverseDiagonal = [];
        for (var diagonalIndex = 0; diagonalIndex < SIZE; diagonalIndex++) {
            mainDiagonal.push({ row: diagonalIndex, col: diagonalIndex });
            reverseDiagonal.push({ row: diagonalIndex, col: SIZE - 1 - diagonalIndex });
        }
        if (variantEnabled(puzzle, "diagonal")) {
            constraints.diagonalAllDifferent.push(mainDiagonal, reverseDiagonal);
            constraints.supported.push("diagonal");
        }
        if (variantEnabled(puzzle, "anti diagonal")) {
            constraints.antiDiagonals.push(mainDiagonal, reverseDiagonal);
            constraints.supported.push("anti diagonal");
        }

        function addGridPairs(target, offsets) {
            for (var pairRow = 0; pairRow < SIZE; pairRow++) {
                for (var pairCol = 0; pairCol < SIZE; pairCol++) {
                    offsets.forEach(function(offset) {
                        var neighborRow = pairRow + offset[0];
                        var neighborCol = pairCol + offset[1];
                        if (neighborRow >= 0 && neighborRow < SIZE &&
                            neighborCol >= 0 && neighborCol < SIZE) {
                            target.push([
                                { row: pairRow, col: pairCol },
                                { row: neighborRow, col: neighborCol }
                            ]);
                        }
                    });
                }
            }
        }
        if (variantEnabled(puzzle, "anti king")) {
            addGridPairs(constraints.antiKing, [[0, 1], [1, -1], [1, 0], [1, 1]]);
            constraints.supported.push("anti king");
        }
        if (variantEnabled(puzzle, "anti knight")) {
            addGridPairs(constraints.antiKnight, [[1, -2], [1, 2], [2, -1], [2, 1]]);
            constraints.supported.push("anti knight");
        }
        if (variantEnabled(puzzle, "non consecutive")) {
            addGridPairs(constraints.nonConsecutive, [[0, 1], [1, 0]]);
            constraints.supported.push("non consecutive");
        }

        var activeCells = {};
        (puzzle.centerlist || []).forEach(function(key) {
            activeCells[key] = true;
        });

        if (variantEnabled(puzzle, "palindrome")) {
            var adjacency = {};
            Object.keys(puzzle.pu_q.line || {}).forEach(function(edge) {
                if (puzzle.pu_q.line[edge] !== 5) {
                    return;
                }
                var endpoints = edge.split(",").map(Number);
                if (endpoints.length !== 2 || !activeCells[endpoints[0]] || !activeCells[endpoints[1]]) {
                    return;
                }
                (adjacency[endpoints[0]] || (adjacency[endpoints[0]] = [])).push(endpoints[1]);
                (adjacency[endpoints[1]] || (adjacency[endpoints[1]] = [])).push(endpoints[0]);
            });
            var visited = {};
            Object.keys(adjacency).forEach(function(nodeText) {
                if (visited[nodeText]) {
                    return;
                }
                var component = [];
                var queue = [Number(nodeText)];
                visited[nodeText] = true;
                while (queue.length) {
                    var node = queue.shift();
                    component.push(node);
                    (adjacency[node] || []).forEach(function(next) {
                        if (!visited[next]) {
                            visited[next] = true;
                            queue.push(next);
                        }
                    });
                }
                var start = component.find(function(key) { return adjacency[key].length === 1; }) || component[0];
                var ordered = [];
                var previous = null;
                var current = start;
                while (current !== undefined && ordered.length < component.length) {
                    ordered.push(current);
                    var next = (adjacency[current] || []).find(function(key) {
                        return key !== previous && ordered.indexOf(key) === -1;
                    });
                    previous = current;
                    current = next;
                }
                var path = ordered.map(function(key) { return keyToCell(puzzle, key); }).filter(Boolean);
                if (path.length > 1) {
                    constraints.palindromes.push(path);
                }
            });
        }
        if (constraints.palindromes.length) {
            constraints.supported.push("palindrome");
        }

        var symbols = puzzle.pu_q.symbol || {};
        Object.keys(symbols).forEach(function(key) {
            var entry = symbols[key];
            if (!variantEnabled(puzzle, "odd even") || !entry ||
                (entry[1] !== "circle_L" && entry[1] !== "square_L") || !activeCells[key]) {
                return;
            }
            var cell = keyToCell(puzzle, Number(key));
            if (cell) {
                constraints.oddEven.push({
                    cell: cell,
                    parity: entry[1] === "circle_L" ? "odd" : "even"
                });
            }
        });
        if (constraints.oddEven.length) {
            constraints.supported.push("odd even");
        }
        if (variantEnabled(puzzle, "battenburg")) {
            var markedBattenburg = {};
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || entry[1] !== "sudokuetc" || entry[0] !== 1 || !point) {
                    return;
                }
                var cells = (point.neighbor || []).filter(function(neighbor) {
                    return activeCells[neighbor];
                }).map(function(neighbor) {
                    return keyToCell(puzzle, neighbor);
                }).filter(Boolean);
                if (cells.length === 4) {
                    var markKey = cells.map(function(cell) { return cell.row + ":" + cell.col; }).sort().join("|");
                    markedBattenburg[markKey] = true;
                    constraints.battenburg.push({ cells: cells, kind: "marked" });
                }
            });
            if (puzzle.battenburgNegativeConstraint === true) {
                for (var battenburgRow = 0; battenburgRow < SIZE - 1; battenburgRow++) {
                    for (var battenburgCol = 0; battenburgCol < SIZE - 1; battenburgCol++) {
                        var square = [
                            { row: battenburgRow, col: battenburgCol },
                            { row: battenburgRow, col: battenburgCol + 1 },
                            { row: battenburgRow + 1, col: battenburgCol },
                            { row: battenburgRow + 1, col: battenburgCol + 1 }
                        ];
                        var squareKey = square.map(function(cell) { return cell.row + ":" + cell.col; }).sort().join("|");
                        if (!markedBattenburg[squareKey]) {
                            constraints.battenburg.push({ cells: square, kind: "none" });
                        }
                    }
                }
            }
            constraints.supported.push("battenburg");
        }
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
        if (variantEnabled(puzzle, "kropki") && puzzle.kropkiNegativeConstraint === true) {
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

        var numbers = puzzle.pu_q.number || {};
        Object.keys(numbers).forEach(function(key) {
            var entry = numbers[key];
            var point = puzzle.point && puzzle.point[key];
            var kind = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
            if ((kind !== "V" && kind !== "X") || !point) {
                return;
            }
            var cells = (point.neighbor || []).filter(function(neighbor) {
                return activeCells[neighbor];
            }).map(function(neighbor) {
                return keyToCell(puzzle, neighbor);
            }).filter(Boolean);
            if (cells.length === 2) {
                constraints.xv.push({ cells: cells, kind: kind });
            }
        });

        if (variantEnabled(puzzle, "xv") && puzzle.xvNegativeConstraint === true) {
            var markedXVEdges = {};
            constraints.xv.forEach(function(clue) {
                var first = clue.cells[0].row * SIZE + clue.cells[0].col;
                var second = clue.cells[1].row * SIZE + clue.cells[1].col;
                markedXVEdges[Math.min(first, second) + ":" + Math.max(first, second)] = true;
            });
            for (var xvRow = 0; xvRow < SIZE; xvRow++) {
                for (var xvCol = 0; xvCol < SIZE; xvCol++) {
                    [[xvRow + 1, xvCol], [xvRow, xvCol + 1]].forEach(function(neighbor) {
                        if (neighbor[0] >= SIZE || neighbor[1] >= SIZE) {
                            return;
                        }
                        var first = xvRow * SIZE + xvCol;
                        var second = neighbor[0] * SIZE + neighbor[1];
                        var edge = Math.min(first, second) + ":" + Math.max(first, second);
                        if (!markedXVEdges[edge]) {
                            constraints.xv.push({
                                cells: [
                                    { row: xvRow, col: xvCol },
                                    { row: neighbor[0], col: neighbor[1] }
                                ],
                                kind: "none"
                            });
                        }
                    });
                }
            }
        }
        if (constraints.xv.length) {
            constraints.supported.push("xv");
        }
        if (variantEnabled(puzzle, "skyscraper")) {
            var topSpace = Number(puzzle.space && puzzle.space[0] || 0);
            var leftSpace = Number(puzzle.space && puzzle.space[2] || 0);
            var startRow = 2 + topSpace;
            var startCol = 2 + leftSpace;
            function addSkyscraper(key, cells) {
                var clue = digitFromEntry(numbers[key]);
                if (clue) constraints.skyscrapers.push({ clue: clue, cells: cells });
            }
            for (var clueIndex = 0; clueIndex < SIZE; clueIndex++) {
                var column = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: clueIndex }; });
                var rowCells = Array.from({ length: SIZE }, function(_, col) { return { row: clueIndex, col: col }; });
                addSkyscraper((startCol + clueIndex) + (startRow - 1) * puzzle.nx0, column);
                addSkyscraper((startCol + clueIndex) + (startRow + SIZE) * puzzle.nx0, column.slice().reverse());
                addSkyscraper((startCol - 1) + (startRow + clueIndex) * puzzle.nx0, rowCells);
                addSkyscraper((startCol + SIZE) + (startRow + clueIndex) * puzzle.nx0, rowCells.slice().reverse());
            }
            constraints.supported.push("skyscraper");
        }
        if (variantEnabled(puzzle, "sandwich")) {
            var sandwichTop = Number(puzzle.space && puzzle.space[0] || 0);
            var sandwichLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var sandwichStartRow = 2 + sandwichTop;
            var sandwichStartCol = 2 + sandwichLeft;
            function addSandwich(key, cells) {
                var clue = outsideClueFromEntry(numbers[key]);
                if (clue !== null) constraints.sandwiches.push({ clue: clue, cells: cells });
            }
            for (var sandwichIndex = 0; sandwichIndex < SIZE; sandwichIndex++) {
                var sandwichColumn = Array.from({ length: SIZE }, function(_, row) {
                    return { row: row, col: sandwichIndex };
                });
                var sandwichRow = Array.from({ length: SIZE }, function(_, col) {
                    return { row: sandwichIndex, col: col };
                });
                addSandwich((sandwichStartCol + sandwichIndex) +
                    (sandwichStartRow - 1) * puzzle.nx0, sandwichColumn);
                addSandwich((sandwichStartCol + sandwichIndex) +
                    (sandwichStartRow + SIZE) * puzzle.nx0, sandwichColumn);
                addSandwich((sandwichStartCol - 1) +
                    (sandwichStartRow + sandwichIndex) * puzzle.nx0, sandwichRow);
                addSandwich((sandwichStartCol + SIZE) +
                    (sandwichStartRow + sandwichIndex) * puzzle.nx0, sandwichRow);
            }
            constraints.supported.push("sandwich");
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
        SIZE = solvedBoard && solvedBoard.length || puzzleSize(puzzle) || SIZE;
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
                incompatible.output.textContent += "Auto Solver requires a 6x6 or 9x9 Sudoku or square grid.\n";
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
                    set_font_style(puzzle.ctx, 0.7 * puzzle.size.toString(10), 3);
                    // Match Penpa's normal Sudoku baseline exactly.
                    puzzle.ctx.text(values[0].toString(), point.x, point.y + (0.06 * puzzle.size));
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
            if (puzzle.drawing) {
                analysisTimer = null;
                scheduleAutoAnalysis(puzzle);
                return;
            }
            analysisTimer = null;
            startAutoAnalysis(puzzle);
        }, 120);
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
        var constraintsSignature = JSON.stringify(constraints);
        var signature = JSON.stringify([board, constraints]);
        if (candidateCache.signature === signature) {
            return true;
        }
        if (candidateCache.pendingSignature !== signature) {
            var seedSolutions = [];
            if (candidateCache.constraintsSignature === constraintsSignature) {
                seedSolutions = (candidateCache.witnesses || []).filter(function(solution) {
                    for (var row = 0; row < SIZE; row++) {
                        for (var col = 0; col < SIZE; col++) {
                            if (board[row][col] && solution[row][col] !== board[row][col]) {
                                return false;
                            }
                        }
                    }
                    return true;
                });
            }
            requestCandidateAnalysis(
                puzzle, board, constraints, signature, constraintsSignature, seedSolutions
            );
        }
        return true;
    }

    function primeUniqueSolution(puzzle, solution) {
        var board = readBoard(puzzle, false);
        var constraints = readConstraints(puzzle);
        var candidates = solution.map(function(row) {
            return row.map(function(value) { return [value]; });
        });
        candidateCache.signature = JSON.stringify([board, constraints]);
        candidateCache.pendingSignature = null;
        candidateCache.constraintsSignature = JSON.stringify(constraints);
        candidateCache.board = board.map(function(row) { return row.slice(); });
        candidateCache.witnesses = [solution.map(function(row) { return row.slice(); })];
        candidateCache.result = {
            valid: true,
            satisfiable: true,
            unique: true,
            candidates: candidates,
            forced: solution.map(function(row) { return row.slice(); }),
            witnessSolutions: candidateCache.witnesses
        };
    }

    return {
        SIZE: SIZE,
        AUTO_RUN_LIMIT_MS: AUTO_RUN_LIMIT_MS,
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
        drawAutoCandidates: drawAutoCandidates,
        cancelCandidateAnalysis: cancelCandidateAnalysis,
        invalidateCandidateAnalysis: invalidateCandidateAnalysis,
        primeUniqueSolution: primeUniqueSolution
    };
})();

var SudokuTools = (function() {
    var initialized = false;
    var generatorWorker = null;
    var generatorTimeout = null;
    var generatorActiveRequest = null;
    var generatorPausedRequest = null;

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
        if (generatorWorker) {
            pauseGenerator();
            return;
        }
        if (generatorPausedRequest) {
            resumeGenerator();
            return;
        }
        SudokuTools.autoEnabled = !SudokuTools.autoEnabled;
        if (!SudokuTools.autoEnabled) {
            SudokuSolver.cancelCandidateAnalysis();
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

    function generatorLog(status, message, progress) {
        var statusNode = byId("sudoku-solver-status");
        var output = byId("sudoku-solver-log-output");
        var bar = byId("sudoku-solver-progress");
        if (statusNode) statusNode.textContent = status;
        if (output && message) output.textContent = message;
        if (bar && progress) {
            bar.max = progress.total || 1;
            bar.value = progress.attempt || 0;
        }
    }

    function stopGenerator(message) {
        if (generatorWorker) generatorWorker.terminate();
        generatorWorker = null;
        if (generatorTimeout) clearTimeout(generatorTimeout);
        generatorTimeout = null;
        generatorActiveRequest = null;
        generatorPausedRequest = null;
        document.body.classList.remove("sudoku-solver-running");
        var button = byId("sudoku_auto_solver");
        if (button) {
            button.title = "Auto Solver";
            button.setAttribute("aria-label", button.title);
            var icon = button.querySelector("i");
            if (icon) icon.className = "fa fa-magic";
        }
        if (message) generatorLog("Stopped", message);
    }

    function pauseGenerator() {
        if (!generatorWorker || !generatorActiveRequest) return;
        generatorWorker.terminate();
        generatorWorker = null;
        if (generatorTimeout) clearTimeout(generatorTimeout);
        generatorTimeout = null;
        generatorPausedRequest = generatorActiveRequest;
        generatorActiveRequest = null;
        document.body.classList.remove("sudoku-solver-running");
        generatorLog("Paused", "Generation paused. Press the wand again to resume the same seeded run.");
        var button = byId("sudoku_auto_solver");
        if (button) {
            button.title = "Resume generation";
            button.setAttribute("aria-label", button.title);
            var icon = button.querySelector("i");
            if (icon) icon.className = "fa fa-play";
        }
    }

    function resumeGenerator() {
        if (!generatorPausedRequest) return;
        var request = generatorPausedRequest;
        generatorPausedRequest = null;
        generatePuzzle(request.size, request.variants, request.negative, request.sourcePuzzle, request.seed);
    }

    function pauseWork() {
        if (generatorWorker) {
            pauseGenerator();
            return;
        }
        if (SudokuTools.autoEnabled) {
            SudokuTools.autoEnabled = false;
            SudokuSolver.cancelCandidateAnalysis();
            setToolbarState();
            if (pu) pu.redraw();
        }
    }

    function applyGeneratedPuzzle(result) {
        if (!pu || !pu.pu_q) return;
        SudokuTools.autoEnabled = false;
        SudokuSolver.cancelCandidateAnalysis();
        var generatedVariants = result.variants || [result.variant || "classic"];
        if (generatedVariants.indexOf("classic") === -1) generatedVariants.unshift("classic");
        pu.activeSudokuVariants = generatedVariants.slice();
        pu.activeSudokuVariant = generatedVariants[generatedVariants.length - 1];
        SudokuSolver.invalidateCandidateAnalysis();
        if (pu.mode && pu.mode.qa !== "pu_q" && typeof pu.mode_qa === "function") {
            pu.mode_qa("pu_q");
        }
        if (result.preserveExisting) {
            // Remove only playable-cell givens. Outside clues, edge labels,
            // cages, paths, symbols, and every other native Penpa mark remain.
            result.board.forEach(function(row, rowIndex) {
                row.forEach(function(_, colIndex) {
                    delete pu.pu_q.number[SudokuSolver.cellKey(pu, rowIndex, colIndex)];
                });
            });
        } else {
            pu.pu_q.number = {};
            pu.pu_q.symbol = {};
        }
        if (pu.pu_a) {
            pu.pu_a.number = {};
            pu.pu_a.symbol = {};
        }
        if (pu.pu_q_col) {
            pu.pu_q_col.number = {};
            pu.pu_q_col.symbol = {};
        }
        result.board.forEach(function(row, rowIndex) {
            row.forEach(function(digit, colIndex) {
                if (digit) pu.pu_q.number[SudokuSolver.cellKey(pu, rowIndex, colIndex)] = [digit, 1, "1"];
            });
        });
        (!result.preserveExisting ? result.oddEvenMarks || [] : []).forEach(function(mark) {
            var key = SudokuSolver.cellKey(pu, mark.cell.row, mark.cell.col);
            pu.pu_q.symbol[key] = [3, mark.parity === "odd" ? "circle_L" : "square_L", 2];
        });

        function pointForCells(cells) {
            var wanted = cells.map(function(cell) { return SudokuSolver.cellKey(pu, cell.row, cell.col); })
                .sort(function(first, second) { return first - second; });
            var centers = {};
            (pu.centerlist || []).forEach(function(key) { centers[key] = true; });
            var keys = Object.keys(pu.point || {});
            for (var index = 0; index < keys.length; index++) {
                var point = pu.point[keys[index]];
                if (!point || !Array.isArray(point.neighbor)) continue;
                var pointKey = Number(keys[index]);
                if (cells.length === 2 &&
                    (!pu.types || !pu.types[2] || pu.types[2].indexOf(point.type) === -1 ||
                        !pu.isKropkiEdge || !pu.isKropkiEdge(pointKey))) continue;
                if (cells.length === 4 && (!pu.isBattenburgCorner || !pu.isBattenburgCorner(pointKey))) continue;
                var neighbors = point.neighbor.filter(function(key) { return centers[key]; })
                    .sort(function(first, second) { return first - second; });
                if (neighbors.length === wanted.length && neighbors.every(function(key, offset) {
                    return key === wanted[offset];
                })) return pointKey;
            }
            return null;
        }

        (!result.preserveExisting ? result.kropkiMarks || [] : []).forEach(function(mark) {
            var key = pointForCells(mark.cells);
            if (key !== null) pu.pu_q.symbol[key] = [mark.kind === "black" ? 2 : 1, "circle_SS", 2];
        });
        (!result.preserveExisting ? result.xvMarks || [] : []).forEach(function(mark) {
            var key = pointForCells(mark.cells);
            if (key !== null) pu.pu_q.number[key] = [mark.kind, 6, "5"];
        });
        (!result.preserveExisting ? result.battenburgMarks || [] : []).forEach(function(mark) {
            var key = pointForCells(mark.cells);
            if (key !== null) pu.pu_q.symbol[key] = [1, "sudokuetc", 2];
        });
        var select = byId("constraints_settings_opt");
        if (select) select.value = pu.activeSudokuVariant;
        syncDiagonalLines();
        renderVariantTools();
        if (pu.activeSudokuVariant === "classic") {
            applyMode("classic", "sudoku", "1", "");
        } else {
            var setting = penpa_constraints.setting[pu.activeSudokuVariant];
            var modeIndex = setting ? setting.modeset.findIndex(function(mode) { return mode !== "sudoku"; }) : -1;
            if (modeIndex >= 0) {
                applyMode(pu.activeSudokuVariant, setting.modeset[modeIndex], setting.submodeset[modeIndex], setting.styleset[modeIndex]);
            } else {
                activateVariantRule(pu.activeSudokuVariant);
            }
        }
        setToolbarState();
        pu.redraw();
        var displayedBoard = SudokuSolver.readBoard(pu, false);
        var displayedConstraints = SudokuSolver.readConstraints(pu);
        var displayedAnswers = SudokuCSPRuntime.createProblem(displayedBoard, displayedConstraints).enumerateAnswers(2);
        if (displayedAnswers.length !== 1 || JSON.stringify(displayedAnswers[0]) !== JSON.stringify(result.solution)) {
            throw new Error("The generated Penpa board did not round-trip to the uniquely verified CSP puzzle.");
        }
        SudokuSolver.primeUniqueSolution(pu, result.solution);
    }

    function generatePuzzle(size, variants, negative, sourcePuzzle, seed) {
        stopGenerator();
        var startedAt = Date.now();
        variants = Array.isArray(variants) && variants.length ? variants : ["classic"];
        seed = seed || Date.now();
        generatorActiveRequest = {
            size: size,
            variants: variants.slice(),
            negative: negative,
            sourcePuzzle: sourcePuzzle,
            seed: seed
        };
        var label = variants.filter(function(variant) { return variant !== "classic"; }).join(" + ") || "classic";
        document.body.classList.add("sudoku-solver-running");
        var generatorButton = byId("sudoku_auto_solver");
        if (generatorButton) {
            generatorButton.title = "Pause generation";
            generatorButton.setAttribute("aria-label", generatorButton.title);
            var generatorIcon = generatorButton.querySelector("i");
            if (generatorIcon) generatorIcon.className = "fa fa-pause";
        }
        generatorLog("Generating", "[" + new Date().toLocaleTimeString() + "] Building a " +
            label + " puzzle with 180° rotational symmetry, then proving uniqueness with CSP.\n",
            { attempt: 0, total: Math.ceil(size * size / 2) });
        if (typeof Worker === "undefined") {
            try {
                var direct = SudokuGenerator.generate({
                    size: size,
                    variants: variants,
                    negative: negative,
                    sourceBoard: sourcePuzzle && sourcePuzzle.board,
                    sourceConstraints: sourcePuzzle && sourcePuzzle.constraints,
                    preserveExisting: sourcePuzzle && sourcePuzzle.preserveExisting,
                    seed: seed
                });
                applyGeneratedPuzzle(direct);
                document.body.classList.remove("sudoku-solver-running");
                generatorLog("Generated · unique", "Generated " +
                    (direct.preserveExisting ? "digit-minimal " : "minimal ") + direct.givens + "-given " + label +
                    (direct.preserveExisting ? " puzzle while preserving its existing variant clues. No rotational digit pair" :
                        " puzzle. No rotational clue pair") + " can be removed while preserving uniqueness. Total runtime: " +
                    ((Date.now() - startedAt) / 1000).toFixed(3) + " s.");
            } catch (error) {
                stopGenerator("Generator failed: " + error.message);
            }
            return;
        }
        generatorWorker = new Worker("./js/sudoku_generator_worker.js?v=3.3.15");
        generatorWorker.onmessage = function(event) {
            if (event.data.type === "progress") {
                generatorLog("Generating", null, event.data.progress);
            } else if (event.data.type === "result") {
                var result = event.data.result;
                stopGenerator();
                try {
                    applyGeneratedPuzzle(result);
                    generatorLog("Generated · unique", "Generated " +
                        (result.preserveExisting ? "digit-minimal " : "minimal ") + result.givens + "-given " + label +
                        (result.preserveExisting ? " puzzle while preserving its existing variant clues. No rotational digit pair" :
                            " puzzle. No rotational clue pair") + " can be removed while preserving uniqueness. Total runtime: " +
                        ((Date.now() - startedAt) / 1000).toFixed(3) + " s.");
                } catch (error) {
                    stopGenerator("Generator validation failed: " + error.message);
                }
            } else if (event.data.type === "error") {
                stopGenerator("Generator failed: " + event.data.message);
            }
        };
        generatorWorker.onerror = function(event) {
            stopGenerator("Generator failed: " + (event.message || "worker error"));
        };
        generatorWorker.postMessage({
            type: "generate",
            size: size,
            variants: variants,
            negative: negative,
            sourceBoard: sourcePuzzle && sourcePuzzle.board,
            sourceConstraints: sourcePuzzle && sourcePuzzle.constraints,
            preserveExisting: sourcePuzzle && sourcePuzzle.preserveExisting,
            seed: seed
        });
        generatorTimeout = setTimeout(function() {
            stopGenerator("Generator stopped at the 60-second safety limit.");
        }, AUTO_RUN_LIMIT_MS);
    }

    function modeLabel(variant, mode, submode) {
        var labels = {
            sudoku: "Sudoku",
            symbol: submode === "circle_SS" ? "Kropki Dot" :
                variant === "odd even" ? "Odd / Even Mark" :
                    variant === "battenburg" ? "Battenburg Mark" : "Mark",
            special: submode === "arrows" ? "Arrow" : submode === "thermo" ? "Thermo" : "Special",
            line: variant === "palindrome" ? "Palindrome Line" : "Line",
            lineE: "Edge",
            cage: "Cage",
            number: variant === "xv" && submode === "5" ? "XV Clue" :
                submode === "11" ? "Killer Sum" : variant === "skyscraper" ? "Skyscraper Clue" :
                    variant === "sandwich" ? "Sandwich Clue" : "Clue",
            surface: "Cell",
            combi: "Composite"
        };
        return labels[mode] || mode;
    }

    function selectedVariant() {
        var select = byId("constraints_settings_opt");
        return select && select.value ? select.value : "classic";
    }

    function activeVariants() {
        if (!pu) {
            return ["classic"];
        }
        if (!Array.isArray(pu.activeSudokuVariants)) {
            pu.activeSudokuVariants = [pu.activeSudokuVariant || "classic"];
        }
        pu.activeSudokuVariants = pu.activeSudokuVariants.filter(function(variant, index, variants) {
            return variant && variants.indexOf(variant) === index;
        });
        if (pu.activeSudokuVariants.indexOf("classic") === -1) {
            pu.activeSudokuVariants.unshift("classic");
        }
        return pu.activeSudokuVariants;
    }

    function hasVariant(variant) {
        return activeVariants().indexOf(variant) !== -1;
    }

    function addVariant(variant) {
        var variants = activeVariants();
        if (variants.indexOf(variant) === -1) {
            variants.push(variant);
        }
    }

    var outsideVariants = ["little killer", "sandwich", "skyscraper"];

    function variantConflict(variant) {
        var variants = activeVariants();
        if ((variant === "diagonal" && variants.indexOf("anti diagonal") !== -1) ||
            (variant === "anti diagonal" && variants.indexOf("diagonal") !== -1)) {
            return "Diagonal and Anti-Diagonal cannot be active together.";
        }
        if (outsideVariants.indexOf(variant) !== -1) {
            var otherOutside = variants.find(function(active) {
                return active !== variant && outsideVariants.indexOf(active) !== -1;
            });
            if (otherOutside) {
                return "Remove " + otherOutside.replace(/\b\w/g, function(letter) {
                    return letter.toUpperCase();
                }) + " before adding another outside-clue variant.";
            }
        }
        return "";
    }

    function layerHas(layer, property) {
        return !!(layer && layer[property] && Object.keys(layer[property]).length);
    }

    function diagonalLineKeys(puzzle) {
        if (!puzzle || !puzzle.pu_q || !puzzle.pu_q.lineE) {
            return [];
        }
        var sudokuFlags = puzzle.sudoku || [0, 0, 0, 0];
        var start = 1;
        var end = puzzle.nx;
        var endSize = end;
        if (sudokuFlags[1]) {
            start = 2;
            end = puzzle.nx - 1;
            endSize = end + 1;
        } else if (sudokuFlags[2]) {
            start = 2;
            end = puzzle.nx;
            endSize = end + 1;
        }
        var keys = [];
        var base = puzzle.nx0 * puzzle.nx0;
        for (var i = start; i <= end; i++) {
            var first = puzzle.nx0 * i + i + base;
            var second = puzzle.nx0 * (i + 1) + (i + 1) + base;
            keys.push(first + "," + second);

            var reverseFirst = puzzle.nx0 * i + endSize + 2 - i + base;
            var reverseSecond = puzzle.nx0 * (i + 1) + endSize + 1 - i + base;
            keys.push(reverseSecond + "," + reverseFirst);
        }
        return keys;
    }

    function hasNativeDiagonalLines(puzzle) {
        if (puzzle && puzzle.sudoku && (puzzle.sudoku[0] || puzzle.sudoku[3])) {
            return true;
        }
        return diagonalLineKeys(puzzle).some(function(key) {
            return puzzle.pu_q.lineE[key] === 12;
        });
    }

    function syncDiagonalLines() {
        if (!pu || !pu.pu_q || !pu.pu_q.lineE) {
            return;
        }
        var enabled = hasVariant("diagonal") || hasVariant("anti diagonal");
        diagonalLineKeys(pu).forEach(function(key) {
            if (enabled) {
                pu.pu_q.lineE[key] = 12;
            } else if (pu.pu_q.lineE[key] === 12) {
                delete pu.pu_q.lineE[key];
            }
        });
        if (Array.isArray(pu.sudoku)) {
            pu.sudoku[0] = enabled ? 1 : 0;
            pu.sudoku[3] = enabled ? 1 : 0;
        }
    }

    function discoverVariantsFromBoard() {
        if (!pu) {
            return;
        }
        var layers = [pu.pu_q, pu.pu_a];
        if (hasNativeDiagonalLines(pu) && !hasVariant("diagonal") && !hasVariant("anti diagonal")) {
            addVariant("diagonal");
        }
        layers.forEach(function(layer) {
            if (!layer) {
                return;
            }
            if (layerHas(layer, "arrows")) { addVariant("arrow"); }
            if (layerHas(layer, "thermo") || layerHas(layer, "nobulbthermo")) { addVariant("thermo"); }
            if (layerHas(layer, "killercages") || layerHas(layer, "cage")) { addVariant("killer"); }
            Object.keys(layer.symbol || {}).forEach(function(key) {
                var entry = layer.symbol[key];
                if (entry && entry[1] === "circle_SS" && (entry[0] === 1 || entry[0] === 2)) {
                    addVariant("kropki");
                } else if (entry && (entry[1] === "circle_L" || entry[1] === "square_L")) {
                    addVariant("odd even");
                } else if (entry && entry[1] === "sudokuetc" && entry[0] === 1) {
                    addVariant("battenburg");
                }
            });
            Object.keys(layer.line || {}).some(function(key) {
                if (layer.line[key] === 5) {
                    addVariant("palindrome");
                    return true;
                }
                return false;
            });
            Object.keys(layer.number || {}).some(function(key) {
                var entry = layer.number[key];
                var value = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
                if (value === "X" || value === "V") {
                    addVariant("xv");
                    return true;
                }
                return false;
            });
        });
    }

    function updateVariantActive() {
        var toolbar = byId("sudoku-variant-tools");
        if (!toolbar || !pu || !pu.mode || !pu.mode[pu.mode.qa]) {
            return;
        }
        Array.prototype.forEach.call(toolbar.querySelectorAll(".sudoku-variant-mode, .sudoku-variant-label"), function(button) {
            var mode = pu.mode[pu.mode.qa].edit_mode;
            var submode = pu.mode[pu.mode.qa][mode] ? pu.mode[pu.mode.qa][mode][0] : "";
            var active = button.classList.contains("sudoku-variant-label") ?
                button.dataset.variant === pu.activeSudokuVariant :
                button.dataset.mode === mode &&
                    (button.dataset.variant ? button.dataset.variant === pu.activeSudokuVariant :
                        pu.activeSudokuVariant === "classic") &&
                    (button.dataset.submode === "" || button.dataset.submode === submode);
            button.classList.toggle("active", active);
        });
    }

    function activateVariantRule(variant) {
        if (!pu) return;
        pu.activeSudokuVariant = variant;
        pu.kropki_mode = false;
        pu.xv_mode = false;
        pu.odd_even_mode = false;
        pu.battenburg_mode = false;
        updateVariantActive();
    }

    function updateKropkiNegativeControl() {
        var button = byId("sudoku_kropki_negative");
        if (!button) {
            return;
        }
        var enabled = !!(pu && pu.kropkiNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Kropki " + (enabled ? "ON" : "OFF");
    }

    function toggleKropkiNegative() {
        if (!pu || !hasVariant("kropki")) {
            return;
        }
        pu.kropkiNegativeConstraint = pu.kropkiNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateKropkiNegativeControl();
        pu.redraw();
    }

    function updateXVNegativeControl() {
        var button = byId("sudoku_xv_negative");
        if (!button) {
            return;
        }
        var enabled = !!(pu && pu.xvNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative XV " + (enabled ? "ON" : "OFF");
    }

    function toggleXVNegative() {
        if (!pu || !hasVariant("xv")) {
            return;
        }
        pu.xvNegativeConstraint = pu.xvNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateXVNegativeControl();
        pu.redraw();
    }

    function updateBattenburgNegativeControl() {
        var button = byId("sudoku_battenburg_negative");
        if (!button) return;
        var enabled = !!(pu && pu.battenburgNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Battenburg " + (enabled ? "ON" : "OFF");
    }

    function toggleBattenburgNegative() {
        if (!pu || !hasVariant("battenburg")) return;
        pu.battenburgNegativeConstraint = pu.battenburgNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateBattenburgNegativeControl();
        pu.redraw();
    }

    function applyMode(variant, mode, submode, style) {
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
        pu.activeSudokuVariant = variant || "classic";
        pu.kropki_mode = pu.activeSudokuVariant === "kropki";
        pu.xv_mode = pu.activeSudokuVariant === "xv";
        pu.odd_even_mode = pu.activeSudokuVariant === "odd even";
        pu.battenburg_mode = pu.activeSudokuVariant === "battenburg";
        if (pu.battenburg_mode) {
            UserSettings.draw_edges = true;
        }
        if (pu.xv_mode) {
            UserSettings.draw_edges = true;
        }
        pu.mode_set(mode);
        // The keypad is now opened explicitly from Penpa actions.
        UserSettings.panel_shown = false;
        if (typeof panel_onoff === "function") panel_onoff();
        pu.type = pu.type_set();
        updateVariantActive();
        updateKropkiNegativeControl();
        updateXVNegativeControl();
        updateBattenburgNegativeControl();
    }

    function renderVariantTools() {
        var toolbar = byId("sudoku-variant-tools");
        if (!toolbar || typeof penpa_constraints === "undefined") {
            return;
        }
        discoverVariantsFromBoard();
        syncDiagonalLines();
        toolbar.innerHTML = "";
        var sudokuButton = document.createElement("button");
        sudokuButton.type = "button";
        sudokuButton.className = "button sudoku-tool-button sudoku-variant-mode";
        sudokuButton.dataset.mode = "sudoku";
        sudokuButton.dataset.submode = "1";
        sudokuButton.textContent = "Sudoku";
        sudokuButton.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            applyMode("classic", "sudoku", "1", "");
        });
        toolbar.appendChild(sudokuButton);

        activeVariants().forEach(function(variant) {
            if (variant === "classic") {
                return;
            }
            var setting = penpa_constraints.setting[variant];
            if (!setting) {
                return;
            }
            var group = document.createElement("span");
            group.className = "sudoku-variant-group";
            group.dataset.variant = variant;
            var hasEditingMode = false;
            for (var i = 0; i < setting.modeset.length; i++) {
                if (setting.modeset[i] === "sudoku") {
                    continue;
                }
                hasEditingMode = true;
                addVariantModeButton(group, variant, setting.modeset[i],
                    setting.submodeset[i], setting.styleset[i]);
            }
            if (!hasEditingMode) {
                var label = document.createElement("button");
                label.type = "button";
                label.className = "button sudoku-tool-button sudoku-variant-label";
                label.dataset.variant = variant;
                label.textContent = variant.replace(/\b\w/g, function(letter) { return letter.toUpperCase(); });
                label.title = "This constraint is active and does not need a drawing mode";
                label.addEventListener("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    activateVariantRule(variant);
                });
                group.appendChild(label);
            }
            if (variant === "kropki" || variant === "xv" || variant === "battenburg") {
                var negative = document.createElement("button");
                var isKropki = variant === "kropki";
                var isXV = variant === "xv";
                negative.id = isKropki ? "sudoku_kropki_negative" :
                    isXV ? "sudoku_xv_negative" : "sudoku_battenburg_negative";
                negative.type = "button";
                negative.className = "button sudoku-tool-button " +
                    (isKropki ? "sudoku-kropki-negative" : isXV ? "sudoku-xv-negative" :
                        "sudoku-battenburg-negative");
                negative.title = isKropki ?
                    "Apply the negative Kropki rule to every undotted orthogonal edge" :
                    isXV ? "Apply the negative XV rule to every unmarked orthogonal edge" :
                        "Forbid checkerboard parity around every unmarked four-cell corner";
                negative.setAttribute("aria-label", isKropki ?
                    "Negative Kropki constraint" : isXV ? "Negative XV constraint" :
                        "Negative Battenburg constraint");
                negative.addEventListener("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (variant === "kropki") {
                        toggleKropkiNegative();
                    } else if (variant === "xv") {
                        toggleXVNegative();
                    } else {
                        toggleBattenburgNegative();
                    }
                });
                group.appendChild(negative);
            }
            var close = document.createElement("button");
            close.type = "button";
            close.className = "button sudoku-variant-close";
            close.textContent = "\u00d7";
            close.title = "Remove " + variant + " and all of its clues";
            close.setAttribute("aria-label", close.title);
            close.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                removeVariant(variant);
            });
            group.appendChild(close);
            toolbar.appendChild(group);
        });
        if (pu) {
            if (typeof pu.kropkiNegativeConstraint !== "boolean") {
                pu.kropkiNegativeConstraint = false;
            }
            if (typeof pu.xvNegativeConstraint !== "boolean") {
                pu.xvNegativeConstraint = false;
            }
            if (typeof pu.battenburgNegativeConstraint !== "boolean") {
                pu.battenburgNegativeConstraint = false;
            }
        }
        updateVariantActive();
        updateKropkiNegativeControl();
        updateXVNegativeControl();
        updateBattenburgNegativeControl();
    }

    function addVariantModeButton(group, variant, mode, submode, style) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "button sudoku-tool-button sudoku-variant-mode";
            button.dataset.variant = variant;
            button.dataset.mode = mode;
            button.dataset.submode = submode;
            button.textContent = modeLabel(variant, mode, submode);
            button.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                applyMode(variant, mode, submode, style);
            });
            group.appendChild(button);
    }

    function deleteEntries(object, predicate) {
        Object.keys(object || {}).forEach(function(key) {
            if (predicate(object[key], key)) {
                delete object[key];
            }
        });
    }

    function removeVariantElementsFromLayer(layer, colorLayer, variant) {
        if (!layer) {
            return;
        }
        if (variant === "kropki") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && entry[1] === "circle_SS" && (entry[0] === 1 || entry[0] === 2);
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && entry[1] === "circle_SS" && (entry[0] === 1 || entry[0] === 2);
            });
        } else if (variant === "odd even") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && (entry[1] === "circle_L" || entry[1] === "square_L");
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && (entry[1] === "circle_L" || entry[1] === "square_L");
            });
        } else if (variant === "battenburg") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && entry[1] === "sudokuetc" && entry[0] === 1;
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && entry[1] === "sudokuetc" && entry[0] === 1;
            });
        } else if (outsideVariants.indexOf(variant) !== -1) {
            deleteEntries(layer.number, function(entry, key) {
                return pu.cellsoutsideFrame && pu.cellsoutsideFrame.includes(Number(key));
            });
            deleteEntries(colorLayer && colorLayer.number, function(entry, key) {
                return pu.cellsoutsideFrame && pu.cellsoutsideFrame.includes(Number(key));
            });
        } else if (variant === "palindrome") {
            deleteEntries(layer.line, function(style) { return style === 5; });
            deleteEntries(colorLayer && colorLayer.line, function(style) { return style === 5; });
        } else if (variant === "xv") {
            deleteEntries(layer.number, function(entry) {
                var value = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
                return value === "X" || value === "V";
            });
            deleteEntries(colorLayer && colorLayer.number, function(entry) {
                var value = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
                return value === "X" || value === "V";
            });
        } else if (variant === "arrow") {
            layer.arrows = [];
            if (colorLayer) { colorLayer.arrows = []; }
        } else if (variant === "thermo") {
            layer.thermo = [];
            layer.nobulbthermo = [];
            if (colorLayer) {
                colorLayer.thermo = [];
                colorLayer.nobulbthermo = [];
            }
        } else if (variant === "killer") {
            if (typeof pu.refreshKillerCages === "function") {
                pu.refreshKillerCages(layer === pu.pu_a ? "pu_a" : "pu_q");
            }
            var killerSumKeys = {};
            (layer.killercages || []).forEach(function(cage) {
                (cage || []).forEach(function(cell) {
                    var base = cell + pu.nx0 * pu.ny0;
                    for (var corner = 0; corner < 4; corner++) {
                        killerSumKeys[4 * base + corner] = true;
                    }
                });
            });
            deleteEntries(layer.numberS, function(entry, key) { return !!killerSumKeys[key]; });
            deleteEntries(colorLayer && colorLayer.numberS, function(entry, key) {
                return !!killerSumKeys[key];
            });
            layer.killercages = [];
            layer.cage = {};
            if (colorLayer) {
                colorLayer.killercages = [];
                colorLayer.cage = {};
            }
        }
    }

    function shrinkOutsideSpace() {
        if (!pu || !Array.isArray(pu.space)) return;
        var operations = ["resize_top", "resize_bottom", "resize_left", "resize_right"];
        operations.forEach(function(operation, index) {
            var remaining = Number(pu.space[index] || 0);
            while (remaining-- > 0 && typeof pu[operation] === "function") {
                pu[operation](-1, "white");
            }
        });
    }

    function removeVariant(variant) {
        if (!pu || variant === "classic") {
            return;
        }
        SudokuSolver.invalidateCandidateAnalysis();
        removeVariantElementsFromLayer(pu.pu_q, pu.pu_q_col, variant);
        removeVariantElementsFromLayer(pu.pu_a, pu.pu_a_col, variant);
        pu.activeSudokuVariants = activeVariants().filter(function(active) {
            return active !== variant;
        });
        syncDiagonalLines();
        if (variant === "kropki") {
            pu.kropkiNegativeConstraint = false;
        } else if (variant === "xv") {
            pu.xvNegativeConstraint = false;
        } else if (variant === "battenburg") {
            pu.battenburgNegativeConstraint = false;
        }
        pu.activeSudokuVariant = "classic";
        pu.kropki_mode = false;
        pu.xv_mode = false;
        pu.odd_even_mode = false;
        pu.battenburg_mode = false;
        if (outsideVariants.indexOf(variant) !== -1) {
            shrinkOutsideSpace();
        }
        var select = byId("constraints_settings_opt");
        if (select) {
            select.value = "classic";
        }
        renderVariantTools();
        applyMode("classic", "sudoku", "1", "");
        pu.redraw();
    }

    function resetForNewGrid() {
        SudokuTools.autoEnabled = false;
        SudokuSolver.cancelCandidateAnalysis();
        SudokuSolver.invalidateCandidateAnalysis();
        if (pu) {
            pu.activeSudokuVariants = ["classic"];
            pu.activeSudokuVariant = "classic";
            pu.kropki_mode = false;
            pu.xv_mode = false;
            pu.odd_even_mode = false;
            pu.battenburg_mode = false;
            pu.kropkiNegativeConstraint = false;
            pu.xvNegativeConstraint = false;
            pu.battenburgNegativeConstraint = false;
        }
        var select = byId("constraints_settings_opt");
        if (select) {
            select.value = "classic";
        }
        setToolbarState();
    }

    function variantChanged() {
        var variant = selectedVariant();
        var conflict = variantConflict(variant);
        if (conflict) {
            var rejectedSelect = byId("constraints_settings_opt");
            if (rejectedSelect) rejectedSelect.value = "classic";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Conflicting variants", text: conflict });
            }
            renderVariantTools();
            return;
        }
        addVariant(variant);
        syncDiagonalLines();
        if (variant !== "classic") {
            UserSettings.panel_shown = false;
        }
        if (pu) {
            pu.activeSudokuVariant = variant;
        }
        SudokuSolver.invalidateCandidateAnalysis();
        renderVariantTools();
        if (variant === "classic") {
            applyMode("classic", "sudoku", "1", "");
        } else {
            var setting = penpa_constraints.setting[variant];
            var modeIndex = setting ? setting.modeset.findIndex(function(mode) {
                return mode !== "sudoku";
            }) : -1;
            if (modeIndex >= 0) {
                applyMode(variant, setting.modeset[modeIndex], setting.submodeset[modeIndex],
                    setting.styleset[modeIndex]);
            } else {
                activateVariantRule(variant);
            }
        }
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
            sudoku_reset: function() {
                if (typeof CreateCheck === "function") {
                    CreateCheck();
                }
            },
            sudoku_undo: function() { pu.undo(); },
            sudoku_redo: function() { pu.redo(); },
            sudoku_keypad: function() {
                UserSettings.panel_shown = !UserSettings.panel_shown;
            },
            sudoku_auto_solver: toggleAuto,
            sudoku_load_test_board: loadTestBoard,
            sudoku_kropki_negative: toggleKropkiNegative,
            sudoku_xv_negative: toggleXVNegative,
            sudoku_battenburg_negative: toggleBattenburgNegative
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
        variantChanged: variantChanged,
        resetForNewGrid: resetForNewGrid,
        generatePuzzle: generatePuzzle,
        pauseGenerator: pauseGenerator,
        pauseWork: pauseWork
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuSolver;
}
