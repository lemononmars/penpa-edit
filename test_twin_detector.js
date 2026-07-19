const { registerConstraint, registeredConstraints } = require('./docs/js/sudoku_csp.js');
const assert = require('assert');

// Mock
let SIZE = 9;
function cellValue(board, cell) { return board[cell.row][cell.col]; }

const csp = {};
csp.registerConstraint = registerConstraint;
csp.registeredConstraints = registeredConstraints;
const twindetector = csp.registeredConstraints().directionalMarks.validatePartial;

function accepted(clue, boardArr) {
    let board = boardArr.map(row => row.map(v => v));
    return twindetector(board, clue);
}

// 0,1,2 = empty
let b = [
    [0,0,0,0,0,0,0,0,0], // 0
    [0,0,0,0,0,0,0,0,0], // 1
    [0,0,0,0,0,0,0,0,0], // 2
    [0,0,0,0,0,0,0,0,0], // 3
    [0,0,0,0,0,0,0,0,0], // 4
    [0,0,0,0,0,0,0,0,0], // 5
    [0,0,0,0,0,0,0,0,0], // 6
    [0,0,0,0,0,0,0,0,0], // 7
    [0,0,0,0,0,0,0,0,0]  // 8
];
