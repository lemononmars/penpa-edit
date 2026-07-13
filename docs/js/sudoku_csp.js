var SudokuCSP = (function() {
    var SIZE = 9;
    var ALL_DIGITS = 0x3FE;
    var constraintRegistry = {};

    function cloneBoard(board) {
        var requestedSize = board && board.length;
        if (requestedSize === 6 || requestedSize === 9) {
            SIZE = requestedSize;
            ALL_DIGITS = (1 << (SIZE + 1)) - 2;
            if (helpers) {
                helpers.size = SIZE;
                helpers.allDigitsMask = ALL_DIGITS;
            }
        }
        return Array.from({ length: SIZE }, function(_, row) {
            return Array.from({ length: SIZE }, function(__, col) {
                var value = board && board[row] ? parseInt(board[row][col], 10) : 0;
                return value >= 1 && value <= SIZE ? value : 0;
            });
        });
    }

    function boxIndex(row, col, size) {
        size = size || SIZE;
        var boxHeight = size === 6 ? 2 : 3;
        var boxWidth = size / boxHeight;
        return ((row / boxHeight) | 0) * (size / boxWidth) + ((col / boxWidth) | 0);
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
                var box = boxIndex(row, col, SIZE);
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
        var box = boxIndex(row, col, state.board.length);
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
        var box = boxIndex(row, col, state.board.length);
        state.board[row][col] = digit;
        state.rows[row] |= bit;
        state.cols[col] |= bit;
        state.boxes[box] |= bit;
    }

    function remove(state, row, col, digit) {
        var bit = ~(1 << digit);
        var box = boxIndex(row, col, state.board.length);
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

    function solutionMatches(solution, source, constraints) {
        var state = createState(solution);
        if (!state.valid || !constraintsValid(state.board, constraints, true)) {
            return false;
        }
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (!state.board[row][col] || (source[row][col] && source[row][col] !== state.board[row][col])) {
                    return false;
                }
            }
        }
        return true;
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

        var seedSolutions = [];
        var seenSeeds = {};
        (options.seedSolutions || []).forEach(function(solution) {
            var normalized = cloneBoard(solution);
            var key = JSON.stringify(normalized);
            if (!seenSeeds[key] && solutionMatches(normalized, source, constraints)) {
                seenSeeds[key] = true;
                seedSolutions.push(normalized);
            }
        });
        var first = seedSolutions[0] || findSolutions(source, constraints, 1)[0];
        if (!first) {
            report({ type: "unsatisfiable", message: "No complete solution exists." });
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source) };
        }
        report({
            type: "solution",
            reused: seedSolutions.length,
            message: seedSolutions.length ?
                "Reused " + seedSolutions.length + " compatible solution witness" +
                    (seedSolutions.length === 1 ? "." : "es.") :
                "Found an initial complete solution."
        });
        await nextPaint();

        var possibleMasks = Array.from({ length: SIZE }, function() { return new Array(SIZE).fill(0); });
        var forced = cloneBoard(source);
        var witnessSolutions = [];
        function absorb(solution) {
            witnessSolutions.push(cloneBoard(solution));
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    possibleMasks[row][col] |= 1 << solution[row][col];
                }
            }
        }
        if (seedSolutions.length) {
            seedSolutions.forEach(absorb);
        } else {
            absorb(first);
        }

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
        var witnessCount = witnessSolutions.length;
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
            refuted: refutedCount,
            reusedWitnesses: seedSolutions.length,
            witnessSolutions: witnessSolutions
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

    registerConstraint("oddEven", {
        validatePartial: function(board, mark) {
            var value = cellValue(board, mark.cell);
            if (!value) {
                return true;
            }
            return mark.parity === "odd" ? value % 2 === 1 : value % 2 === 0;
        }
    });

    registerConstraint("battenburg", {
        validatePartial: function(board, constraint) {
            var cells = constraint.cells || constraint;
            var complete = true;
            for (var i = 0; i < cells.length; i++) {
                var first = cellValue(board, cells[i]);
                if (!first) {
                    complete = false;
                    continue;
                }
                for (var j = i + 1; j < cells.length; j++) {
                    var second = cellValue(board, cells[j]);
                    if (!second) {
                        complete = false;
                        continue;
                    }
                    var orthogonal = cells[i].row === cells[j].row || cells[i].col === cells[j].col;
                    var violatesPattern = orthogonal ? first % 2 === second % 2 : first % 2 !== second % 2;
                    if ((!constraint.kind || constraint.kind === "marked") && violatesPattern) {
                        return false;
                    }
                }
            }
            if (constraint.kind === "none" && complete) {
                var parity = cells.map(function(cell) { return cellValue(board, cell) % 2; });
                var checkerboard = parity[0] !== parity[1] && parity[0] !== parity[2] &&
                    parity[0] === parity[3] && parity[1] === parity[2];
                return !checkerboard;
            }
            return true;
        }
    });

    registerConstraint("skyscrapers", {
        validatePartial: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var tallest = 0;
            var visible = 0;
            values.forEach(function(value) {
                if (value > tallest) {
                    tallest = value;
                    visible++;
                }
            });
            return visible === sightline.clue;
        }
    });

    registerConstraint("sandwiches", {
        validatePartial: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            var low = 1;
            var high = 6;
            for (var first = 0; first < values.length; first++) {
                for (var second = first + 1; second < values.length; second++) {
                    var endpointsFit =
                        (!values[first] || values[first] === low || values[first] === high) &&
                        (!values[second] || values[second] === low || values[second] === high) &&
                        (!values[first] || !values[second] || values[first] !== values[second]);
                    if (!endpointsFit) continue;

                    var outsideHasEndpoint = values.some(function(value, index) {
                        return index !== first && index !== second && (value === low || value === high);
                    });
                    if (outsideHasEndpoint) continue;

                    var sum = 0;
                    var open = 0;
                    for (var index = first + 1; index < second; index++) {
                        if (values[index]) sum += values[index];
                        else open++;
                    }
                    if (sum <= sightline.clue && sum + (open * SIZE) >= sightline.clue) {
                        return true;
                    }
                }
            }
            return false;
        },
        validateComplete: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            var first = values.indexOf(1);
            var second = values.indexOf(6);
            if (first < 0 || second < 0) return false;
            var start = Math.min(first, second) + 1;
            var end = Math.max(first, second);
            var sum = 0;
            for (var index = start; index < end; index++) sum += values[index];
            return sum === sightline.clue;
        }
    });

    registerConstraint("diagonalAllDifferent", {
        validatePartial: function(board, diagonal) {
            var seen = 0;
            for (var i = 0; i < diagonal.length; i++) {
                var value = cellValue(board, diagonal[i]);
                if (!value) {
                    continue;
                }
                var bit = 1 << value;
                if (seen & bit) {
                    return false;
                }
                seen |= bit;
            }
            return true;
        }
    });

    registerConstraint("antiDiagonals", {
        validatePartial: function(board, diagonal) {
            var counts = {};
            var distinct = 0;
            for (var i = 0; i < diagonal.length; i++) {
                var value = cellValue(board, diagonal[i]);
                if (!value) {
                    continue;
                }
                if (!counts[value]) {
                    counts[value] = 0;
                    distinct++;
                }
                counts[value]++;
                if (distinct > 3 || counts[value] > 3) {
                    return false;
                }
            }
            return true;
        },
        validateComplete: function(board, diagonal) {
            var counts = {};
            for (var i = 0; i < diagonal.length; i++) {
                var value = cellValue(board, diagonal[i]);
                if (!value) {
                    return false;
                }
                counts[value] = (counts[value] || 0) + 1;
            }
            var values = Object.keys(counts);
            return values.length === 3 && values.every(function(value) {
                return counts[value] === 3;
            });
        }
    });

    function pairValuesDiffer(board, pair) {
        var first = cellValue(board, pair[0]);
        var second = cellValue(board, pair[1]);
        return !first || !second || first !== second;
    }

    registerConstraint("antiKing", {
        validatePartial: function(board, pair) {
            return pairValuesDiffer(board, pair);
        }
    });

    registerConstraint("antiKnight", {
        validatePartial: function(board, pair) {
            return pairValuesDiffer(board, pair);
        }
    });

    registerConstraint("nonConsecutive", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || Math.abs(first - second) !== 1;
        }
    });

    registerConstraint("palindromes", {
        validatePartial: function(board, path) {
            for (var i = 0; i < Math.floor(path.length / 2); i++) {
                var first = cellValue(board, path[i]);
                var second = cellValue(board, path[path.length - 1 - i]);
                if (first && second && first !== second) {
                    return false;
                }
            }
            return true;
        }
    });

    function xvAllows(first, second, kind) {
        var sum = first + second;
        if (kind === "V") {
            return sum === 5;
        }
        if (kind === "X") {
            return sum === 10;
        }
        return sum !== 5 && sum !== 10;
    }

    registerConstraint("xv", {
        validatePartial: function(board, clue) {
            var first = cellValue(board, clue.cells[0]);
            var second = cellValue(board, clue.cells[1]);
            if (first && second) {
                return xvAllows(first, second, clue.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && xvAllows(known, candidate, clue.kind)) {
                    return true;
                }
            }
            return false;
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
