const fs = require('fs');

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
let variant = "weighted little killer";
let littleStartRow = 2; // from puzzle.space which is [0, 0, 0, 0]
let littleStartCol = 2;

// The test adds cell (0,0) and (1,1).
// The weight is computed as:
// key = (cell.row + littleStartRow) * puzzle.nx0 + (cell.col + littleStartCol);
// cell (1,1) -> (1 + 2)*13 + (1 + 2) = 3*13 + 3 = 39 + 3 = 42

console.log((1 + 2)*13 + (1 + 2));
