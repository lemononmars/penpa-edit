var SudokuCSP = (function() {
    var SIZE = 9;
    var ALL_DIGITS = 0x3FE;
    var constraintRegistry = {};

    function cloneBoard(board) {
        return Array.from({ length: SIZE }, function(_, row) {
            return Array.from({ length: SIZE }, function(__, col) {
                var value = board && board[row] ? parseInt(board[row][col], 10) : 0;
                return value >= 1 && value <= SIZE ? value : 0;
            });
        });
    }

    function cloneConstraints(constraints) {
        var copy = {};
        Object.keys(constraints || {}).forEach(function(name) {
            copy[name] = Array.isArray(constraints[name]) ? constraints[name].slice() : constraints[name];
        });
        return copy;
    }

    function cellValue(board, cell) {
        return board[cell.row][cell.col];
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

    function createState(source) {
        var board = cloneBoard(source);
        var rows = new Array(SIZE).fill(0);
        var cols = new Array(SIZE).fill(0);
        var boxes = new Array(SIZE).fill(0);
        var valid = true;
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var digit = board[row][col];
                if (!digit) {
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
        return { board: board, rows: rows, cols: cols, boxes: boxes, valid: valid };
    }

    function coreMask(state, row, col) {
        var box = ((row / 3) | 0) * 3 + ((col / 3) | 0);
        return ALL_DIGITS & ~(state.rows[row] | state.cols[col] | state.boxes[box]);
    }

    var helpers = {
        size: SIZE,
        allDigitsMask: ALL_DIGITS,
        cellValue: cellValue,
        maskToDigits: maskToDigits
    };

    function registerConstraint(name, handler) {
        if (!name || !handler || typeof handler.validatePartial !== "function") {
            throw new Error("A CSP constraint requires a name and validatePartial(board, constraint, helpers).");
        }
        constraintRegistry[name] = handler;
    }

    function registeredConstraints() {
        return Object.keys(constraintRegistry);
    }

    function constraintsValid(board, constraints, complete) {
        var names = registeredConstraints();
        constraints = constraints || {};
        for (var n = 0; n < names.length; n++) {
            var name = names[n];
            var items = constraints[name] || [];
            for (var i = 0; i < items.length; i++) {
                var handler = constraintRegistry[name];
                if (!handler.validatePartial(board, items[i], helpers) ||
                    (complete && handler.validateComplete && !handler.validateComplete(board, items[i], helpers))) {
                    return false;
                }
            }
        }
        return true;
    }

    function place(state, row, col, digit) {
        var bit = 1 << digit;
        var box = ((row / 3) | 0) * 3 + ((col / 3) | 0);
        state.board[row][col] = digit;
        state.rows[row] |= bit;
        state.cols[col] |= bit;
        state.boxes[box] |= bit;
    }

    function remove(state, row, col, digit) {
        var bit = ~(1 << digit);
        var box = ((row / 3) | 0) * 3 + ((col / 3) | 0);
        state.board[row][col] = 0;
        state.rows[row] &= bit;
        state.cols[col] &= bit;
        state.boxes[box] &= bit;
    }

    function allowedMask(state, constraints, row, col) {
        var mask = coreMask(state, row, col);
        var allowed = 0;
        for (var digit = 1; digit <= SIZE; digit++) {
            var bit = 1 << digit;
            if (!(mask & bit)) {
                continue;
            }
            place(state, row, col, digit);
            if (constraintsValid(state.board, constraints, false)) {
                allowed |= bit;
            }
            remove(state, row, col, digit);
        }
        return allowed;
    }

    function search(state, constraints, onSolution, limit) {
        var found = 0;

        function visit() {
            var bestRow = -1;
            var bestCol = -1;
            var bestMask = 0;
            var bestCount = SIZE + 1;
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    if (state.board[row][col]) {
                        continue;
                    }
                    var mask = allowedMask(state, constraints, row, col);
                    var count = countBits(mask);
                    if (!count) {
                        return false;
                    }
                    if (count < bestCount) {
                        bestRow = row;
                        bestCol = col;
                        bestMask = mask;
                        bestCount = count;
                        if (count === 1) {
                            break;
                        }
                    }
                }
                if (bestCount === 1) {
                    break;
                }
            }

            if (bestRow === -1) {
                if (!constraintsValid(state.board, constraints, true)) {
                    return false;
                }
                found++;
                return onSolution(cloneBoard(state.board)) === false || found >= limit;
            }

            var digits = maskToDigits(bestMask);
            for (var i = 0; i < digits.length; i++) {
                place(state, bestRow, bestCol, digits[i]);
                var stop = visit();
                remove(state, bestRow, bestCol, digits[i]);
                if (stop) {
                    return true;
                }
            }
            return false;
        }

        if (state.valid && constraintsValid(state.board, constraints, false)) {
            visit();
        }
        return found;
    }

    function findSolutions(board, constraints, limit) {
        var solutions = [];
        var state = createState(board);
        search(state, constraints, function(solution) {
            solutions.push(solution);
        }, limit || 1);
        return solutions;
    }

    function solutionWithAssumption(board, constraints, row, col, digit) {
        var assumed = cloneBoard(board);
        if (assumed[row][col] && assumed[row][col] !== digit) {
            return null;
        }
        assumed[row][col] = digit;
        var solutions = findSolutions(assumed, constraints, 1);
        return solutions.length ? solutions[0] : null;
    }

    function analyzeCandidates(board, constraints) {
        var source = cloneBoard(board);
        var state = createState(source);
        var candidates = Array.from({ length: SIZE }, function() {
            return Array.from({ length: SIZE }, function() { return []; });
        });
        if (!state.valid || !constraintsValid(state.board, constraints, false)) {
            return { valid: false, satisfiable: false, candidates: candidates, forced: cloneBoard(source) };
        }

        var first = findSolutions(source, constraints, 1)[0];
        if (!first) {
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source) };
        }

        var possibleMasks = Array.from({ length: SIZE }, function() { return new Array(SIZE).fill(0); });
        var forced = cloneBoard(source);
        function absorb(solution) {
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    possibleMasks[row][col] |= 1 << solution[row][col];
                }
            }
        }
        absorb(first);

        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (source[row][col]) {
                    continue;
                }
                var localMask = allowedMask(state, constraints, row, col);
                var localDigits = maskToDigits(localMask);
                for (var i = 0; i < localDigits.length; i++) {
                    var digit = localDigits[i];
                    if (possibleMasks[row][col] & (1 << digit)) {
                        continue;
                    }
                    var witness = solutionWithAssumption(source, constraints, row, col, digit);
                    if (witness) {
                        absorb(witness);
                    }
                }
            }
        }

        for (var y = 0; y < SIZE; y++) {
            for (var x = 0; x < SIZE; x++) {
                if (source[y][x]) {
                    continue;
                }
                candidates[y][x] = maskToDigits(possibleMasks[y][x]);
                forced[y][x] = candidates[y][x].length === 1 ? candidates[y][x][0] : 0;
            }
        }
        return {
            valid: true,
            satisfiable: true,
            candidates: candidates,
            forced: forced,
            unique: candidates.every(function(row, y) {
                return row.every(function(values, x) { return source[y][x] || values.length === 1; });
            })
        };
    }

    function nextPaint() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 0);
        });
    }

    async function analyzeCandidatesAsync(board, constraints, options) {
        options = options || {};
        var report = typeof options.onProgress === "function" ? options.onProgress : function() {};
        var cancelled = typeof options.isCancelled === "function" ? options.isCancelled : function() { return false; };
        var source = cloneBoard(board);
        var state = createState(source);
        var candidates = Array.from({ length: SIZE }, function() {
            return Array.from({ length: SIZE }, function() { return []; });
        });
        report({ type: "start", message: "Validating givens and variant constraints." });
        await nextPaint();
        if (cancelled()) {
            return { cancelled: true };
        }
        if (!state.valid || !constraintsValid(state.board, constraints, false)) {
            report({ type: "invalid", message: "The current givens or constraints conflict." });
            return { valid: false, satisfiable: false, candidates: candidates, forced: cloneBoard(source) };
        }

        var first = findSolutions(source, constraints, 1)[0];
        if (!first) {
            report({ type: "unsatisfiable", message: "No complete solution exists." });
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source) };
        }
        report({ type: "solution", message: "Found an initial complete solution." });
        await nextPaint();

        var possibleMasks = Array.from({ length: SIZE }, function() { return new Array(SIZE).fill(0); });
        var forced = cloneBoard(source);
        function absorb(solution) {
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    possibleMasks[row][col] |= 1 << solution[row][col];
                }
            }
        }
        absorb(first);

        var checks = [];
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (source[row][col]) {
                    continue;
                }
                maskToDigits(allowedMask(state, constraints, row, col)).forEach(function(digit) {
                    checks.push({ row: row, col: col, digit: digit });
                });
            }
        }
        report({
            type: "analysis",
            total: checks.length,
            message: "Testing " + checks.length + " cell/digit answer facts against complete solutions."
        });
        await nextPaint();

        var tested = 0;
        var witnessCount = 1;
        var refutedCount = 0;
        for (var i = 0; i < checks.length; i++) {
            if (cancelled()) {
                report({ type: "cancelled", message: "Analysis cancelled because the puzzle changed." });
                return { cancelled: true };
            }
            var check = checks[i];
            var alreadyWitnessed = !!(possibleMasks[check.row][check.col] & (1 << check.digit));
            var witness = alreadyWitnessed ? true :
                solutionWithAssumption(source, constraints, check.row, check.col, check.digit);
            if (witness && witness !== true) {
                absorb(witness);
                witnessCount++;
            } else if (!witness) {
                refutedCount++;
            }
            tested++;
            report({
                type: alreadyWitnessed ? "covered" : witness ? "witness" : "refuted",
                row: check.row,
                col: check.col,
                digit: check.digit,
                tested: tested,
                total: checks.length,
                message: "r" + (check.row + 1) + "c" + (check.col + 1) + " = " + check.digit +
                    (alreadyWitnessed ? " already covered by a witness." :
                        witness ? " occurs in a complete solution." : " is impossible in every solution.")
            });
            if (tested % 4 === 0 || tested === checks.length) {
                await nextPaint();
            }
        }

        for (var y = 0; y < SIZE; y++) {
            for (var x = 0; x < SIZE; x++) {
                if (source[y][x]) {
                    continue;
                }
                candidates[y][x] = maskToDigits(possibleMasks[y][x]);
                forced[y][x] = candidates[y][x].length === 1 ? candidates[y][x][0] : 0;
            }
        }
        var unique = candidates.every(function(row, y) {
            return row.every(function(values, x) { return source[y][x] || values.length === 1; });
        });
        report({
            type: "done",
            tested: tested,
            total: checks.length,
            witnesses: witnessCount,
            refuted: refutedCount,
            unique: unique,
            message: "Irrefutable extraction complete: " + witnessCount + " solution witnesses, " +
                refutedCount + " impossible answer facts; answer is " + (unique ? "unique." : "not unique.")
        });
        return {
            valid: true,
            satisfiable: true,
            candidates: candidates,
            forced: forced,
            unique: unique,
            witnesses: witnessCount,
            refuted: refutedCount
        };
    }

    function createProblem(board, constraints) {
        var values = cloneBoard(board);
        var normalizedConstraints = cloneConstraints(constraints || {});
        var answerKeys = [];
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                answerKeys.push({ row: row, col: col });
            }
        }
        return {
            size: SIZE,
            board: values,
            constraints: normalizedConstraints,
            answerKeys: answerKeys,
            isConsistent: function() {
                var state = createState(values);
                return state.valid && constraintsValid(values, normalizedConstraints, false);
            },
            candidates: function() {
                return analyzeCandidates(values, normalizedConstraints);
            },
            irrefutableFacts: function() {
                return analyzeCandidates(values, normalizedConstraints);
            },
            solve: function() {
                return solve(values, normalizedConstraints);
            },
            enumerateAnswers: function(limit) {
                return findSolutions(values, normalizedConstraints, Math.max(1, limit || 1));
            }
        };
    }

    function getCandidates(board, constraints) {
        return analyzeCandidates(board, constraints || {});
    }

    function solve(board, constraints) {
        var source = cloneBoard(board);
        var state = createState(source);
        if (!state.valid || !constraintsValid(source, constraints || {}, false)) {
            return { solved: false, reason: "The grid has conflicting givens or constraints." };
        }
        var solutions = findSolutions(source, constraints || {}, 1);
        return solutions.length ?
            { solved: true, board: solutions[0] } :
            { solved: false, reason: "No solution satisfies the registered CSP constraints." };
    }

    registerConstraint("thermos", {
        validatePartial: function(board, path) {
            for (var i = 0; i < path.length; i++) {
                var value = cellValue(board, path[i]);
                if (!value) {
                    continue;
                }
                if (value < i + 1 || value > SIZE - (path.length - 1 - i)) {
                    return false;
                }
                var previous = i > 0 ? cellValue(board, path[i - 1]) : 0;
                var next = i < path.length - 1 ? cellValue(board, path[i + 1]) : 0;
                if ((previous && previous >= value) || (next && value >= next)) {
                    return false;
                }
            }
            return true;
        }
    });

    registerConstraint("arrows", {
        validatePartial: function(board, arrow) {
            var circle = cellValue(board, arrow.circle);
            var sum = 0;
            var open = 0;
            for (var i = 0; i < arrow.shaft.length; i++) {
                var value = cellValue(board, arrow.shaft[i]);
                value ? sum += value : open++;
            }
            if (circle) {
                return sum + open <= circle && sum + (SIZE * open) >= circle && (open || sum === circle);
            }
            return open ? sum + open <= SIZE : sum >= 1 && sum <= SIZE;
        }
    });

    registerConstraint("killers", {
        validatePartial: function(board, cage) {
            var seen = 0;
            var total = 0;
            var blanks = 0;
            for (var i = 0; i < cage.cells.length; i++) {
                var digit = cellValue(board, cage.cells[i]);
                if (!digit) {
                    blanks++;
                    continue;
                }
                var bit = 1 << digit;
                if (seen & bit) {
                    return false;
                }
                seen |= bit;
                total += digit;
            }
            if (!cage.total) {
                return true;
            }
            if (total > cage.total || (!blanks && total !== cage.total)) {
                return false;
            }
            var available = [];
            for (var value = 1; value <= SIZE; value++) {
                if (!(seen & (1 << value))) {
                    available.push(value);
                }
            }
            if (available.length < blanks) {
                return false;
            }
            var minimum = available.slice(0, blanks).reduce(function(sum, value) { return sum + value; }, 0);
            var maximum = available.slice(available.length - blanks).reduce(function(sum, value) { return sum + value; }, 0);
            return total + minimum <= cage.total && total + maximum >= cage.total;
        }
    });

    function kropkiAllows(first, second, kind) {
        var consecutive = Math.abs(first - second) === 1;
        var double = first === 2 * second || second === 2 * first;
        if (kind === "white") {
            return consecutive;
        }
        if (kind === "black") {
            return double;
        }
        return !consecutive && !double;
    }

    registerConstraint("kropki", {
        validatePartial: function(board, dot) {
            var first = cellValue(board, dot.cells[0]);
            var second = cellValue(board, dot.cells[1]);
            if (first && second) {
                return kropkiAllows(first, second, dot.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && kropkiAllows(known, candidate, dot.kind)) {
                    return true;
                }
            }
            return false;
        }
    });

    return {
        SIZE: SIZE,
        registerConstraint: registerConstraint,
        registeredConstraints: registeredConstraints,
        createProblem: createProblem,
        getCandidates: getCandidates,
        getCandidatesAsync: analyzeCandidatesAsync,
        solve: solve
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuCSP;
}
