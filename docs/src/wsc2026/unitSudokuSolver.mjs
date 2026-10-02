export function solveUnitSudoku(values, units, digits, { maxNodes = 500_000, randomize = false, rng = Math.random, limitSolutions = 1 } = {}) {
  const cellCount = values.length, digitCount = digits.length;
  const memberships = Array.from({length:cellCount}, (_, cell) => units.map((unit, id) => unit.includes(cell) ? id : -1).filter((id) => id >= 0));
  const peers = memberships.map((ids, cell) => [...new Set(ids.flatMap((id) => units[id]).filter((other) => other !== cell))]);
  if (values.some((digit) => digit && !digits.includes(digit)) || units.some((unit) => { const filled = unit.map((cell) => values[cell]).filter(Boolean); return new Set(filled).size !== filled.length; })) return {status:'invalid', solution:null, solutions:[], nodes:0};
  // Exact cover: a placement fills one cell and one digit slot in each of
  // its three units. Branch on the slot with the fewest remaining placements,
  // including unit/digit slots (hidden singles), rather than only on cells.
  const columnCount = cellCount + units.length * digitCount;
  const left = [], right = [], up = [], down = [], column = [], row = [], sizes = [];
  for (let id = 0; id <= columnCount; id++) {
    left[id] = id - 1; right[id] = id + 1;
    up[id] = down[id] = id; sizes[id] = 0;
  }
  left[0] = columnCount; right[columnCount] = 0;
  for (let cell = 0; cell < cellCount; cell++) {
    const candidates = values[cell] ? [values[cell]] : digits.filter((digit) => !peers[cell].some((peer) => values[peer] === digit));
    for (const digit of candidates) {
      const headers = [cell + 1, ...memberships[cell].map((unit) => cellCount + unit * digitCount + digits.indexOf(digit) + 1)];
      const nodes = [];
      for (const header of headers) {
        const node = up.length;
        up[node] = up[header]; down[node] = header;
        down[up[header]] = node; up[header] = node;
        column[node] = header; row[node] = cell * digitCount + digits.indexOf(digit); sizes[header]++;
        nodes.push(node);
      }
      nodes.forEach((node, i) => { left[node] = nodes[(i + nodes.length - 1) % nodes.length]; right[node] = nodes[(i + 1) % nodes.length]; });
    }
  }
  function cover(header) {
    right[left[header]] = right[header]; left[right[header]] = left[header];
    for (let i = down[header]; i !== header; i = down[i]) {
      for (let j = right[i]; j !== i; j = right[j]) {
        down[up[j]] = down[j]; up[down[j]] = up[j]; sizes[column[j]]--;
      }
    }
  }
  function uncover(header) {
    for (let i = up[header]; i !== header; i = up[i]) {
      for (let j = left[i]; j !== i; j = left[j]) {
        sizes[column[j]]++; down[up[j]] = j; up[down[j]] = j;
      }
    }
    right[left[header]] = header; left[right[header]] = header;
  }
  const placements = [], solutions = [];
  let nodes = 0, limited = false;
  function search() {
    if (solutions.length >= limitSolutions) return;
    if (!right[0]) {
      const solution = Array(cellCount).fill(0);
      for (const placement of placements) solution[Math.floor(placement / digitCount)] = digits[placement % digitCount];
      solutions.push(solution); return;
    }
    let target = right[0];
    for (let header = right[target]; header; header = right[header]) {
      if (sizes[header] < sizes[target]) target = header;
      if (sizes[target] <= 1) break;
    }
    if (!sizes[target]) return;
    const options = [];
    for (let node = down[target]; node !== target; node = down[node]) options.push(node);
    if (randomize) {
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
    }
    cover(target);
    for (const node of options) {
      if (nodes >= maxNodes) { limited = true; break; }
      nodes++;
      placements.push(row[node]);
      for (let j = right[node]; j !== node; j = right[j]) cover(column[j]);
      search();
      for (let j = left[node]; j !== node; j = left[j]) uncover(column[j]);
      placements.pop();
      if (solutions.length >= limitSolutions || limited) break;
    }
    uncover(target);
  }
  search();
  return { status: limited ? 'limit' : solutions.length ? 'solved' : 'unsatisfiable', solution: solutions[0] || null, solutions, nodes };
}
