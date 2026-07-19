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
const p = puzzle("weighted little killer", { pu_q: {
    number: { 14: [14, 1, "1"] }, symbol: { 14: [[0, 0, 0, 0, 0, 1, 0, 0], "arrow_eight", 2] },
    surface: { [ (1 + 2)*13 + (2 + 2) ]: 1 }
} });
console.log(p.pu_q.surface);
