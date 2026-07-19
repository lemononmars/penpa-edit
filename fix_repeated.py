import re

with open('docs/js/sudoku_csp.js', 'r') as f:
    text = f.read()

new_repeated = """    registerConstraint("repeatedNeighbors", {
        validatePartial: function(board, shaded) {
            if (!shaded) return true;
            if (!Array.isArray(shaded)) shaded = [shaded];
            var SIZE = board.length;
            var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var isShaded = false;
                    for (var i = 0; i < shaded.length; i++) {
                        if (shaded[i].row === r && shaded[i].col === c) {
                            isShaded = true;
                            break;
                        }
                    }
                    var counts = {};
                    var emptyCount = 0;
                    for (var i = 0; i < offsets.length; i++) {
                        var nr = r + offsets[i][0];
                        var nc = c + offsets[i][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var v = cellValue(board, {row: nr, col: nc});
                            if (!v) emptyCount++;
                            else counts[v] = (counts[v] || 0) + 1;
                        }
                    }
                    var hasDuplicate = Object.keys(counts).some(function(k) { return counts[k] > 1; });
                    if (isShaded && emptyCount === 0 && !hasDuplicate) return false;
                    if (!isShaded && hasDuplicate) return false;
                }
            }
            return true;
        },
        validateComplete: function(board, shaded) {
            if (!shaded) return true;
            if (!Array.isArray(shaded)) shaded = [shaded];
            var SIZE = board.length;
            var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var isShaded = false;
                    for (var i = 0; i < shaded.length; i++) {
                        if (shaded[i].row === r && shaded[i].col === c) {
                            isShaded = true;
                            break;
                        }
                    }
                    var counts = {};
                    for (var i = 0; i < offsets.length; i++) {
                        var nr = r + offsets[i][0];
                        var nc = c + offsets[i][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var v = cellValue(board, {row: nr, col: nc});
                            counts[v] = (counts[v] || 0) + 1;
                        }
                    }
                    var hasDuplicate = Object.keys(counts).some(function(k) { return counts[k] > 1; });
                    if (isShaded && !hasDuplicate) return false;
                    if (!isShaded && hasDuplicate) return false;
                }
            }
            return true;
        }
    });"""

text = re.sub(r'    registerConstraint\("repeatedNeighbors", \{[\s\S]*?validateComplete: function\(board, shaded\) \{[\s\S]*?\}\n    \}\);', new_repeated, text)

with open('docs/js/sudoku_csp.js', 'w') as f:
    f.write(text)
