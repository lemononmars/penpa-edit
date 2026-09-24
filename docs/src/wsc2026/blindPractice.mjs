export function mostRecentCells(previous, selected) {
  if (!Number.isInteger(selected) || selected < 0 || selected >= 36) {
    throw new RangeError('Select a cell from the 6x6 grid.');
  }
  return [...previous.filter(index => index !== selected), selected].slice(-2);
}

export function isComplete(board, entries, solution) {
  return board.length === 6 && entries.length === 6 && solution.length === 6 &&
    board.every((row, r) => row.length === 6 && entries[r].length === 6 && solution[r].length === 6 &&
      row.every((given, c) => (given || entries[r][c]) === solution[r][c]));
}
