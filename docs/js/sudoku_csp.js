var SudokuCSP = (function() {
    var SIZE = 9;
    var ALL_DIGITS = 0x3FE;
    var constraintRegistry = {};
    var evaluatorCache = typeof WeakMap !== "undefined" ? new WeakMap() : null;

    function cloneBoard(board) {
        var requestedSize = board && board.length;
        if (requestedSize) {
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

    function createState(source, constraints) {
        var board = cloneBoard(source);
        var rows = new Array(SIZE).fill(0);
        var cols = new Array(SIZE).fill(0);
        var boxes = new Array(SIZE).fill(0);
        var useBoxes = !constraints || constraints.baseBoxes !== false;
        var valid = true;
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var digit = board[row][col];
                if (!digit) {
                    continue;
                }
                var bit = 1 << digit;
                var box = boxIndex(row, col, SIZE);
                if ((rows[row] & bit) || (cols[col] & bit) || (useBoxes && (boxes[box] & bit))) {
                    valid = false;
                }
                rows[row] |= bit;
                cols[col] |= bit;
                if (useBoxes) boxes[box] |= bit;
            }
        }
        return { board: board, rows: rows, cols: cols, boxes: boxes, useBoxes: useBoxes, valid: valid };
    }

    function coreMask(state, row, col) {
        var box = boxIndex(row, col, state.board.length);
        return ALL_DIGITS & ~(state.rows[row] | state.cols[col] | (state.useBoxes ? state.boxes[box] : 0));
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

    function compileConstraints(constraints) {
        constraints = constraints || {};
        if (evaluatorCache && evaluatorCache.has(constraints)) return evaluatorCache.get(constraints);
        var entries = [];
        var byCell = {};
        var globalEntries = [];
        registeredConstraints().forEach(function(name) {
            var handler = constraintRegistry[name];
            (constraints[name] || []).forEach(function(item) {
                var entry = { handler: handler, item: item };
                entries.push(entry);
                var cells = cellsInConstraint(item);
                if (!cells.length) {
                    globalEntries.push(entry);
                    return;
                }
                cells.forEach(function(cell) {
                    var key = cell.row + ":" + cell.col;
                    (byCell[key] || (byCell[key] = [])).push(entry);
                });
            });
        });
        function validate(board, selected, complete) {
            for (var index = 0; index < selected.length; index++) {
                var entry = selected[index];
                if (!entry.handler.validatePartial(board, entry.item, helpers) ||
                    (complete && entry.handler.validateComplete &&
                        !entry.handler.validateComplete(board, entry.item, helpers))) return false;
            }
            return true;
        }
        var evaluator = {
            validateAll: function(board, complete) { return validate(board, entries, complete); },
            validateCell: function(board, row, col) {
                if (!validate(board, globalEntries, false)) return false;
                return validate(board, byCell[row + ":" + col] || [], false);
            }
        };
        if (evaluatorCache && constraints && typeof constraints === "object") evaluatorCache.set(constraints, evaluator);
        return evaluator;
    }

    function constraintsValid(board, constraints, complete) {
        return compileConstraints(constraints || {}).validateAll(board, complete);
    }

    function cellName(cell) {
        return "r" + (cell.row + 1) + "c" + (cell.col + 1);
    }

    function cellsInConstraint(value, cells, seen) {
        cells = cells || [];
        seen = seen || {};
        if (!value || typeof value !== "object") return cells;
        if (Number.isInteger(value.row) && Number.isInteger(value.col) &&
            value.row >= 0 && value.row < SIZE && value.col >= 0 && value.col < SIZE) {
            var key = value.row + ":" + value.col;
            if (!seen[key]) {
                seen[key] = true;
                cells.push({ row: value.row, col: value.col });
            }
            return cells;
        }
        Object.keys(value).forEach(function(key) {
            cellsInConstraint(value[key], cells, seen);
        });
        return cells;
    }

    function duplicateConflict(board, constraints) {
        var groups = [];
        for (var index = 0; index < SIZE; index++) {
            groups.push({ label: "row " + (index + 1), cells: Array.from({ length: SIZE }, function(_, col) {
                return { row: index, col: col };
            }) });
            groups.push({ label: "column " + (index + 1), cells: Array.from({ length: SIZE }, function(_, row) {
                return { row: row, col: index };
            }) });
        }
        if (!constraints || constraints.baseBoxes !== false) {
            var boxHeight = SIZE === 6 ? 2 : 3;
            var boxWidth = SIZE / boxHeight;
            for (var boxRow = 0; boxRow < SIZE; boxRow += boxHeight) {
                for (var boxCol = 0; boxCol < SIZE; boxCol += boxWidth) {
                    var boxCells = [];
                    for (var rowOffset = 0; rowOffset < boxHeight; rowOffset++) {
                        for (var colOffset = 0; colOffset < boxWidth; colOffset++) {
                            boxCells.push({ row: boxRow + rowOffset, col: boxCol + colOffset });
                        }
                    }
                    groups.push({ label: "box at r" + (boxRow + 1) + "c" + (boxCol + 1), cells: boxCells });
                }
            }
        }
        for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            var byDigit = {};
            groups[groupIndex].cells.forEach(function(cell) {
                var digit = cellValue(board, cell);
                if (digit) (byDigit[digit] || (byDigit[digit] = [])).push(cell);
            });
            var duplicate = Object.keys(byDigit).find(function(digit) { return byDigit[digit].length > 1; });
            if (duplicate) {
                var duplicateCells = byDigit[duplicate];
                return {
                    kind: "duplicate",
                    cells: duplicateCells,
                    message: "Conflicting givens: digit " + duplicate + " is repeated in " + groups[groupIndex].label + " at " +
                        duplicateCells.map(cellName).join(" and ") + "."
                };
            }
        }
        return null;
    }

    function constraintLabel(name, item) {
        if (name === "directionalMarks" && item && item.relation) {
            return item.relation.replace(/([a-z])([0-9])/g, "$1 $2").replace(/([a-z])([A-Z])/g, "$1 $2");
        }
        var labels = {
            antiKing: "Anti King", antiKnight: "Anti Knight", nonConsecutive: "Non-Consecutive",
            edgeRelations: "edge clue", quadRelations: "quad clue", catalogLines: "line clue",
            diagonalAllDifferent: "diagonal/region", regionAllDifferent: "region",
            regionCoverage: "region coverage", kropki: "Kropki", xv: "XV", battenburg: "Battenburg"
        };
        return labels[name] || name.replace(/([a-z])([A-Z])/g, "$1 $2");
    }

    function findConflict(board, constraints) {
        var normalized = cloneBoard(board);
        constraints = constraints || {};
        var duplicate = duplicateConflict(normalized, constraints);
        if (duplicate) return duplicate;
        var names = registeredConstraints();
        for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
            var name = names[nameIndex];
            var items = constraints[name] || [];
            for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
                var handler = constraintRegistry[name];
                if (!handler.validatePartial(normalized, items[itemIndex], helpers)) {
                    var cells = cellsInConstraint(items[itemIndex]);
                    return {
                        kind: "constraint",
                        constraint: name,
                        cells: cells,
                        message: "Constraint conflict: " + constraintLabel(name, items[itemIndex]) + " conflicts with the current digits" +
                            (cells.length ? " at " + cells.map(cellName).join(", ") : "") + "."
                    };
                }
            }
        }
        return null;
    }

    function unresolvedConflict(board) {
        var cells = [];
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (board[row][col]) cells.push({ row: row, col: col });
            }
        }
        return {
            kind: "unsatisfiable",
            cells: cells,
            message: "No complete solution exists. The highlighted givens are collectively inconsistent, but no single local rule is already violated."
        };
    }

    function place(state, row, col, digit) {
        var bit = 1 << digit;
        var box = boxIndex(row, col, state.board.length);
        state.board[row][col] = digit;
        state.rows[row] |= bit;
        state.cols[col] |= bit;
        if (state.useBoxes) state.boxes[box] |= bit;
    }

    function remove(state, row, col, digit) {
        var bit = ~(1 << digit);
        var box = boxIndex(row, col, state.board.length);
        state.board[row][col] = 0;
        state.rows[row] &= bit;
        state.cols[col] &= bit;
        if (state.useBoxes) state.boxes[box] &= bit;
    }

    function allowedMask(state, constraints, row, col, evaluator) {
        var mask = coreMask(state, row, col);
        var allowed = 0;
        evaluator = evaluator || compileConstraints(constraints || {});
        for (var digit = 1; digit <= SIZE; digit++) {
            var bit = 1 << digit;
            if (!(mask & bit)) {
                continue;
            }
            place(state, row, col, digit);
            if (evaluator.validateCell(state.board, row, col)) {
                allowed |= bit;
            }
            remove(state, row, col, digit);
        }
        return allowed;
    }

    function search(state, constraints, onSolution, limit, evaluator) {
        var found = 0;
        evaluator = evaluator || compileConstraints(constraints || {});

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
                    var mask = allowedMask(state, constraints, row, col, evaluator);
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
                if (!evaluator.validateAll(state.board, true)) {
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

        if (state.valid && evaluator.validateAll(state.board, false)) {
            visit();
        }
        return found;
    }

    function findSolutions(board, constraints, limit) {
        var solutions = [];
        var state = createState(board, constraints);
        var evaluator = compileConstraints(constraints || {});
        search(state, constraints, function(solution) {
            solutions.push(solution);
        }, limit || 1, evaluator);
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
        var state = createState(solution, constraints);
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
        var state = createState(source, constraints);
        var candidates = Array.from({ length: SIZE }, function() {
            return Array.from({ length: SIZE }, function() { return []; });
        });
        if (!state.valid || !constraintsValid(state.board, constraints, false)) {
            return { valid: false, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: findConflict(source, constraints) };
        }

        var first = findSolutions(source, constraints, 1)[0];
        if (!first) {
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: unresolvedConflict(source) };
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
        var state = createState(source, constraints);
        var candidates = Array.from({ length: SIZE }, function() {
            return Array.from({ length: SIZE }, function() { return []; });
        });
        report({ type: "start", message: "Validating givens and variant constraints." });
        await nextPaint();
        if (cancelled()) {
            return { cancelled: true };
        }
        if (!state.valid || !constraintsValid(state.board, constraints, false)) {
            var invalidConflict = findConflict(source, constraints);
            report({ type: "invalid", message: invalidConflict ? invalidConflict.message :
                "The current givens or constraints conflict.", conflict: invalidConflict });
            return { valid: false, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: invalidConflict };
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
            var unsatisfiableConflict = unresolvedConflict(source);
            report({ type: "unsatisfiable", message: unsatisfiableConflict.message,
                conflict: unsatisfiableConflict });
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: unsatisfiableConflict };
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
                var state = createState(values, normalizedConstraints);
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
        var state = createState(source, constraints);
        if (!state.valid || !constraintsValid(source, constraints || {}, false)) {
            var conflict = findConflict(source, constraints || {});
            return { solved: false, reason: conflict ? conflict.message :
                "The grid has conflicting givens or constraints.", conflict: conflict };
        }
        var solutions = findSolutions(source, constraints || {}, 1);
        return solutions.length ?
            { solved: true, board: solutions[0] } :
            { solved: false, reason: unresolvedConflict(source).message, conflict: unresolvedConflict(source) };
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

    registerConstraint("disparity", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || (first % 2) !== (second % 2);
        }
    });

    registerConstraint("nonConsecutive", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || Math.abs(first - second) !== 1;
        }
    });

    registerConstraint("diagonalNonConsecutive", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || Math.abs(first - second) !== 1;
        }
    });

    registerConstraint("noEvenNeighbours", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || first % 2 || second % 2;
        }
    });

    registerConstraint("noThreeInRow", {
        validatePartial: function(board, cells) {
            var values = cells.map(function(cell) { return cellValue(board, cell); });
            return values.some(function(value) { return !value; }) ||
                !(values[0] % 2 === values[1] % 2 && values[1] % 2 === values[2] % 2);
        }
    });

    registerConstraint("queenDigits", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return first !== SIZE || second !== SIZE;
        }
    });

    registerConstraint("touchyCells", {
        validatePartial: function(board, item) {
            var value = cellValue(board, item.cell);
            if (!value) return true;
            var open = false;
            for (var index = 0; index < item.neighbors.length; index++) {
                var neighbor = cellValue(board, item.neighbors[index]);
                if (!neighbor) open = true;
                else if (Math.abs(value - neighbor) === 1) return true;
            }
            return open;
        }
    });

    registerConstraint("edgeRelations", {
        validatePartial: function(board, clue) {
            var first = cellValue(board, clue.cells[0]);
            var second = cellValue(board, clue.cells[1]);
            if (!first || !second) return true;
            var sum = first + second;
            var difference = Math.abs(first - second);
            var product = first * second;
            switch (clue.relation) {
                case "fives": return sum === 5 || difference === 5;
                case "notFives": return sum !== 5 && difference !== 5;
                case "difference": return difference === clue.target;
                case "sum": return sum === clue.target;
                case "product": return product === clue.target;
                case "greater": return Math.max(first, second) === clue.target;
                case "lesser": return Math.min(first, second) === clue.target;
                case "consecutive": return difference === 1;
                case "notConsecutive": return difference !== 1;
                case "evenSum": return sum % 2 === 0;
                case "oddSum": return sum % 2 === 1;
                case "inequality": return clue.sign === "<" ? first < second : first > second;
                case "divisor": return clue.target > 0 && (first * 10 + second) % clue.target === 0;
                case "eitheror": return first === clue.target || second === clue.target;
                case "blocksumrelations":
                    var groupValues = (clue.groups || []).map(function(group) {
                        var values = group.map(function(cell) { return cellValue(board, cell); });
                        return values.some(function(value) { return !value; }) ? null :
                            values.reduce(function(total, value) { return total + value; }, 0);
                    });
                    return groupValues.indexOf(null) !== -1 ||
                        (clue.sign === "<" ? groupValues[0] < groupValues[1] : groupValues[0] > groupValues[1]);
                case "xydifference":
                    var reference = cellValue(board, clue.reference);
                    return !reference || difference === reference;
                case "notXydifference":
                    var reference = cellValue(board, clue.reference);
                    return !reference || difference !== reference;
                case "perfectsquares": return [16, 25, 36, 49, 64, 81].indexOf(first * 10 + second) !== -1;
                case "notPerfectSquare": return [16, 25, 36, 49, 64, 81].indexOf(first * 10 + second) === -1;
                case "primesums":
                    var sum = first + second;
                    return [2, 3, 5, 7, 11, 13, 17].indexOf(sum) !== -1;
                case "notPrimesums":
                    var sum = first + second;
                    return [2, 3, 5, 7, 11, 13, 17].indexOf(sum) === -1;
                case "twodigitprimenumbers":
                    var val = first * 10 + second;
                    return [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97].indexOf(val) !== -1;
                case "notTwodigitprimenumbers":
                    var val = first * 10 + second;
                    return [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97].indexOf(val) === -1;
                case "diagonalConsecutive": return difference === 1;
                case "notDiagonalConsecutive": return difference !== 1;
                case "diagonalSumIsNine": return sum === 9;
                case "notDiagonalSumIsNine": return sum !== 9;
                case "diagonalTens": return sum === 10;
                case "notDiagonalTens": return sum !== 10;
                case "arithmetic":
                    return sum === clue.target || difference === clue.target || product === clue.target ||
                        (first % second === 0 && first / second === clue.target) ||
                        (second % first === 0 && second / first === clue.target);
            }
            return true;
        }
    });

    registerConstraint("directionalMarks", {
        validatePartial: function(board, clue) {
            var relation = clue.relation;
            var origin = clue.origin ? cellValue(board, clue.origin) : 0;
            var targetValues = (clue.targets || []).map(function(cell) { return cellValue(board, cell); });
            if (relation === "eliminate") {
                return !origin || targetValues.every(function(value) { return !value || value !== origin; });
            }
            if (relation === "pointtonext" || relation === "pointtoprevious") {
                if (!origin) return true;
                var wanted = origin + (relation === "pointtonext" ? 1 : -1);
                if (wanted < 1 || wanted > SIZE) return false;
                return targetValues.some(function(value) { return !value || value === wanted; });
            }
            if (relation === "biggestneighbours") {
                var neighborValues = (clue.neighbors || []).map(function(cell) { return cellValue(board, cell); })
                    .filter(Boolean);
                return targetValues.every(function(value) {
                    return !value || neighborValues.every(function(neighbor) { return value >= neighbor; });
                });
            }
            if (relation === "smallestneighbours") {
                var allNeighborValues = (clue.neighbors || []).map(function(cell) { return cellValue(board, cell); })
                    .filter(Boolean);
                return targetValues.every(function(value) {
                    return !value || allNeighborValues.every(function(neighbor) { return value <= neighbor; });
                });
            }
            if (relation === "quadmax" || relation === "quadmin") {
                var target = cellValue(board, clue.target);
                if (!target) return true;
                return clue.cells.every(function(cell) {
                    var value = cellValue(board, cell);
                    if (!value || (cell.row === clue.target.row && cell.col === clue.target.col)) return true;
                    return relation === "quadmax" ? target > value : target < value;
                });
            }
            if (relation === "search6" || relation === "search9") {
                if (!origin) return true;
                return (clue.rays || []).every(function(ray) {
                    if (origin > ray.length) return false;
                    for (var distance = 1; distance <= origin; distance++) {
                        var value = cellValue(board, ray[distance - 1]);
                        if (value === clue.searchDigit) return distance === origin;
                        if (!value) return true;
                    }
                    return false;
                });
            }
            if (relation === "sumdetector") {
                if (!origin) return true;
                return (clue.rays || []).every(function(ray) {
                    var sum = 0;
                    for (var index = 0; index < ray.length; index++) {
                        var value = cellValue(board, ray[index]);
                        if (!value) return sum < origin;
                        sum += value;
                        if (sum === origin) return true;
                        if (sum > origin) return false;
                    }
                    return false;
                });
            }
            if (relation === "detection") {
                if (!origin) return true;
                var markedRays = {};
                (clue.rays || []).forEach(function(ray) {
                    if (ray.length) markedRays[ray[0].row + ":" + ray[0].col] = true;
                });
                return (clue.allDiagonalRays || []).every(function(ray) {
                    if (!ray.length) return true;
                    var marked = !!markedRays[ray[0].row + ":" + ray[0].col];
                    var hasMatch = false, hasBlank = false;
                    ray.forEach(function(cell) {
                        var value = cellValue(board, cell);
                        if (!value) hasBlank = true;
                        else if (value === origin) hasMatch = true;
                    });
                    return marked ? hasMatch || hasBlank : !hasMatch;
                });
            }
            return true;
        }
    });

    registerConstraint("sumDetectorGroups", {
        validatePartial: function(board, group) {
            var rays = [];
            (group.clues || []).forEach(function(clue) {
                (clue.rays || []).forEach(function(ray) { rays.push({ origin: clue.origin, cells: ray }); });
            });
            if (!rays.length) return true;
            for (var n = 1; n <= SIZE; n++) {
                var commonNWorks = rays.every(function(ray) {
                    if (ray.cells.length < n) return false;
                    var target = cellValue(board, ray.origin);
                    var sum = 0, blanks = 0;
                    for (var index = 0; index < n; index++) {
                        var value = cellValue(board, ray.cells[index]);
                        if (value) sum += value;
                        else blanks++;
                    }
                    if (target) return sum + blanks <= target && sum + blanks * SIZE >= target &&
                        (blanks > 0 || sum === target);
                    return sum + blanks <= SIZE;
                });
                if (commonNWorks) return true;
            }
            return false;
        }
    });

    registerConstraint("codedGroups", {
        validatePartial: function(board, clue) {
            var used = {};
            for (var groupIndex = 0; groupIndex < clue.groups.length; groupIndex++) {
                var values = clue.groups[groupIndex].map(function(cell) { return cellValue(board, cell); }).filter(Boolean);
                if (values.some(function(value) { return value !== values[0]; })) return false;
                if (values.length) {
                    if (used[values[0]]) return false;
                    used[values[0]] = true;
                }
            }
            return true;
        }
    });

    registerConstraint("pencilmarkCells", {
        validatePartial: function(board, clue) {
            var value = cellValue(board, clue.cell);
            return !value || clue.allowed.indexOf(value) !== -1;
        }
    });

    registerConstraint("symmetricUnequal", {
        validatePartial: function(board, pair) {
            return pairValuesDiffer(board, pair);
        }
    });

    registerConstraint("stretchedThermos", {
        validatePartial: function(board, path) {
            for (var index = 1; index < path.length; index++) {
                var previous = cellValue(board, path[index - 1]);
                var current = cellValue(board, path[index]);
                if (previous && current && previous > current) return false;
            }
            return true;
        }
    });

    registerConstraint("productKillers", {
        validatePartial: function(board, cage) {
            var seen = {};
            var product = 1;
            var blanks = 0;
            for (var index = 0; index < cage.cells.length; index++) {
                var value = cellValue(board, cage.cells[index]);
                if (!value) { blanks++; continue; }
                if (seen[value]) return false;
                seen[value] = true;
                product *= value;
            }
            if (!cage.total || product > cage.total || cage.total % product !== 0) return false;
            return blanks > 0 || product === cage.total;
        },
        validateComplete: function(board, cage) {
            return cage.cells.reduce(function(product, cell) { return product * cellValue(board, cell); }, 1) === cage.total;
        }
    });

    registerConstraint("soloKillerGroups", {
        validatePartial: function(board, cages) {
            var target = 0;
            var summaries = cages.map(function(cage) {
                var values = cage.map(function(cell) { return cellValue(board, cell); });
                return { sum: values.reduce(function(sum, value) { return sum + value; }, 0),
                    blanks: values.filter(function(value) { return !value; }).length };
            });
            summaries.forEach(function(summary) { if (!summary.blanks) target = target || summary.sum; });
            return summaries.every(function(summary) {
                if (!target) return true;
                return summary.sum <= target && summary.sum + summary.blanks * SIZE >= target &&
                    (summary.blanks > 0 || summary.sum === target);
            });
        },
        validateComplete: function(board, cages) {
            var sums = cages.map(function(cage) {
                return cage.reduce(function(sum, cell) { return sum + cellValue(board, cell); }, 0);
            });
            return sums.every(function(sum) { return sum === sums[0]; });
        }
    });

    registerConstraint("outsideRelations", {
        validatePartial: function(board, clue) {
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            if (clue.relation === "numberedrooms") {
                var room = values[0];
                return !room || room > values.length || !values[room - 1] || values[room - 1] === clue.value;
            }
            if (clue.relation === "xsums") {
                var count = values[0];
                if (!count || count > values.length) return !count;
                var prefix = values.slice(0, count);
                var sum = prefix.reduce(function(total, value) { return total + value; }, 0);
                var blanks = prefix.filter(function(value) { return !value; }).length;
                return sum <= clue.value && sum + blanks * SIZE >= clue.value && (blanks > 0 || sum === clue.value);
            }
            if (clue.relation === "bouncing x-sums") {
                var count = values[0];
                if (!count || count > values.length) return !count;
                var prefix = values.slice(0, count);
                var sum = prefix.reduce(function(total, value) { return total + value; }, 0);
                var blanks = prefix.filter(function(value) { return !value; }).length;
                return sum <= clue.value && sum + blanks * SIZE >= clue.value && (blanks > 0 || sum === clue.value);
            }
            if (clue.relation === "czech outsider") {
                var digits = String(clue.value).split("").map(Number).filter(function(d) { return d >= 1 && d <= SIZE; });
                var counts = {};
                digits.forEach(function(d) { counts[d] = (counts[d] || 0) + 1; });
                var blanks = values.filter(function(v) { return !v; }).length;
                for (var d in counts) {
                    var targetCount = counts[d];
                    var currentCount = values.filter(function(v) { return v === Number(d); }).length;
                    if (currentCount + blanks < targetCount) return false;
                    if (blanks === 0 && currentCount < targetCount) return false;
                }
                return true;
            }
            if (clue.relation === "distances") {
                var x = clue.value.x;
                var y = clue.value.y;
                var z = clue.value.z;
                var idxX = values.indexOf(x);
                var idxY = values.indexOf(y);
                if (idxX !== -1 && idxY !== -1) {
                    if (idxX >= idxY) return false;
                    return idxY - idxX === z;
                }
                if (idxX !== -1 && idxY === -1) {
                    var expectedIdxY = idxX + z;
                    if (expectedIdxY >= values.length) return false;
                    var valAtExpected = values[expectedIdxY];
                    return !valAtExpected || valAtExpected === y;
                }
                if (idxY !== -1 && idxX === -1) {
                    var expectedIdxX = idxY - z;
                    if (expectedIdxX < 0) return false;
                    var valAtExpected = values[expectedIdxX];
                    return !valAtExpected || valAtExpected === x;
                }
                if (idxX === -1 && idxY === -1) {
                    var possible = false;
                    for (var i = 0; i < values.length - z; i++) {
                        if ((!values[i] || values[i] === x) && (!values[i + z] || values[i + z] === y)) {
                            possible = true;
                            break;
                        }
                    }
                    return possible;
                }
                return true;
            }
            if (clue.relation === "sumframe" || clue.relation === "framediagonal") {
                var frameSum = values.reduce(function(total, value) { return total + value; }, 0);
                var frameBlanks = values.filter(function(value) { return !value; }).length;
                return frameSum <= clue.value && frameSum + frameBlanks * SIZE >= clue.value &&
                    (frameBlanks > 0 || frameSum === clue.value);
            }
            if (clue.relation === "firstseenoddeven") {
                var isOddClue = (clue.value % 2) !== 0;
                for (var i = 0; i < values.length; i++) {
                    var v = values[i];
                    if (!v) break;
                    var isOddVal = (v % 2) !== 0;
                    if (isOddVal === isOddClue) {
                        return v === clue.value;
                    }
                }
                var idxOfClue = values.indexOf(clue.value);
                if (idxOfClue !== -1) {
                    for (var i = 0; i < idxOfClue; i++) {
                        if (values[i] && ((values[i] % 2) !== 0) === isOddClue) {
                            return false;
                        }
                    }
                } else {
                    var hasMatchingParity = values.some(function(v) { return v && ((v % 2) !== 0) === isOddClue; });
                    if (hasMatchingParity) return false;
                    var noBlanks = values.every(function(v) { return v; });
                    if (noBlanks) return false;
                }
                return true;
            }
            if (clue.relation === "maxascending") {
                var maxGuaranteed = 0;
                var currentGuaranteed = 0;
                for (var i = 0; i < values.length; i++) {
                    if (i === 0 || (values[i] && values[i-1] && values[i] > values[i-1])) {
                        if (values[i]) {
                            currentGuaranteed++;
                        } else {
                            currentGuaranteed = 0;
                        }
                    } else {
                        if (currentGuaranteed > maxGuaranteed) maxGuaranteed = currentGuaranteed;
                        currentGuaranteed = values[i] ? 1 : 0;
                    }
                }
                if (currentGuaranteed > maxGuaranteed) maxGuaranteed = currentGuaranteed;
                if (maxGuaranteed > clue.value) return false;

                var maxPossible = 0;
                var currentPossible = 0;
                for (var i = 0; i < values.length; i++) {
                    if (i === 0 || !values[i] || !values[i-1] || values[i] > values[i-1]) {
                        currentPossible++;
                    } else {
                        if (currentPossible > maxPossible) maxPossible = currentPossible;
                        currentPossible = 1;
                    }
                }
                if (currentPossible > maxPossible) maxPossible = currentPossible;
                if (maxPossible < clue.value) return false;

                if (values.every(function(v) { return v; })) {
                    return maxGuaranteed === clue.value;
                }
                return true;
            }
            if (clue.relation === "bust") {
                if (clue.value < 1 || clue.value > values.length) return false;
                var running = 0;
                for (var index = 0; index < clue.value; index++) {
                    if (!values[index]) return true;
                    running += values[index];
                    if (index < clue.value - 1 && running > 21) return false;
                }
                return running > 21;
            }
            if (clue.relation === "productframe") {
                var productValues = values.slice(0, 3);
                var product = productValues.reduce(function(total, value) { return total * (value || 1); }, 1);
                var productOpen = productValues.filter(function(value) { return !value; }).length;
                return product <= clue.value && clue.value % product === 0 && (productOpen > 0 || product === clue.value);
            }
            if (clue.relation === "edgedifference") {
                return !values[0] || !values[values.length - 1] ||
                    Math.abs(values[0] - values[values.length - 1]) === clue.value;
            }
            if (clue.relation === "outsideparity") {
                if (clue.value < 1 || clue.value >= values.length) return false;
                var parityPrefix = values.slice(0, clue.value);
                var assignedParity = parityPrefix.filter(Boolean);
                if (assignedParity.length > 1 && assignedParity.some(function(value) {
                    return value % 2 !== assignedParity[0] % 2;
                })) return false;
                return !values[clue.value] || !assignedParity.length ||
                    values[clue.value] % 2 !== assignedParity[0] % 2;
            }
            if (clue.relation === "parityparty") {
                function parityPrefixPossible(parity) {
                    var sum = 0;
                    for (var parityIndex = 0; parityIndex < values.length; parityIndex++) {
                        if (!values[parityIndex]) return sum < clue.value;
                        sum += values[parityIndex];
                        if (values[parityIndex] % 2 === parity) return sum === clue.value;
                        if (sum >= clue.value) return false;
                    }
                    return false;
                }
                return parityPrefixPossible(0) || parityPrefixPossible(1);
            }
            if (clue.relation === "serbianframe") {
                var serbianIndexes = clue.axis === "row" ? [1, 2] : [2, 3];
                var serbianValues = serbianIndexes.map(function(index) { return values[index]; });
                return serbianValues.some(function(value) { return !value; }) ||
                    serbianValues[0] + serbianValues[1] === clue.value;
            }
            if (clue.relation === "median") {
                var medianValues = values.slice(0, 3);
                return medianValues.some(function(value) { return !value; }) ||
                    medianValues.slice().sort(function(a, b) { return a - b; })[1] === clue.value;
            }
            if (clue.relation === "descriptivepairs") {
                var x = Math.floor(clue.value / 10), y = clue.value % 10;
                if (x < 1 || y < 1 || x > values.length || y > values.length) return false;
                var xAtY = !values[y - 1] || values[y - 1] === x;
                var yAtX = !values[x - 1] || values[x - 1] === y;
                if (!values[y - 1] || !values[x - 1]) return xAtY || yAtX;
                return values[y - 1] === x || values[x - 1] === y;
            }
            if (clue.relation === "outside" || clue.relation === "outside234") {
                var assignedOutside = values.filter(Boolean);
                return (clue.clues || []).every(function(value) {
                    return assignedOutside.indexOf(value) !== -1 || assignedOutside.length < values.length;
                }) && (assignedOutside.length < values.length || clue.clues.every(function(value) {
                    return assignedOutside.indexOf(value) !== -1;
                }));
            }
            if (clue.relation === "maximin" || clue.relation === "minimax") {
                var extrema = values.slice(0, 3);
                if (extrema.some(function(value) { return !value; })) return true;
                var highest = Math.max.apply(null, extrema), lowest = Math.min.apply(null, extrema);
                return clue.relation === "maximin" ? highest - lowest === clue.value : highest + lowest === clue.value;
            }
            if (clue.relation === "little killer" || clue.relation === "product little killer") {
                if (clue.relation === "little killer") {
                    var littleSum = values.reduce(function(total, value) { return total + value; }, 0);
                    var littleBlanks = values.filter(function(value) { return !value; }).length;
                    return littleSum <= clue.value && littleSum + littleBlanks * SIZE >= clue.value &&
                        (littleBlanks > 0 || littleSum === clue.value);
                }
                var littleProduct = values.reduce(function(total, value) { return total * (value || 1); }, 1);
                var productBlanks = values.filter(function(value) { return !value; }).length;
                return littleProduct <= clue.value && clue.value % littleProduct === 0 &&
                    (productBlanks > 0 || littleProduct === clue.value);
            }
            if (clue.relation === "evensandwich" || clue.relation === "oddsandwich") {
                var parity = clue.relation === "evensandwich" ? 0 : 1;
                var found = [];
                for (var sandwichIndex = 1; sandwichIndex < values.length - 1; sandwichIndex++) {
                    if (values[sandwichIndex - 1] && values[sandwichIndex] && values[sandwichIndex + 1] &&
                        values[sandwichIndex - 1] % 2 === parity && values[sandwichIndex + 1] % 2 === parity) {
                        found.push(values[sandwichIndex]);
                    }
                }
                var expected = (clue.clues || []).slice().sort(function(a, b) { return a - b; });
                found.sort(function(a, b) { return a - b; });
                for (var foundIndex = 0; foundIndex < found.length; foundIndex++) {
                    var expectedIndex = expected.indexOf(found[foundIndex]);
                    if (expectedIndex < 0) return false;
                    expected.splice(expectedIndex, 1);
                }
                return values.some(function(value) { return !value; }) || expected.length === 0;
            }
            if (clue.relation === "ascendingstarters") {
                var sum = 0;
                var prev = 0;
                var hasZero = false;
                for (var idx = 0; idx < values.length; idx++) {
                    var val = values[idx];
                    if (val === 0) {
                        hasZero = true;
                        break;
                    }
                    if (val > prev) {
                        sum += val;
                        prev = val;
                    } else {
                        break;
                    }
                }
                if (!hasZero) {
                    return sum === clue.value;
                }
                return sum <= clue.value;
            }
            if (clue.relation === "before9") {
                // Sum of all digits that appear before 9 in the row/column (left-to-right / top-to-bottom)
                var b9_idx = values.indexOf(9);
                if (b9_idx >= 0) {
                    // 9 is placed: sum everything before it exactly
                    var b9_sum = 0;
                    for (var b9_i = 0; b9_i < b9_idx; b9_i++) {
                        if (!values[b9_i]) return true; // blank before 9 – still possible
                        b9_sum += values[b9_i];
                    }
                    return b9_sum === clue.value;
                }
                // 9 not placed yet – check if any position for 9 is consistent with clue
                // When 9 is at position p, the sum of the p cells before it must equal clue.value
                for (var b9_p = 0; b9_p < values.length; b9_p++) {
                    if (values[b9_p] !== 0) continue; // only blank slots can receive 9
                    var b9_pre = 0, b9_blanks = 0;
                    for (var b9_j = 0; b9_j < b9_p; b9_j++) {
                        if (values[b9_j]) b9_pre += values[b9_j];
                        else b9_blanks++;
                    }
                    // blanks in prefix can each be 1-8 (not 9, since 9 is going to b9_p)
                    if (b9_pre + b9_blanks <= clue.value && b9_pre + b9_blanks * 8 >= clue.value) return true;
                }
                return false;
            }
            if (clue.relation === "before1" || clue.relation === "after9") {
                var marker = clue.relation === "before1" ? 1 : 9;
                var markerIndex = values.indexOf(marker);
                if (markerIndex < 0) return true;
                var segmentStart = clue.relation === "before1" ? 0 : markerIndex + 1;
                var segmentEnd = clue.relation === "before1" ? markerIndex : values.length;
                var segmentSum = 0, segmentBlanks = 0;
                for (var segmentIndex = segmentStart; segmentIndex < segmentEnd; segmentIndex++) {
                    if (values[segmentIndex]) segmentSum += values[segmentIndex];
                    else segmentBlanks++;
                }
                if (!segmentBlanks) return segmentSum === clue.value;
                return segmentSum + segmentBlanks <= clue.value &&
                    segmentSum + segmentBlanks * SIZE >= clue.value;
            }
            if (clue.relation === "before1after9") {
                // Sum of digits BEFORE 1 OR AFTER 9, reading L→R / T→B.
                // The rule applies to whichever of {1,9} appears first in the row/col:
                //   if 1 comes first  → sum all digits before position of 1
                //   if 9 comes first  → sum all digits after  position of 9
                var b1a9_i1 = values.indexOf(1);
                var b1a9_i9 = values.indexOf(9);

                function b1a9_sumSlice(start, end) {
                    // Inclusive-exclusive slice [start,end); returns {sum, blanks}
                    var s = 0, bl = 0;
                    for (var ii = start; ii < end; ii++) {
                        if (values[ii]) s += values[ii];
                        else bl++;
                    }
                    return { sum: s, blanks: bl };
                }
                function b1a9_canEqual(s, bl) {
                    if (bl === 0) return s === clue.value;
                    return s + bl <= clue.value && s + bl * 8 >= clue.value;
                }

                if (b1a9_i1 >= 0 && b1a9_i9 >= 0) {
                    // Both placed: check whichever comes first
                    if (b1a9_i1 < b1a9_i9) {
                        var r1 = b1a9_sumSlice(0, b1a9_i1);
                        return b1a9_canEqual(r1.sum, r1.blanks);
                    } else {
                        var r9 = b1a9_sumSlice(b1a9_i9 + 1, values.length);
                        return b1a9_canEqual(r9.sum, r9.blanks);
                    }
                }
                // At least one of {1,9} is not placed – enumerate candidate positions
                var b1a9_possible = false;
                var p1_range = b1a9_i1 >= 0 ? [b1a9_i1] : values.map(function(_, ii) { return ii; }).filter(function(ii) { return values[ii] === 0; });
                var p9_range = b1a9_i9 >= 0 ? [b1a9_i9] : values.map(function(_, ii) { return ii; }).filter(function(ii) { return values[ii] === 0; });
                for (var pi = 0; pi < p1_range.length && !b1a9_possible; pi++) {
                    var pos1 = p1_range[pi];
                    for (var qi = 0; qi < p9_range.length && !b1a9_possible; qi++) {
                        var pos9 = p9_range[qi];
                        if (pos1 === pos9) continue;
                        if (pos1 < pos9) {
                            // 1 comes first: sum before pos1
                            var r = b1a9_sumSlice(0, pos1);
                            if (b1a9_canEqual(r.sum, r.blanks)) b1a9_possible = true;
                        } else {
                            // 9 comes first: sum after pos9
                            var r = b1a9_sumSlice(pos9 + 1, values.length);
                            if (b1a9_canEqual(r.sum, r.blanks)) b1a9_possible = true;
                        }
                    }
                }
                return b1a9_possible;
            }
            return true;
        }
    });

    registerConstraint("fullRankGroups", {
        validatePartial: function(board, lines) {
            var rankedLines = lines.filter(function(line) { return line.rank !== null && line.rank !== undefined; });
            if (rankedLines.some(function(line) {
                return !Number.isInteger(line.rank) || line.rank < 1 || line.rank > lines.length;
            })) return false;
            var values = lines.map(function(line) {
                var digits = line.cells.map(function(cell) { return cellValue(board, cell); });
                return digits.some(function(value) { return !value; }) ? null : Number(digits.join(""));
            });
            if (values.some(function(value) { return value === null; })) return true;
            var ordered = values.slice().sort(function(first, second) { return first - second; });
            return rankedLines.every(function(line) {
                var index = lines.indexOf(line);
                return values[index] === ordered[line.rank - 1];
            });
        }
    });

    registerConstraint("rossiniLines", {
        validatePartial: function(board, clue) {
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var ascending = values[0] < values[1] && values[1] < values[2];
            var descending = values[0] > values[1] && values[1] > values[2];
            if (clue.direction === "ascending") return ascending;
            if (clue.direction === "descending") return descending;
            return !ascending && !descending;
        }
    });

    registerConstraint("cellRelations", {
        validatePartial: function(board, clue) {
            if (clue.relation === "fortress") {
                var shaded = cellValue(board, clue.shaded), unshaded = cellValue(board, clue.unshaded);
                return !shaded || !unshaded || shaded > unshaded;
            }
            if (clue.relation === "trio") {
                var trioValue = cellValue(board, clue.cell);
                return !trioValue || (trioValue >= clue.minimum && trioValue <= clue.maximum);
            }
            if (clue.relation === "average") {
                var center = cellValue(board, clue.center);
                var ends = clue.ends.map(function(cell) { return cellValue(board, cell); });
                if (!center || !ends[0] || !ends[1]) return true;
                var isAverage = center * 2 === ends[0] + ends[1];
                return clue.marked ? isAverage : !isAverage;
            }
            if (clue.relation === "multiplication") {
                var factors = clue.top.map(function(cell) { return cellValue(board, cell); });
                var resultDigits = clue.bottom.map(function(cell) { return cellValue(board, cell); });
                if (factors.some(function(value) { return !value; }) ||
                    resultDigits.some(function(value) { return !value; })) return true;
                var product = factors.reduce(function(total, value) { return total * value; }, 1);
                return Number(resultDigits.join("")) === product;
            }
            if (clue.relation === "clonedstrands") {
                var strands = clue.strands || [];
                if (!strands.length || strands.some(function(strand) { return strand.length !== strands[0].length; })) return false;
                for (var strandIndex = 1; strandIndex < strands.length; strandIndex++) {
                    for (var strandCell = 0; strandCell < strands[0].length; strandCell++) {
                        var referenceValue = cellValue(board, strands[0][strandCell]);
                        var strandValue = cellValue(board, strands[strandIndex][strandCell]);
                        if (referenceValue && strandValue && referenceValue !== strandValue) return false;
                    }
                }
                return true;
            }
            if (clue.relation === "codedpairs") {
                var pairValues = (clue.pairs || []).map(function(pair) {
                    var values = pair.map(function(cell) { return cellValue(board, cell); });
                    return values.some(function(value) { return !value; }) ? null : values.slice().sort().join(":");
                });
                var completePairs = pairValues.filter(function(value) { return value !== null; });
                return completePairs.length < 2 || completePairs.every(function(value) { return value === completePairs[0]; });
            }
            if (clue.relation === "multipledivisor") {
                var values = clue.groups.map(function(group) {
                    if (group.some(function(cell) { return !cellValue(board, cell); })) return 0;
                    return Number(group.map(function(cell) { return cellValue(board, cell); }).join(""));
                });
                if (values.some(function(value) { return !value; })) return true;
                return values.every(function(value, index) {
                    if (!index) return true;
                    return value % values[0] === 0 || values[0] % value === 0;
                });
            }
            if (clue.relation === "clock") {
                var clockDigits = clue.cells.map(function(cell) { return cellValue(board, cell); });
                if (clockDigits.some(function(value) { return !value; })) return true;
                return clockDigits[0] * 10 + clockDigits[1] < 24 && clockDigits[2] * 10 + clockDigits[3] < 60;
            }
            if (clue.relation === "slotmachine") {
                var columns = clue.columns || [];
                if (columns.length < 2) return true;
                var reference = columns[0].map(function(cell) { return cellValue(board, cell); });
                return columns.slice(1).every(function(column) {
                    var values = column.map(function(cell) { return cellValue(board, cell); });
                    for (var shift = 0; shift < SIZE; shift++) {
                        var compatible = true;
                        for (var row = 0; row < SIZE; row++) {
                            if (reference[row] && values[(row + shift) % SIZE] &&
                                reference[row] !== values[(row + shift) % SIZE]) compatible = false;
                        }
                        if (compatible) return true;
                    }
                    return false;
                });
            }
            if (clue.relation === "pinnochio") {
                var mismatches = 0, open = 0;
                (clue.clues || []).forEach(function(item) {
                    var value = cellValue(board, item.cell);
                    if (!value) open++;
                    else if (value !== item.value) mismatches++;
                });
                return mismatches <= 1 && (mismatches === 1 || open > 0);
            }
            if (clue.relation === "wheel") {
                var wheelValues = clue.cells.map(function(cell) { return cellValue(board, cell); });
                for (var rotation = 0; rotation < 4; rotation++) {
                    var possible = true;
                    for (var wheelIndex = 0; wheelIndex < 4; wheelIndex++) {
                        if (wheelValues[wheelIndex] && wheelValues[wheelIndex] !== clue.digits[(wheelIndex + rotation) % 4]) {
                            possible = false;
                        }
                    }
                    if (possible) return true;
                }
                return false;
            }
            return true;
        }
    });

    registerConstraint("catalogLines", {
        validatePartial: function(board, clue) {
            var values = clue.path.map(function(cell) { return cellValue(board, cell); });
            var assigned = values.filter(Boolean);
            if (clue.relation === "paritylines") {
                return assigned.length < 2 || assigned.every(function(value) {
                    return value % 2 === assigned[0] % 2;
                });
            }
            if (clue.relation === "renban") {
                if (new Set(assigned).size !== assigned.length) return false;
                return !assigned.length || Math.max.apply(null, assigned) - Math.min.apply(null, assigned) < values.length;
            }
            if (clue.relation === "creasing") {
                var increasing = true;
                var decreasing = true;
                for (var first = 0; first < values.length; first++) {
                    if (!values[first]) continue;
                    for (var second = first + 1; second < values.length; second++) {
                        if (!values[second]) continue;
                        if (values[first] >= values[second]) increasing = false;
                        if (values[first] <= values[second]) decreasing = false;
                    }
                }
                return increasing || decreasing;
            }
            if (clue.relation === "alternatingstripes") {
                if (new Set(assigned).size !== assigned.length) return false;
                for (var stripeIndex = 1; stripeIndex < values.length - 1; stripeIndex++) {
                    if (!values[stripeIndex - 1] || !values[stripeIndex] || !values[stripeIndex + 1]) continue;
                    var firstStep = values[stripeIndex] - values[stripeIndex - 1];
                    var secondStep = values[stripeIndex + 1] - values[stripeIndex];
                    if (!firstStep || !secondStep || firstStep * secondStep >= 0) return false;
                }
                return true;
            }
            if (clue.relation === "between") {
                if (values.length < 3 || !values[0] || !values[values.length - 1]) return true;
                var low = Math.min(values[0], values[values.length - 1]);
                var high = Math.max(values[0], values[values.length - 1]);
                return values.slice(1, -1).every(function(value) { return !value || (value > low && value < high); });
            }
            if (clue.relation === "equalsumline") {
                var groups = {};
                clue.path.forEach(function(cell) {
                    var box = boxIndex(cell.row, cell.col, board.length);
                    (groups[box] || (groups[box] = [])).push(cell);
                });
                var minPossible = -Infinity, maxPossible = Infinity;
                var keys = Object.keys(groups);
                for (var kIdx = 0; kIdx < keys.length; kIdx++) {
                    var box = keys[kIdx];
                    var cells = groups[box];
                    var sum = 0, blanks = 0;
                    cells.forEach(function(cell) {
                        var val = cellValue(board, cell);
                        if (val) sum += val;
                        else blanks++;
                    });
                    var minS = sum + blanks * 1;
                    var maxS = sum + blanks * board.length;
                    if (blanks === 0) {
                        minS = sum;
                        maxS = sum;
                    }
                    if (minS > minPossible) minPossible = minS;
                    if (maxS < maxPossible) maxPossible = maxS;
                }
                return minPossible <= maxPossible;
            }
            if (clue.relation === "germanwhispers") {
                for (var i = 0; i < values.length - 1; i++) {
                    if (values[i] && values[i+1] && Math.abs(values[i] - values[i+1]) < 5) return false;
                }
                return true;
            }
            if (clue.relation === "factorlines") {
                for (var i = 0; i < values.length - 1; i++) {
                    if (values[i] && values[i+1] && values[i] % values[i+1] !== 0 && values[i+1] % values[i] !== 0) return false;
                }
                return true;
            }
            return true;
        },
        validateComplete: function(board, clue) {
            var values = clue.path.map(function(cell) { return cellValue(board, cell); });
            if (clue.relation === "sequence") {
                if (values.length < 3) return true;
                var step = values[1] - values[0];
                return values.every(function(value, index) { return index === 0 || value - values[index - 1] === step; });
            }
            if (clue.relation === "renban") {
                return Math.max.apply(null, values) - Math.min.apply(null, values) === values.length - 1;
            }
            return true;
        }
    });

    registerConstraint("quadRelations", {
        validatePartial: function(board, clue) {
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            var assigned = values.filter(Boolean);
            if (clue.relation === "quadro") {
                return assigned.length < 4 || !assigned.every(function(value) { return value % 2 === assigned[0] % 2; });
            }
            if (clue.relation === "quadruple") {
                var required = {};
                clue.digits.forEach(function(value) { required[value] = (required[value] || 0) + 1; });
                return Object.keys(required).every(function(value) {
                    var present = assigned.filter(function(digit) { return digit === Number(value); }).length;
                    var open = values.length - assigned.length;
                    return present + open >= required[value];
                });
            }
            if (clue.relation === "exclusion") {
                return clue.digits.every(function(digit) { return assigned.indexOf(digit) === -1; });
            }
            if (clue.relation === "groupsum") {
                var groupSum = assigned.reduce(function(sum, value) { return sum + value; }, 0);
                var groupOpen = values.length - assigned.length;
                return groupSum <= clue.total && groupSum + groupOpen * SIZE >= clue.total &&
                    (groupOpen > 0 || groupSum === clue.total);
            }
            if (clue.relation === "crosssums") {
                return assigned.length < 4 || values[0] + values[3] === values[1] + values[2];
            }
            if (clue.relation === "determinant") {
                return assigned.length < 4 || values[0] * values[3] - values[1] * values[2] === clue.total;
            }
            if (clue.relation === "clockfaces") {
                if (assigned.length < 4) return true;
                var clockwise = [values[0], values[1], values[3], values[2]];
                function oneDescent(sequence) {
                    var descents = 0;
                    for (var cycleIndex = 0; cycleIndex < sequence.length; cycleIndex++) {
                        if (sequence[cycleIndex] > sequence[(cycleIndex + 1) % sequence.length]) descents++;
                    }
                    return descents === 1;
                }
                var increasesClockwise = oneDescent(clockwise);
                var increasesCounter = oneDescent(clockwise.slice().reverse());
                if (clue.kind === "white") return increasesClockwise;
                if (clue.kind === "black") return increasesCounter;
                return !increasesClockwise && !increasesCounter;
            }
            if (assigned.length < 4) return true;
            var first = values[0], second = values[1], third = values[2], fourth = values[3];
            if (clue.relation === "equalsums") return first + fourth === second + third;
            if (clue.relation === "equaldifferences") return Math.abs(first - fourth) === Math.abs(second - third);
            if (clue.relation === "equalproducts") return first * fourth === second * third;
            if (clue.relation === "equalratios") {
                return Math.max(first, fourth) * Math.min(second, third) ===
                    Math.max(second, third) * Math.min(first, fourth);
            }
            if (clue.relation === "consecutivequads") {
                var pairs = 0;
                for (var left = 0; left < values.length; left++) {
                    for (var right = left + 1; right < values.length; right++) {
                        if (Math.abs(values[left] - values[right]) === 1) pairs++;
                    }
                }
                return clue.kind === "black" ? pairs >= 2 : pairs === 1;
            }
            return true;
        }
    });

    registerConstraint("shadedParityGroups", {
        validatePartial: function(board, cells) {
            var parity = null;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                if (parity === null) parity = value % 2;
                else if (value % 2 !== parity) return false;
            }
            return true;
        }
    });

    registerConstraint("regionAllDifferent", {
        validatePartial: function(board, cells) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                var bit = 1 << value;
                if (seen & bit) return false;
                seen |= bit;
            }
            return true;
        }
    });

    registerConstraint("regionCoverage", {
        validatePartial: function(board, cells) {
            var seen = 0;
            var blanks = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (value) seen |= 1 << value;
                else blanks++;
            }
            var missing = countBits(ALL_DIGITS & ~seen);
            return missing <= blanks;
        },
        validateComplete: function(board, cells) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) seen |= 1 << cellValue(board, cells[index]);
            return (seen & ALL_DIGITS) === ALL_DIGITS;
        }
    });

    function consecutiveSetValid(board, cells, allowEqual) {
        var values = [];
        var seen = 0;
        for (var index = 0; index < cells.length; index++) {
            var value = cellValue(board, cells[index]);
            if (!value) continue;
            var bit = 1 << value;
            if (!allowEqual && (seen & bit)) return false;
            seen |= bit;
            values.push(value);
        }
        if (values.length < 2) return true;
        return Math.max.apply(null, values) - Math.min.apply(null, values) <= cells.length - 1;
    }

    registerConstraint("renbanRegions", {
        validatePartial: function(board, cells) {
            return consecutiveSetValid(board, cells, false);
        },
        validateComplete: function(board, cells) {
            var values = cells.map(function(cell) { return cellValue(board, cell); });
            return consecutiveSetValid(board, cells, false) &&
                Math.max.apply(null, values) - Math.min.apply(null, values) === cells.length - 1;
        }
    });

    registerConstraint("cloneGroups", {
        validatePartial: function(board, cells) {
            var value = 0;
            for (var index = 0; index < cells.length; index++) {
                var current = cellValue(board, cells[index]);
                if (!current) continue;
                if (value && current !== value) return false;
                value = current;
            }
            return true;
        }
    });

    registerConstraint("consecutiveCloneGroups", {
        validatePartial: function(board, cells) {
            return consecutiveSetValid(board, cells, false);
        },
        validateComplete: function(board, cells) {
            var values = cells.map(function(cell) { return cellValue(board, cell); });
            return consecutiveSetValid(board, cells, false) &&
                Math.max.apply(null, values) - Math.min.apply(null, values) === cells.length - 1;
        }
    });

    registerConstraint("cloneShapeChecks", {
        validatePartial: function(board, check) {
            return check.valid === true;
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

    // Almost Palindrome: exactly one mismatched pair across the whole line
    registerConstraint("almostPalindromes", {
        validatePartial: function(board, path) {
            var mismatches = 0;
            var half = Math.floor(path.length / 2);
            for (var i = 0; i < half; i++) {
                var a = cellValue(board, path[i]);
                var b = cellValue(board, path[path.length - 1 - i]);
                if (a && b && a !== b) {
                    mismatches++;
                    if (mismatches > 1) return false;
                }
            }
            return true;
        },
        validateComplete: function(board, path) {
            var mismatches = 0;
            var half = Math.floor(path.length / 2);
            for (var i = 0; i < half; i++) {
                var a = cellValue(board, path[i]);
                var b = cellValue(board, path[path.length - 1 - i]);
                if (a !== b) mismatches++;
            }
            return mismatches === 1;
        }
    });

    // Anti-Consecutive: explicitly marked edges must NOT be consecutive
    registerConstraint("antiConsecutive", {
        validatePartial: function(board, pair) {
            var a = cellValue(board, pair[0]);
            var b = cellValue(board, pair[1]);
            return !a || !b || Math.abs(a - b) !== 1;
        }
    });

    // Average Arrows: circle = arithmetic mean of shaft digits
    registerConstraint("averageArrows", {
        validatePartial: function(board, arrow) {
            var circle = cellValue(board, arrow.circle);
            var shaftValues = arrow.shaft.map(function(cell) { return cellValue(board, cell); });
            var assigned = shaftValues.filter(Boolean);
            var blanks = shaftValues.length - assigned.length;
            var total = assigned.reduce(function(s, v) { return s + v; }, 0);
            var n = shaftValues.length;
            if (circle) {
                // circle * n must equal total of shaft (mean relationship)
                // With blanks: total + blanks*1 <= circle*n <= total + blanks*SIZE
                var target = circle * n;
                return total <= target && total + blanks * SIZE >= target && (blanks > 0 || total === target);
            }
            // Circle unknown: at least one integer from 1..SIZE could work
            if (blanks === shaftValues.length) return true; // no info yet
            for (var c = 1; c <= SIZE; c++) {
                var t = c * n;
                if (total <= t && total + blanks * SIZE >= t) return true;
            }
            return false;
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
        if (kind === "VI") return sum === 6;
        if (kind === "XI") return sum === 11;
        return kind === "none-xivi" ? sum !== 6 && sum !== 11 : sum !== 5 && sum !== 10;
    }

    registerConstraint("xv", {
        validatePartial: function(board, clue) {
            var first = cellValue(board, clue.cells[0]);
            var second = cellValue(board, clue.cells[1]);
            if (first && second) {
                return xvAllows(first, second, clue.kind === "none" && clue.family === "xivi" ? "none-xivi" : clue.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && xvAllows(known, candidate,
                    clue.kind === "none" && clue.family === "xivi" ? "none-xivi" : clue.kind)) {
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

    function fadedKropkiAllows(first, second, kind) {
        var consecutive = Math.abs(first - second) === 1;
        var double = first === 2 * second || second === 2 * first;
        if (kind === "white") {
            return consecutive || double;
        }
        return !consecutive && !double;
    }

    registerConstraint("fadedKropki", {
        validatePartial: function(board, dot) {
            var first = cellValue(board, dot.cells[0]);
            var second = cellValue(board, dot.cells[1]);
            if (first && second) {
                return fadedKropkiAllows(first, second, dot.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && fadedKropkiAllows(known, candidate, dot.kind)) {
                    return true;
                }
            }
            return false;
        }
    });

    function hasOddPath(board, size) {
        var start = { row: 0, col: 0 };
        var end = { row: size - 1, col: size - 1 };
        var visited = Array.from({ length: size }, function() { return new Uint8Array(size); });
        var startVal = cellValue(board, start);
        if (startVal !== 0 && (startVal % 2) === 0) return false;
        var endVal = cellValue(board, end);
        if (endVal !== 0 && (endVal % 2) === 0) return false;

        var queue = [start];
        visited[0][0] = 1;
        var head = 0;
        var dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
        while (head < queue.length) {
            var curr = queue[head++];
            if (curr.row === end.row && curr.col === end.col) return true;
            for (var i = 0; i < 4; i++) {
                var nr = curr.row + dr[i], nc = curr.col + dc[i];
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
                    var val = cellValue(board, { row: nr, col: nc });
                    if (val === 0 || (val % 2) !== 0) {
                        visited[nr][nc] = 1;
                        queue.push({ row: nr, col: nc });
                    }
                }
            }
        }
        return false;
    }

    function hasEvenPath(board, size) {
        var start = { row: 0, col: 0 };
        var end = { row: size - 1, col: size - 1 };
        var visited = Array.from({ length: size }, function() { return new Uint8Array(size); });
        var startVal = cellValue(board, start);
        if (startVal !== 0 && (startVal % 2) !== 0) return false;
        var endVal = cellValue(board, end);
        if (endVal !== 0 && (endVal % 2) !== 0) return false;

        var queue = [start];
        visited[0][0] = 1;
        var head = 0;
        var dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
        while (head < queue.length) {
            var curr = queue[head++];
            if (curr.row === end.row && curr.col === end.col) return true;
            for (var i = 0; i < 4; i++) {
                var nr = curr.row + dr[i], nc = curr.col + dc[i];
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
                    var val = cellValue(board, { row: nr, col: nc });
                    if (val === 0 || (val % 2) === 0) {
                        visited[nr][nc] = 1;
                        queue.push({ row: nr, col: nc });
                    }
                }
            }
        }
        return false;
    }

    registerConstraint("oddLabyrinth", {
        validatePartial: function(board) {
            return hasOddPath(board, SIZE);
        }
    });

    registerConstraint("evenPassage", {
        validatePartial: function(board) {
            return hasEvenPath(board, SIZE);
        }
    });

    return {
        SIZE: SIZE,
        registerConstraint: registerConstraint,
        registeredConstraints: registeredConstraints,
        createProblem: createProblem,
        getCandidates: getCandidates,
        getCandidatesAsync: analyzeCandidatesAsync,
        findConflict: findConflict,
        solve: solve
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuCSP;
}
