const board = {numRows: 9, numCols: 9, cells: []};
for(let r=0; r<9; r++) {
    board.cells.push([]);
    for(let c=0; c<9; c++) board.cells[r].push(null);
}
function cellValue(b, pos) { return b.cells[pos.row][pos.col]; }

board.cells[0][0] = 1; board.cells[1][1] = 1; board.cells[2][2] = 1;
// we have a 1 in a row.

function validateNinePins(board) {
    var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var r = 0; r < board.numRows; r++) {
        for (var c = 0; c < board.numCols; c++) {
            var v = cellValue(board, {row: r, col: c});
            if (v) counts[v]++;
        }
    }

    var found = [false, false, false, false, false, false, false, false, false, false];
    var dirs = [[0,1], [1,0], [1,1], [1,-1]];
    for (var r = 0; r < board.numRows; r++) {
        for (var c = 0; c < board.numCols; c++) {
            for (var d = 0; d < dirs.length; d++) {
                var dr = dirs[d][0], dc = dirs[d][1];
                var r2 = r + 2*dr, c2 = c + 2*dc;
                if (r2 >= 0 && r2 < board.numRows && c2 >= 0 && c2 < board.numCols) {
                    var v1 = cellValue(board, {row: r, col: c});
                    var v2 = cellValue(board, {row: r+dr, col: c+dc});
                    var v3 = cellValue(board, {row: r2, col: c2});
                    if (v1 && v1 === v2 && v1 === v3) {
                        found[v1] = true;
                    }
                }
            }
        }
    }

    for (var i = 1; i <= board.numRows; i++) {
        if (found[i]) continue;
        if (counts[i] === board.numRows) return false;

        var possible = false;
        for (var r = 0; r < board.numRows; r++) {
            for (var c = 0; c < board.numCols; c++) {
                for (var d = 0; d < dirs.length; d++) {
                    var dr = dirs[d][0], dc = dirs[d][1];
                    var r2 = r + 2*dr, c2 = c + 2*dc;
                    if (r2 >= 0 && r2 < board.numRows && c2 >= 0 && c2 < board.numCols) {
                        var v1 = cellValue(board, {row: r, col: c});
                        var v2 = cellValue(board, {row: r+dr, col: c+dc});
                        var v3 = cellValue(board, {row: r2, col: c2});
                        if ((!v1 || v1 === i) && (!v2 || v2 === i) && (!v3 || v3 === i)) {
                            possible = true;
                            break;
                        }
                    }
                }
                if (possible) break;
            }
            if (possible) break;
        }
        if (!possible) return false;
    }
    return true;
}

console.log(validateNinePins(board));
