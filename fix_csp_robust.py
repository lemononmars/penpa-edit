import re

with open('docs/js/sudoku_csp.js', 'r') as f:
    text = f.read()

new_oneKnightStep = """    registerConstraint("oneKnightStep", {
        validatePartial: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            var SIZE = board.length;
            var knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            for (var index = 0; index < starts.length; index++) {
                var cell = starts[index];
                var cellVal = cellValue(board, cell);
                if (!cellVal) continue;
                var matchCount = 0;
                var emptyCount = 0;
                for (var i = 0; i < knightOffsets.length; i++) {
                    var r = cell.row + knightOffsets[i][0];
                    var c = cell.col + knightOffsets[i][1];
                    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
                        var kVal = cellValue(board, { row: r, col: c });
                        if (!kVal) emptyCount++;
                        else if (kVal === cellVal) matchCount++;
                    }
                }
                if (matchCount > 1) return false;
                if (matchCount === 0 && emptyCount === 0) return false;
            }
            return true;
        },
        validateComplete: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            var SIZE = board.length;
            var knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            for (var index = 0; index < starts.length; index++) {
                var cell = starts[index];
                var cellVal = cellValue(board, cell);
                var matchCount = 0;
                for (var i = 0; i < knightOffsets.length; i++) {
                    var r = cell.row + knightOffsets[i][0];
                    var c = cell.col + knightOffsets[i][1];
                    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
                        if (cellValue(board, { row: r, col: c }) === cellVal) matchCount++;
                    }
                }
                if (matchCount !== 1) return false;
            }
            return true;
        }
    });"""

text = re.sub(r'    registerConstraint\("oneKnightStep", \{[\s\S]*?validateComplete: function\(board, cell\) \{[\s\S]*?\}\n    \}\);', new_oneKnightStep, text)

new_escapeStarts = """    registerConstraint("escapeStarts", {
        validatePartial: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            var SIZE = board.length;
            for (var i = 0; i < starts.length; i++) {
                var startCell = starts[i];
                var startVal = cellValue(board, startCell);

                var visited = new Set();
                var queue = [{r: startCell.row, c: startCell.col, expected: startVal}];
                visited.add(startCell.row + "," + startCell.col + "," + startVal);

                var reachable = false;
                var head = 0;
                while (head < queue.length) {
                    var curr = queue[head++];

                    if (curr.expected === 1 || curr.expected === null || curr.expected === undefined) {
                        var edgeVal = cellValue(board, {row: curr.r, col: curr.c});
                        if ((!edgeVal || edgeVal === 1) &&
                            (curr.r === 0 || curr.r === SIZE - 1 || curr.c === 0 || curr.c === SIZE - 1)) {
                            reachable = true;
                            break;
                        }
                    }

                    if (curr.expected === 1) continue;

                    var nextExpected = (curr.expected !== null && curr.expected !== undefined) ? curr.expected - 1 : null;

                    var neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (var j = 0; j < neighbors.length; j++) {
                        var nr = curr.r + neighbors[j][0];
                        var nc = curr.c + neighbors[j][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var nVal = cellValue(board, {row: nr, col: nc});
                            var valid = false;
                            var newExpected = null;
                            if (nextExpected !== null) {
                                if (!nVal || nVal === nextExpected) {
                                    valid = true;
                                    newExpected = nextExpected;
                                }
                            } else {
                                valid = true;
                                newExpected = nVal ? nVal : null;
                            }

                            if (valid) {
                                var key = nr + "," + nc + "," + newExpected;
                                if (!visited.has(key)) {
                                    visited.add(key);
                                    queue.push({r: nr, c: nc, expected: newExpected});
                                }
                            }
                        }
                    }
                }

                if (!reachable) return false;
            }
            return true;
        },
        validateComplete: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            if (!starts.length) return true;
            var SIZE = board.length;

            var allPaths = [];
            for (var i = 0; i < starts.length; i++) {
                var startCell = starts[i];
                var pathsForStart = [];

                function dfs(r, c, currentPath) {
                    currentPath.push(r + "," + c);
                    var val = cellValue(board, {row: r, col: c});

                    if (val === 1) {
                        if (r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1) {
                            pathsForStart.push(currentPath.slice());
                        }
                    } else {
                        var neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                        for (var j = 0; j < neighbors.length; j++) {
                            var nr = r + neighbors[j][0];
                            var nc = c + neighbors[j][1];
                            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                                var nVal = cellValue(board, {row: nr, col: nc});
                                if (nVal === val - 1) {
                                    dfs(nr, nc, currentPath);
                                }
                            }
                        }
                    }
                    currentPath.pop();
                }

                dfs(startCell.row, startCell.col, []);
                if (pathsForStart.length === 0) return false;
                allPaths.push(pathsForStart);
            }

            function backtrack(index, usedCells) {
                if (index === starts.length) return true;
                var paths = allPaths[index];
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    var conflict = false;
                    for (var j = 0; j < path.length; j++) {
                        if (usedCells.has(path[j])) {
                            conflict = true;
                            break;
                        }
                    }
                    if (!conflict) {
                        for (var j = 0; j < path.length; j++) {
                            usedCells.add(path[j]);
                        }
                        if (backtrack(index + 1, usedCells)) return true;
                        for (var j = 0; j < path.length; j++) {
                            usedCells.delete(path[j]);
                        }
                    }
                }
                return false;
            }

            return backtrack(0, new Set());
        }
    });"""

text = re.sub(r'    registerConstraint\("escapeStarts", \{[\s\S]*?validateComplete: function\(board, starts\) \{[\s\S]*?\}\n    \}\);', new_escapeStarts, text)

with open('docs/js/sudoku_csp.js', 'w') as f:
    f.write(text)
