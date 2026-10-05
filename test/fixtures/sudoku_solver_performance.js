const solution = [
    '534678912', '672195348', '198342567', '859761423', '426853791',
    '713924856', '961537284', '287419635', '345286179'
].map(row => Array.from(row, Number));
const blank = () => solution.map(row => row.map(() => 0));
const outside = [];
for (let i = 0; i < 9; i++) {
    for (const cells of [
        [0, 1, 2].map(col => ({ row: i, col })),
        [6, 7, 8].map(col => ({ row: i, col })),
        [0, 1, 2].map(row => ({ row, col: i })),
        [6, 7, 8].map(row => ({ row, col: i }))
    ]) {
        outside.push({ relation: 'outside', cells, clues: cells.map(c => solution[c.row][c.col]) });
    }
}
const pencilmarkCells = solution.flatMap((row, r) => row.map((_, c) => {
    const cell = { row: r, col: c };
    const groups = outside.filter(q => q.cells.some(x => x.row === r && x.col === c));
    return { cell, allowed: [1,2,3,4,5,6,7,8,9].filter(d => groups.every(q => q.clues.includes(d))) };
}));
const differences = [];
solution.forEach((row, r) => row.forEach((value, c) => {
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (r + dr >= 9 || c + dc >= 9) continue;
        differences.push({ kind: 'differences', cells: [{ row: r, col: c }, { row: r + dr, col: c + dc }],
            value: Math.abs(value - solution[r + dr][c + dc]) });
    }
}));
module.exports = { solution, cases: [
    { name: 'pencilmarks-full', board: blank(), constraints: { pencilmarkCells } },
    { name: 'outside-full', board: blank(), constraints: { outsideRelations: outside } },
    { name: 'differences-full', board: blank(), constraints: { wscRules: differences } },
    { name: 'differences-sparse', board: solution.map((row, r) => row.map((d, c) => (r * 9 + c) % 4 === 0 ? d : 0)),
        constraints: { wscRules: differences.filter((_, i) => i % 3 === 0) } }
] };
